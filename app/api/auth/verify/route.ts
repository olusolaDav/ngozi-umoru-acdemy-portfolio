import { NextResponse } from "next/server"
import { getDb } from "@/lib/mongodb"
import { signSession, createSetCookieHeader, checkRateLimit, resetRateLimit } from "@/lib/auth"

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}))
  const { sessionId, code } = body
  if (!sessionId || !code) return NextResponse.json({ error: "invalid" }, { status: 400 })

  const db = await getDb()
  const loginSessions = db.collection("login_sessions")

  // Fetch server-side login session
  const loginSession = await loginSessions.findOne({ sessionId })
  if (!loginSession) return NextResponse.json({ error: "invalid session" }, { status: 401 })
  if (new Date() > new Date(loginSession.expiresAt)) return NextResponse.json({ error: "session expired" }, { status: 401 })

  const userId = loginSession.userId
  const userEmail = loginSession.email
  const users = db.collection("users")
  const user = await users.findOne({ _id: new (await import("mongodb")).ObjectId(userId) })
  if (!user) return NextResponse.json({ error: "not found" }, { status: 404 })

  // Rate-limit verification attempts per email
  const rateLimitKey = `verify:${userEmail}`
  const rateLimit = await checkRateLimit(db, rateLimitKey, 10)
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "too many attempts", retryAfter: rateLimit.retryAfter },
      { status: 429, headers: { "Retry-After": String(rateLimit.retryAfter) } }
    )
  }

  // Validate OTP
  if (new Date() > new Date(loginSession.codeExpires)) {
    // session expired but code is fresh, allow resend
    return NextResponse.json({ error: "code expired" }, { status: 400 })
  }
  if (String(loginSession.verificationCode) !== String(code)) {
    return NextResponse.json({ error: "invalid code" }, { status: 400 })
  }

  // success: clear login session and rate limits, set user session cookie
  await loginSessions.deleteOne({ _id: loginSession._id })
  await resetRateLimit(db, rateLimitKey)
  await resetRateLimit(db, `login:${userEmail}`)

  await users.updateOne({ _id: user._id }, { $set: { emailVerified: true } })

  const sessionToken = signSession({ userId: String(user._id), role: user.role })
  const cookie = createSetCookieHeader("session", sessionToken, { maxAge: 7 * 24 * 60 * 60, httpOnly: true, secure: process.env.NODE_ENV === "production" })

  return new NextResponse(JSON.stringify({ ok: true, mustChangePassword: !!user.mustChangePassword }), { status: 200, headers: { "Content-Type": "application/json", "Set-Cookie": cookie } })
}
