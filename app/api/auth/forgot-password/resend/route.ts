import { NextResponse } from "next/server"
import { getDb } from "@/lib/mongodb"
import { generateOTP, checkRateLimit } from "@/lib/auth"
import { sendEmail, passwordResetEmailTemplate } from "@/lib/email"

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}))
  const { sessionId } = body

  if (!sessionId) {
    return NextResponse.json({ error: "Session ID is required" }, { status: 400 })
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

  // Rate limit resend attempts
  const rateLimitKey = `resend-reset:${session.email}`
  const rateLimit = await checkRateLimit(db, rateLimitKey, 3) // 3 resends per 15 minutes
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Too many resend attempts. Please wait before trying again.", retryAfter: rateLimit.retryAfter },
      { status: 429, headers: { "Retry-After": String(rateLimit.retryAfter) } }
    )
  }

  // Generate new code
  const code = generateOTP(6)
  const codeExpires = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

  await resetSessions.updateOne(
    { _id: session._id },
    { $set: { verificationCode: code, codeExpires } }
  )

  // Get user name for email
  const users = db.collection("users")
  const user = await users.findOne({ email: session.email })

  // Send new code
  try {
    const tpl = passwordResetEmailTemplate({ code, name: user?.name || session.email })
    await sendEmail({ to: session.email, subject: tpl.subject, text: tpl.text, html: tpl.html })
  } catch (error) {
    console.error("Failed to send password reset email:", error)
    return NextResponse.json({ error: "Failed to send email. Please try again." }, { status: 500 })
  }

  return NextResponse.json({ ok: true, message: "New verification code sent" })
}
