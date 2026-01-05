import { NextResponse } from "next/server"
import { verifySession } from "@/lib/auth"
import { getDb } from "@/lib/mongodb"

function parseCookies(cookieHeader: string | null) {
  if (!cookieHeader) return {}
  return Object.fromEntries(
    cookieHeader
      .split(";")
      .map(c => c.trim().split("="))
      .map(([k, v]) => [k, decodeURIComponent(v)])
  )
}

// GET - Fetch admin settings
export async function GET(req: Request) {
  try {
    const cookieHeader = req.headers.get("cookie")
    const cookies = parseCookies(cookieHeader)
    const session = cookies.session

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const payload = verifySession(session)
    if (!payload || (payload as any).role !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    const db = await getDb()
    const userId = (payload as any).userId

    // Fetch settings for this admin
    const settings = await db.collection("admin_settings").findOne({ userId })

    if (!settings) {
      // Return defaults
      return NextResponse.json({
        ok: true,
        notifications: {
          emailNotifications: true,
          contactFormAlerts: true,
          blogCommentAlerts: true,
          commentReplyAlerts: true,
          loginAlerts: true,
          weeklyDigest: false,
        },
        security: {
          twoFactorEnabled: false,
          sessionTimeout: 30,
          loginAlerts: true,
        },
      })
    }

    return NextResponse.json({
      ok: true,
      notifications: settings.notifications || {
        emailNotifications: true,
        contactFormAlerts: true,
        blogCommentAlerts: true,
        commentReplyAlerts: true,
        loginAlerts: true,
        weeklyDigest: false,
      },
      security: settings.security || {
        twoFactorEnabled: false,
        sessionTimeout: 30,
        loginAlerts: true,
      },
    })
  } catch (error) {
    console.error("GET /api/admin/settings error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// PUT - Update admin settings
export async function PUT(req: Request) {
  try {
    const cookieHeader = req.headers.get("cookie")
    const cookies = parseCookies(cookieHeader)
    const session = cookies.session

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const payload = verifySession(session)
    if (!payload || (payload as any).role !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    const db = await getDb()
    const userId = (payload as any).userId
    const body = await req.json()

    const updateData: any = {
      userId,
      updatedAt: new Date(),
    }

    if (body.notifications) {
      updateData.notifications = {
        emailNotifications: body.notifications.emailNotifications ?? true,
        contactFormAlerts: body.notifications.contactFormAlerts ?? true,
        blogCommentAlerts: body.notifications.blogCommentAlerts ?? true,
        commentReplyAlerts: body.notifications.commentReplyAlerts ?? true,
        loginAlerts: body.notifications.loginAlerts ?? true,
        weeklyDigest: body.notifications.weeklyDigest ?? false,
      }
    }

    if (body.security) {
      updateData.security = {
        twoFactorEnabled: body.security.twoFactorEnabled ?? false,
        sessionTimeout: body.security.sessionTimeout ?? 30,
        loginAlerts: body.security.loginAlerts ?? true,
      }
    }

    await db.collection("admin_settings").updateOne(
      { userId },
      { $set: updateData },
      { upsert: true }
    )

    return NextResponse.json({ ok: true, message: "Settings updated successfully" })
  } catch (error) {
    console.error("PUT /api/admin/settings error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
