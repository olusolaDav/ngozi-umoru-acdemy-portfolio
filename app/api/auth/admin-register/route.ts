import { NextResponse } from "next/server"
import { getDb } from "@/lib/mongodb"
import { hashPassword } from "@/lib/auth"

const MAX_ADMINS = 2

export async function GET(req: Request) {
  // Check if maximum number of admins already exists
  const db = await getDb()
  const users = db.collection("users")
  const adminCount = await users.countDocuments({ role: "admin" })
  return NextResponse.json({ adminExists: adminCount >= MAX_ADMINS, adminCount })
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}))
  const { email, name, password } = body

  if (!email || !password || !name) {
    return NextResponse.json({ error: "email, name, and password are required" }, { status: 400 })
  }

  if (password.length < 8) {
    return NextResponse.json({ error: "password must be at least 8 characters" }, { status: 400 })
  }

  const db = await getDb()
  const users = db.collection("users")

  // Check if maximum number of admins already exists
  const adminCount = await users.countDocuments({ role: "admin" })
  if (adminCount >= MAX_ADMINS) {
    return NextResponse.json({ error: `Maximum of ${MAX_ADMINS} admin accounts allowed` }, { status: 400 })
  }

  // Check if email is already registered
  const emailExists = await users.findOne({ email })
  if (emailExists) {
    return NextResponse.json({ error: "email already registered" }, { status: 400 })
  }

  // Create the admin account
  const passwordHash = await hashPassword(password)
  await users.insertOne({
    email,
    name,
    role: "admin",
    passwordHash,
    emailVerified: true,
    mustChangePassword: false,
    verificationCode: null,
    verificationExpires: null,
    inviteToken: null,
    inviteExpires: null,
    createdAt: new Date(),
    updatedAt: new Date()
  })

  return NextResponse.json({ ok: true, message: "Admin account created successfully. Please login." })
}
