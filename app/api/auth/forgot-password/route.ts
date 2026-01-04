import { NextResponse } from "next/server"
import { getDb } from "@/lib/mongodb"
import { generateOTP, checkRateLimit } from "@/lib/auth"
import { sendEmail, passwordResetEmailTemplate } from "@/lib/email"
import { v4 as uuidv4 } from "uuid"

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}))
  const { email } = body

  if (!email) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 })
  }

  const normalizedEmail = email.toLowerCase().trim()
  const db = await getDb()

  // Rate limit forgot password attempts
  const rateLimitKey = `forgot-password:${normalizedEmail}`
  const rateLimit = await checkRateLimit(db, rateLimitKey, 5) // 5 attempts per 15 minutes
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Too many reset attempts. Please try again later.", retryAfter: rateLimit.retryAfter },
      { status: 429, headers: { "Retry-After": String(rateLimit.retryAfter) } }
    )
  }

  // Find user by email
  const users = db.collection("users")
  const user = await users.findOne({ email: normalizedEmail })

  // Always return success even if user not found (security best practice)
  if (!user) {
    // Don't reveal whether email exists
    return NextResponse.json({ 
      ok: true, 
      sessionId: uuidv4(), // Fake session ID
      message: "If an account exists with this email, you will receive a reset code." 
    })
  }

  // Generate OTP and create reset session
  const code = generateOTP(6)
  const sessionId = uuidv4()
  const expiresAt = new Date(Date.now() + 30 * 60 * 1000) // 30 minutes
  const codeExpires = new Date(Date.now() + 10 * 60 * 1000) // Code valid for 10 minutes

  // Store password reset session
  const resetSessions = db.collection("password_reset_sessions")
  
  // Remove any existing reset sessions for this user
  await resetSessions.deleteMany({ userId: user._id.toString() })

  // Create new reset session
  await resetSessions.insertOne({
    sessionId,
    userId: user._id.toString(),
    email: normalizedEmail,
    verificationCode: code,
    codeExpires,
    expiresAt,
    createdAt: new Date(),
    verified: false
  })

  // Send password reset email
  try {
    const tpl = passwordResetEmailTemplate({ code, name: user.name || user.email })
    await sendEmail({ to: normalizedEmail, subject: tpl.subject, text: tpl.text, html: tpl.html })
  } catch (error) {
    console.error("Failed to send password reset email:", error)
    return NextResponse.json({ error: "Failed to send email. Please try again." }, { status: 500 })
  }

  return NextResponse.json({ 
    ok: true, 
    sessionId,
    message: "If an account exists with this email, you will receive a reset code."
  })
}
