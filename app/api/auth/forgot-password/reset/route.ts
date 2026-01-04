import { NextResponse } from "next/server"
import { getDb } from "@/lib/mongodb"
import { hashPassword, resetRateLimit } from "@/lib/auth"

// Password validation regex patterns
const PASSWORD_MIN_LENGTH = 8
const HAS_UPPERCASE = /[A-Z]/
const HAS_LOWERCASE = /[a-z]/
const HAS_NUMBER = /[0-9]/
const HAS_SPECIAL = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/

function validatePassword(password: string): { valid: boolean; errors: string[] } {
  const errors: string[] = []
  
  if (password.length < PASSWORD_MIN_LENGTH) {
    errors.push("Password must be at least 8 characters long")
  }
  if (!HAS_UPPERCASE.test(password)) {
    errors.push("Password must contain at least one uppercase letter")
  }
  if (!HAS_LOWERCASE.test(password)) {
    errors.push("Password must contain at least one lowercase letter")
  }
  if (!HAS_NUMBER.test(password)) {
    errors.push("Password must contain at least one number")
  }
  if (!HAS_SPECIAL.test(password)) {
    errors.push("Password must contain at least one special character")
  }

  return { valid: errors.length === 0, errors }
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}))
  const { sessionId, password } = body

  if (!sessionId || !password) {
    return NextResponse.json({ error: "Session ID and password are required" }, { status: 400 })
  }

  // Validate password strength
  const validation = validatePassword(password)
  if (!validation.valid) {
    return NextResponse.json({ 
      error: "Password does not meet requirements", 
      details: validation.errors 
    }, { status: 400 })
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

  // Check if session has been verified
  if (!session.verified) {
    return NextResponse.json({ error: "Please verify your code first" }, { status: 400 })
  }

  // Update user's password
  const users = db.collection("users")
  const { ObjectId } = await import("mongodb")
  const user = await users.findOne({ _id: new ObjectId(session.userId) })
  
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 })
  }

  const passwordHash = await hashPassword(password)
  await users.updateOne(
    { _id: user._id },
    { 
      $set: { 
        passwordHash, 
        mustChangePassword: false,
        passwordChangedAt: new Date()
      } 
    }
  )

  // Clean up: delete reset session and rate limits
  await resetSessions.deleteOne({ _id: session._id })
  await resetRateLimit(db, `forgot-password:${session.email}`)
  await resetRateLimit(db, `resend-reset:${session.email}`)
  await resetRateLimit(db, `verify-reset:${session.email}`)

  return NextResponse.json({ ok: true, message: "Password reset successfully" })
}
