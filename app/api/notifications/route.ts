// Notifications API for Academic Portfolio
// GET: Get user notifications
// PATCH: Mark notifications as read
// DELETE: Delete/archive notifications

import { NextRequest, NextResponse } from "next/server"
import { verifySession } from "@/lib/auth"
import {
  getNotifications,
  getUnreadNotificationCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  archiveNotification,
  deleteNotification,
} from "@/lib/notifications/notification-service"

function parseCookies(cookieHeader: string | null) {
  if (!cookieHeader) return {}
  return Object.fromEntries(
    cookieHeader
      .split(";")
      .map((c) => c.trim().split("="))
      .map(([k, v]) => [k, decodeURIComponent(v)])
  )
}

// GET: Get notifications for current user
export async function GET(request: NextRequest) {
  try {
    const cookieHeader = request.headers.get("cookie")
    const cookies = parseCookies(cookieHeader)
    const session = cookies.session

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const payload = verifySession(session) as any
    if (!payload) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const unreadOnly = searchParams.get("unreadOnly") === "true"
    const limit = parseInt(searchParams.get("limit") || "50")
    const skip = parseInt(searchParams.get("skip") || "0")
    const countOnly = searchParams.get("countOnly") === "true"
    const type = searchParams.get("type") as any

    if (countOnly) {
      const count = await getUnreadNotificationCount(payload.userId)
      return NextResponse.json({
        success: true,
        unreadCount: count,
      })
    }

    const notifications = await getNotifications(payload.userId, {
      unreadOnly,
      limit,
      skip,
      type,
    })

    const unreadCount = await getUnreadNotificationCount(payload.userId)

    return NextResponse.json({
      success: true,
      notifications,
      unreadCount,
    })
  } catch (error) {
    console.error("Error fetching notifications:", error)
    return NextResponse.json(
      { error: "Failed to fetch notifications" },
      { status: 500 }
    )
  }
}

// PATCH: Mark notification(s) as read
export async function PATCH(request: NextRequest) {
  try {
    const cookieHeader = request.headers.get("cookie")
    const cookies = parseCookies(cookieHeader)
    const session = cookies.session

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const payload = verifySession(session) as any
    if (!payload) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 })
    }

    const body = await request.json()
    const { notificationId, markAll } = body

    if (markAll) {
      const count = await markAllNotificationsAsRead(payload.userId)
      return NextResponse.json({
        success: true,
        message: `${count} notifications marked as read`,
      })
    }

    if (!notificationId) {
      return NextResponse.json(
        { error: "Notification ID is required" },
        { status: 400 }
      )
    }

    await markNotificationAsRead(notificationId)

    return NextResponse.json({
      success: true,
      message: "Notification marked as read",
    })
  } catch (error) {
    console.error("Error marking notification as read:", error)
    return NextResponse.json(
      { error: "Failed to mark notification as read" },
      { status: 500 }
    )
  }
}

// DELETE: Archive or delete a notification
export async function DELETE(request: NextRequest) {
  try {
    const cookieHeader = request.headers.get("cookie")
    const cookies = parseCookies(cookieHeader)
    const session = cookies.session

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const payload = verifySession(session) as any
    if (!payload) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const notificationId = searchParams.get("id")
    const archive = searchParams.get("archive") === "true"

    if (!notificationId) {
      return NextResponse.json(
        { error: "Notification ID is required" },
        { status: 400 }
      )
    }

    if (archive) {
      await archiveNotification(notificationId)
      return NextResponse.json({
        success: true,
        message: "Notification archived",
      })
    }

    await deleteNotification(notificationId)

    return NextResponse.json({
      success: true,
      message: "Notification deleted",
    })
  } catch (error) {
    console.error("Error deleting notification:", error)
    return NextResponse.json(
      { error: "Failed to delete notification" },
      { status: 500 }
    )
  }
}
