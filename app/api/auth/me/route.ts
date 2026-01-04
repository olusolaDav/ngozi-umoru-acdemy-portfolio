import { NextResponse } from "next/server"
import { getDb } from "@/lib/mongodb"
import { verifySession } from "@/lib/auth"

function parseCookies(cookieHeader: string | null) {
  if (!cookieHeader) return {}
  return Object.fromEntries(cookieHeader.split(";").map(c => c.trim().split("=")).map(([k, v]) => [k, decodeURIComponent(v)]))
}

export async function GET(req: Request) {
  const cookieHeader = req.headers.get("cookie")
  const cookies = parseCookies(cookieHeader)
  const session = cookies.session
  if (!session) return NextResponse.json({ user: null })

  const payload = verifySession(session)
  if (!payload) return NextResponse.json({ user: null })

  const userId = (payload as any).userId
  const db = await getDb()
  const users = db.collection("users")
  const user = await users.findOne({ _id: new (await import("mongodb")).ObjectId(userId) })
  if (!user) return NextResponse.json({ user: null })

  const safeUser = { id: String(user._id), email: user.email, name: user.name, role: user.role, createdAt: user.createdAt }
  return NextResponse.json({ user: safeUser })
}
