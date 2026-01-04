import { NextResponse } from "next/server"
import { getDb } from "@/lib/mongodb"
import { hashPassword, verifySession } from "@/lib/auth"
import { v4 as uuidv4 } from "uuid"
import { sendEmail, inviteEmailTemplate } from "@/lib/email"

function parseCookies(cookieHeader: string | null) {
  if (!cookieHeader) return {}
  return Object.fromEntries(cookieHeader.split(";").map(c => c.trim().split("=")).map(([k, v]) => [k, decodeURIComponent(v)]))
}

export async function POST(req: Request) {
  // Authenticate the request using session cookie
  const cookieHeader = req.headers.get("cookie")
  const cookies = parseCookies(cookieHeader)
  const session = cookies.session
  if (!session) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  }

  const payload = verifySession(session)
  if (!payload || (payload as any).role !== "admin") {
    return NextResponse.json({ error: "forbidden: admin role required" }, { status: 403 })
  }

  const body = await req.json().catch(() => ({}))
  const { email, name, role = "client", defaultPassword, companyName, sector } = body
  if (!email) return NextResponse.json({ error: "email required" }, { status: 400 })

  const db = await getDb()
  const users = db.collection("users")

  const existing = await users.findOne({ email })
  if (existing) return NextResponse.json({ error: "user exists" }, { status: 400 })

  const password = defaultPassword || uuidv4().slice(0, 10)
  const passwordHash = await hashPassword(password)
  const inviteToken = uuidv4()
  const inviteExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

  const user = {
    email,
    name: name || "",
    role,
    passwordHash,
    emailVerified: false,
    mustChangePassword: true,
    verificationCode: null,
    verificationExpires: null,
    inviteToken,
    inviteExpires,
    createdAt: new Date(),
    companyName: companyName || name || "",
    sector: sector || null
  }

  await users.insertOne(user)

  const appUrl = process.env.APP_URL || "http://localhost:3000"
  const inviteLink = `${appUrl}/auth/login`
  const tpl = inviteEmailTemplate({ name: user.name, email, defaultPassword: password, inviteLink })
  await sendEmail({ to: email, subject: tpl.subject, text: tpl.text, html: tpl.html })

  return NextResponse.json({ ok: true })
}
