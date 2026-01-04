import { NextResponse } from "next/server"
import { getDb } from "@/lib/mongodb"
import { generateOTP } from "@/lib/auth"
import { sendEmail, otpEmailTemplate } from "@/lib/email"

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}))
  const { sessionId } = body
  if (!sessionId) return NextResponse.json({ error: "sessionId required" }, { status: 400 })

  const db = await getDb()
  const loginSessions = db.collection("login_sessions")
  const loginSession = await loginSessions.findOne({ sessionId })
  if (!loginSession) return NextResponse.json({ error: "invalid session" }, { status: 401 })
  if (new Date() > new Date(loginSession.expiresAt)) return NextResponse.json({ error: "session expired" }, { status: 401 })

  // Generate new OTP
  const code = generateOTP(6)
  const codeExpires = new Date(Date.now() + 10 * 60 * 1000)
  await loginSessions.updateOne({ _id: loginSession._id }, { $set: { verificationCode: code, codeExpires } })

  const tpl = otpEmailTemplate({ code })
  await sendEmail({ to: loginSession.email, subject: tpl.subject, text: tpl.text, html: tpl.html })

  return NextResponse.json({ ok: true })
}
