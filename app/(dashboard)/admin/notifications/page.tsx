"use client"

import { useState, useEffect, useCallback } from "react"
import { AdminDashboardHeader } from "@/components/dashboard/admin-dashboard-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Bell,
  Mail,
  MessageSquare,
  LogIn,
  Check,
  CheckCheck,
  Trash2,
  Archive,
  Loader2,
  Filter,
  RefreshCw,
} from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { toast } from "sonner"
import Link from "next/link"
import { cn } from "@/lib/utils"

interface Notification {
  notificationId: string
  type: "contact_message" | "blog_comment" | "comment_reply" | "login_alert" | "weekly_digest"
  title: string
  message: string
  priority: "low" | "normal" | "high"
  relatedId?: string
  relatedType?: "contact" | "blog_post" | "comment"
  relatedTitle?: string
  relatedUrl?: string
  senderName?: string
  senderEmail?: string
  isRead: boolean
  createdAt: string
}

const notificationIcons: Record<string, typeof Bell> = {
  contact_message: Mail,
  blog_comment: MessageSquare,
  comment_reply: MessageSquare,
  login_alert: LogIn,
  weekly_digest: Bell,
}

const notificationColors: Record<string, string> = {
  contact_message: "bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400",
  blog_comment: "bg-purple-100 text-purple-600 dark:bg-purple-950 dark:text-purple-400",
  comment_reply: "bg-violet-100 text-violet-600 dark:bg-violet-950 dark:text-violet-400",
  login_alert: "bg-green-100 text-green-600 dark:bg-green-950 dark:text-green-400",
  weekly_digest: "bg-orange-100 text-orange-600 dark:bg-orange-950 dark:text-orange-400",
}

