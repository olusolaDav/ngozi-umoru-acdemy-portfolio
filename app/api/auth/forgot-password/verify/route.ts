import { NextResponse } from "next/server"
import { getDb } from "@/lib/mongodb"
import { checkRateLimit, resetRateLimit } from "@/lib/auth"

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}))
  const { sessionId, code } = body

  if (!sessionId || !code) {
    return NextResponse.json({ error: "Session ID and code are required" }, { status: 400 })
  }

  const db = await getDb()
  const resetSessions = db.collection("password_reset_sessions")

  // Find the reset session
  const session = await resetSessions.findOne({ sessionId })
  if (!session) {
    return NextResponse.json({ error: "Invalid or expired session" }, { status: 401 })
  }

  // Check if session expired
  if (new Date() > new Date(session.expiresAt)) {
    await resetSessions.deleteOne({ _id: session._id })
    return NextResponse.json({ error: "Session expired. Please request a new reset." }, { status: 401 })
  }

  // Rate limit verification attempts
  const rateLimitKey = `verify-reset:${session.email}`
  const rateLimit = await checkRateLimit(db, rateLimitKey, 10) // 10 attempts per 15 minutes
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Too many verification attempts. Please try again later.", retryAfter: rateLimit.retryAfter },
      { status: 429, headers: { "Retry-After": String(rateLimit.retryAfter) } }
    )
  }

  // Check if code expired
  if (new Date() > new Date(session.codeExpires)) {
    return NextResponse.json({ error: "Code expired. Please request a new one." }, { status: 400 })
  }

  // Verify code
  if (String(session.verificationCode) !== String(code)) {
    return NextResponse.json({ error: "Invalid verification code" }, { status: 400 })
  }

  // Mark session as verified
  await resetSessions.updateOne(
    { _id: session._id },
    { $set: { verified: true } }
  )

  // Reset rate limits on successful verification
  await resetRateLimit(db, rateLimitKey)

  return NextResponse.json({ ok: true, message: "Code verified successfully" })
}
