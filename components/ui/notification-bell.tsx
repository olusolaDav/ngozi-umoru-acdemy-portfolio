"use client"

import { useState, useEffect, useCallback } from "react"
import { Bell, Check, CheckCheck, Loader2, AlertCircle, MessageSquare, FileText, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import Link from "next/link"

interface Notification {
  notificationId: string
  type: "form_submitted" | "form_flagged" | "form_cleared" | "review_added" | "form_assigned" | "assignment_updated"
  title: string
  message: string
  link?: string
  isRead: boolean
  createdAt: string
  metadata?: {
    formId?: string
    submissionId?: string
    formName?: string
    senderName?: string
  }
}

export function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  const fetchNotifications = useCallback(async () => {
    try {
      const response = await fetch("/api/notifications")
      const result = await response.json()

      if (result.success) {
        setNotifications(result.notifications || [])
        setUnreadCount(result.unreadCount || 0)
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error)
    }
  }, [])

  useEffect(() => {
    fetchNotifications()
    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000)
    return () => clearInterval(interval)
  }, [fetchNotifications])

  const markAsRead = async (notificationId: string) => {
    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationId, isRead: true }),
      })
      
      setNotifications(prev => 
        prev.map(n => n.notificationId === notificationId ? { ...n, isRead: true } : n)
      )
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (error) {
      console.error("Failed to mark notification as read:", error)
    }
  }

  const markAllAsRead = async () => {
    setIsLoading(true)
    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markAllRead: true }),
      })
      
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
      setUnreadCount(0)
    } catch (error) {
      console.error("Failed to mark all as read:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "form_flagged":
        return <AlertCircle className="h-4 w-4 text-red-500" />
      case "form_cleared":
        return <Check className="h-4 w-4 text-green-500" />
      case "review_added":
        return <MessageSquare className="h-4 w-4 text-blue-500" />
      case "form_submitted":
        return <FileText className="h-4 w-4 text-purple-500" />
      default:
        return <Bell className="h-4 w-4 text-gray-500" />
    }
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diff < 60) return "Just now"
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
    if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`
    return date.toLocaleDateString()
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="relative"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-red-500 text-white text-xs"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-3 border-b">
          <h4 className="font-semibold">Notifications</h4>
          {unreadCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={markAllAsRead}
              disabled={isLoading}
              className="text-xs h-7"
            >
              {isLoading ? (
                <Loader2 className="h-3 w-3 animate-spin mr-1" />
              ) : (
                <CheckCheck className="h-3 w-3 mr-1" />
              )}
              Mark all read
            </Button>
          )}
        </div>

        <ScrollArea className="h-[300px]">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-gray-500">
              <Bell className="h-8 w-8 mb-2 opacity-50" />
              <p className="text-sm">No notifications</p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification) => (
                <div
                  key={notification.notificationId}
                  className={cn(
                    "p-3 hover:bg-gray-50 transition-colors cursor-pointer",
                    !notification.isRead && "bg-blue-50"
                  )}
                  onClick={() => {
                    if (!notification.isRead) {
                      markAsRead(notification.notificationId)
                    }
                    if (notification.link) {
                      setIsOpen(false)
                    }
                  }}
                >
                  {notification.link ? (
                    <Link href={notification.link} className="block">
                      <NotificationContent 
                        notification={notification} 
                        icon={getNotificationIcon(notification.type)}
                        formatTime={formatTime}
                      />
                    </Link>
                  ) : (
                    <NotificationContent 
                      notification={notification} 
                      icon={getNotificationIcon(notification.type)}
                      formatTime={formatTime}
                    />
                  )}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        {notifications.length > 0 && (
          <div className="p-2 border-t">
            <Link href="/dashboard/notifications">
              <Button variant="ghost" size="sm" className="w-full text-xs">
                View all notifications
              </Button>
            </Link>
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}

function NotificationContent({ 
  notification, 
  icon, 
  formatTime 
}: { 
  notification: Notification
  icon: React.ReactNode
  formatTime: (date: string) => string
}) {
  return (
    <div className="flex gap-3">
      <div className="flex-shrink-0 mt-1">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">
          {notification.title}
        </p>
        <p className="text-xs text-gray-500 line-clamp-2 mt-0.5">
          {notification.message}
        </p>
        <p className="text-xs text-gray-400 mt-1">
          {formatTime(notification.createdAt)}
        </p>
      </div>
      {!notification.isRead && (
        <div className="flex-shrink-0">
          <div className="h-2 w-2 bg-blue-500 rounded-full" />
        </div>
      )}
    </div>
  )
}