const priorityColors: Record<string, string> = {
  high: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400",
  normal: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  low: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("all")
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  const fetchNotifications = useCallback(async () => {
    try {
      const params = new URLSearchParams()
      if (activeTab === "unread") params.set("unreadOnly", "true")
      
      const res = await fetch(`/api/notifications?${params.toString()}`)
      const data = await res.json()

      if (data.success) {
        setNotifications(data.notifications)
        setUnreadCount(data.unreadCount)
      }
    } catch (error) {
      console.error("Error fetching notifications:", error)
      toast.error("Failed to fetch notifications")
    } finally {
      setIsLoading(false)
    }
  }, [activeTab])

  useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications])

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      const res = await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationId }),
      })

      if (res.ok) {
        setNotifications((prev) =>
          prev.map((n) =>
            n.notificationId === notificationId ? { ...n, isRead: true } : n
          )
        )
        setUnreadCount((prev) => Math.max(0, prev - 1))
      }
    } catch (error) {
      toast.error("Failed to mark notification as read")
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      const res = await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markAll: true }),
      })

      if (res.ok) {
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
        setUnreadCount(0)
        toast.success("All notifications marked as read")
      }
    } catch (error) {
      toast.error("Failed to mark all as read")
    }
  }

  const handleDelete = async (notificationId: string) => {
    try {
      const res = await fetch(`/api/notifications?id=${notificationId}`, {
        method: "DELETE",
      })

      if (res.ok) {
        setNotifications((prev) =>
          prev.filter((n) => n.notificationId !== notificationId)
        )
        toast.success("Notification deleted")
      }
    } catch (error) {
      toast.error("Failed to delete notification")
    }
  }

  const handleArchive = async (notificationId: string) => {
    try {
      const res = await fetch(
        `/api/notifications?id=${notificationId}&archive=true`,
        { method: "DELETE" }
      )

      if (res.ok) {
        setNotifications((prev) =>
          prev.filter((n) => n.notificationId !== notificationId)
        )
        toast.success("Notification archived")
      }
    } catch (error) {
      toast.error("Failed to archive notification")
    }
  }

  const filteredNotifications = notifications.filter((n) => {
    if (activeTab === "all") return true
    if (activeTab === "unread") return !n.isRead
    return n.type === activeTab
  })

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-gray-50/50 dark:bg-gray-950">
      <AdminDashboardHeader
        title="Notifications"
        description="Stay updated with contact messages, comments, and activity"
        breadcrumbs={[
          { label: "Dashboard", href: "/admin" },
          { label: "Notifications" },
        ]}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={fetchNotifications}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            {unreadCount > 0 && (
              <Button size="sm" onClick={handleMarkAllAsRead}>
                <CheckCheck className="h-4 w-4 mr-2" />
                Mark All Read
              </Button>
            )}
          </div>
        }
      />

      <div className="flex-1 p-6">
        <div className="max-w-4xl mx-auto">
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-950">
                    <Bell className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{notifications.length}</p>
                    <p className="text-xs text-muted-foreground">Total</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-950">
                    <Mail className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{unreadCount}</p>
                    <p className="text-xs text-muted-foreground">Unread</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-950">
                    <MessageSquare className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">
                      {notifications.filter((n) => n.type === "blog_comment" || n.type === "comment_reply").length}
                    </p>
                    <p className="text-xs text-muted-foreground">Comments</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-green-100 dark:bg-green-950">
                    <Mail className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">
                      {notifications.filter((n) => n.type === "contact_message").length}
                    </p>
                    <p className="text-xs text-muted-foreground">Contacts</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="unread">
                Unread {unreadCount > 0 && <Badge variant="secondary" className="ml-1">{unreadCount}</Badge>}
              </TabsTrigger>
              <TabsTrigger value="contact_message">Contacts</TabsTrigger>
              <TabsTrigger value="blog_comment">Comments</TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Notifications List */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Recent Notifications</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : filteredNotifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Bell className="h-12 w-12 text-muted-foreground/50 mb-4" />
                  <p className="text-muted-foreground">No notifications yet</p>
                  <p className="text-sm text-muted-foreground/70">
                    You'll see notifications here when you receive new messages or comments
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {filteredNotifications.map((notification) => {
                    const Icon = notificationIcons[notification.type] || Bell
                    const iconColor = notificationColors[notification.type] || "bg-gray-100 text-gray-600"

                    return (
                      <div
                        key={notification.notificationId}
                        className={cn(
                          "p-4 hover:bg-muted/50 transition-colors",
                          !notification.isRead && "bg-blue-50/50 dark:bg-blue-950/20"
                        )}
                      >
                        <div className="flex items-start gap-4">
                          <div className={cn("p-2 rounded-lg shrink-0", iconColor)}>
                            <Icon className="h-5 w-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <h4 className={cn(
                                    "font-medium text-sm",
                                    !notification.isRead && "font-semibold"
                                  )}>
                                    {notification.title}
                                  </h4>
                                  {!notification.isRead && (
                                    <span className="h-2 w-2 rounded-full bg-blue-500" />
                                  )}
                                  {notification.priority === "high" && (
                                    <Badge variant="destructive" className="text-[10px] h-5">
                                      High
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-sm text-muted-foreground line-clamp-2">
                                  {notification.message}
                                </p>
                                {notification.senderName && (
                                  <p className="text-xs text-muted-foreground mt-1">
                                    From: {notification.senderName}
                                    {notification.senderEmail && ` (${notification.senderEmail})`}
                                  </p>
                                )}
                              </div>
                              <span className="text-xs text-muted-foreground whitespace-nowrap">
                                {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 mt-3">
                              {notification.relatedUrl && (
                                <Link href={notification.relatedUrl}>
                                  <Button variant="outline" size="sm">
                                    View Details
                                  </Button>
                                </Link>
                              )}
                              {!notification.isRead && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleMarkAsRead(notification.notificationId)}
                                >
                                  <Check className="h-4 w-4 mr-1" />
                                  Mark Read
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleArchive(notification.notificationId)}
                              >
                                <Archive className="h-4 w-4 mr-1" />
                                Archive
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                onClick={() => handleDelete(notification.notificationId)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
