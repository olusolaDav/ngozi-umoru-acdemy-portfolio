// Dashboard Overview API
// GET: Fetch dashboard statistics and recent activity

import { NextRequest, NextResponse } from "next/server"
import { verifySession } from "@/lib/auth"
import { getDb } from "@/lib/mongodb"
import { getDashboardStats, getNotifications } from "@/lib/notifications/notification-service"

function parseCookies(cookieHeader: string | null) {
  if (!cookieHeader) return {}
  return Object.fromEntries(
    cookieHeader
      .split(";")
      .map((c) => c.trim().split("="))
      .map(([k, v]) => [k, decodeURIComponent(v)])
  )
}

export async function GET(request: NextRequest) {
  try {
    const cookieHeader = request.headers.get("cookie")
    const cookies = parseCookies(cookieHeader)
    const session = cookies.session

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const payload = verifySession(session) as any
    if (!payload || payload.role !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    const db = await getDb()
    const userId = payload.userId

    // Get dashboard stats
    const stats = await getDashboardStats(userId)

    // Get recent blog posts
    const recentPosts = await db
      .collection("blog_posts")
      .find({})
      .sort({ createdAt: -1 })
      .limit(5)
      .toArray()

    // Get recent contacts
    const recentContacts = await db
      .collection("contacts")
      .find({})
      .sort({ createdAt: -1 })
      .limit(5)
      .toArray()

    // Get recent notifications
    const recentNotifications = await getNotifications(userId, { limit: 5 })

    // Get recent activity (combined and sorted)
    const recentActivity = [
      ...recentContacts.map((c: any) => ({
        id: c._id.toString(),
        type: "contact" as const,
        title: `New message from ${c.name || c.fullName}`,
        description: c.subject || c.message?.substring(0, 50) || "Contact submission",
        timestamp: c.createdAt,
        status: c.status,
        url: "/admin/contacts",
      })),
      ...recentPosts.map((p: any) => ({
        id: p._id.toString(),
        type: "blog" as const,
        title: p.title,
        description: `Blog post ${p.status === "published" ? "published" : "created"}`,
        timestamp: p.createdAt,
        status: p.status,
        url: `/admin/blog/${p._id}`,
      })),
    ]
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 10)

    return NextResponse.json({
      ok: true,
      stats,
      recentPosts: recentPosts.map((p: any) => ({
        _id: p._id.toString(),
        title: p.title,
        slug: p.slug,
        status: p.status,
        views: p.views || 0,
        createdAt: p.createdAt,
      })),
      recentContacts: recentContacts.map((c: any) => ({
        _id: c._id.toString(),
        name: c.name || c.fullName,
        email: c.email,
        subject: c.subject || c.purpose,
        status: c.status,
        createdAt: c.createdAt,
      })),
      recentNotifications: recentNotifications.map((n) => ({
        notificationId: n.notificationId,
        type: n.type,
        title: n.title,
        message: n.message,
        isRead: n.isRead,
        createdAt: n.createdAt,
        relatedUrl: n.relatedUrl,
      })),
      recentActivity,
    })
  } catch (error) {
    console.error("Error fetching dashboard data:", error)
    return NextResponse.json(
      { error: "Failed to fetch dashboard data" },
      { status: 500 }
    )
  }
}
