import { NextResponse } from "next/server"
import { getDb } from "@/lib/mongodb"
import { verifySession, hashPassword } from "@/lib/auth"

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

function parseCookies(cookieHeader: string | null) {
  if (!cookieHeader) return {}
  return Object.fromEntries(cookieHeader.split(";").map(c => c.trim().split("=")).map(([k, v]) => [k, decodeURIComponent(v)]))
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}))
  const { password } = body
  if (!password) return NextResponse.json({ error: "password required" }, { status: 400 })

  // Validate password strength
  const validation = validatePassword(password)
  if (!validation.valid) {
    return NextResponse.json({ 
      error: "Password does not meet requirements", 
      details: validation.errors 
    }, { status: 400 })
  }

  const cookieHeader = req.headers.get("cookie")
  const cookies = parseCookies(cookieHeader)
  const session = cookies.session
  if (!session) return NextResponse.json({ error: "unauthenticated" }, { status: 401 })

  const payload = verifySession(session)
  if (!payload) return NextResponse.json({ error: "invalid session" }, { status: 401 })

  const userId = (payload as any).userId
  const db = await getDb()
  const users = db.collection("users")
  const user = await users.findOne({ _id: new (await import("mongodb")).ObjectId(userId) })
  if (!user) return NextResponse.json({ error: "not found" }, { status: 404 })

  const passwordHash = await hashPassword(password)
  await users.updateOne({ _id: user._id }, { $set: { passwordHash, mustChangePassword: false, passwordChangedAt: new Date() } })

  return NextResponse.json({ ok: true })
}
