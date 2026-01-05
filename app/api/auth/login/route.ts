import { NextResponse } from "next/server"
import { getDb } from "@/lib/mongodb"
import { generateOTP, checkRateLimit } from "@/lib/auth"
import { sendEmail, otpEmailTemplate } from "@/lib/email"
import { v4 as uuidv4 } from "uuid"

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}))
  const { email, password } = body
  if (!email || !password) return NextResponse.json({ error: "invalid" }, { status: 400 })

  const db = await getDb()

  // Rate-limit login attempts per email
  const rateLimitKey = `login:${email}`
  const rateLimit = await checkRateLimit(db, rateLimitKey, 5)
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "too many attempts", retryAfter: rateLimit.retryAfter },
      { status: 429, headers: { "Retry-After": String(rateLimit.retryAfter) } }
    )
  }

  const users = db.collection("users")
  const user = await users.findOne({ email })
  if (!user) return NextResponse.json({ error: "invalid credentials" }, { status: 401 })

  // verify password using bcrypt (compare on server)
  const bcrypt = (await import("bcryptjs")).default
  const ok = await bcrypt.compare(password, user.passwordHash)
  if (!ok) return NextResponse.json({ error: "invalid credentials" }, { status: 401 })

  // success: generate OTP and store server-side login session
  const code = generateOTP(6)
  const codeExpires = new Date(Date.now() + 10 * 60 * 1000) // OTP valid for 10 min

  const sessionId = uuidv4()
  const loginSessions = db.collection("login_sessions")
  await loginSessions.insertOne({
    sessionId,
    userId: String(user._id),
    email: user.email,
    verificationCode: code,
    codeExpires,
    createdAt: new Date(),
    expiresAt: new Date(Date.now() + 15 * 60 * 1000) // Session valid for 15 min
  })

  // Send verification email
  try {
    const tpl = otpEmailTemplate({ code })
    const emailResult = await sendEmail({ to: email, subject: tpl.subject, text: tpl.text, html: tpl.html })
    console.log("Verification code email sent successfully to:", email, "Code:", code)
  } catch (emailError) {
    console.error("Failed to send verification email:", emailError)
    // Delete the session since email failed
    await loginSessions.deleteOne({ sessionId })
    return NextResponse.json({ error: "Failed to send verification email. Please try again." }, { status: 500 })
  }

  return NextResponse.json({ requiresVerification: true, sessionId })
}
