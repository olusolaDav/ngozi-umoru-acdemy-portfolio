"use client"

import { useState, useMemo } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { X, Trash2, CheckSquare } from "lucide-react"
import { cn } from "@/lib/utils"
import { EmptyState } from "./empty-state"
import { mockNotifications, type Notification } from "@/lib/blog-data"

interface NotificationsPanelProps {
  open: boolean
  onClose: () => void
}

type NotificationTab = "all" | "forms" | "blog"

export function NotificationsPanel({ open, onClose }: NotificationsPanelProps) {
  const [activeTab, setActiveTab] = useState<NotificationTab>("all")
  const [selectMode, setSelectMode] = useState(false)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [notifications, setNotifications] = useState(mockNotifications)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 6

  // Filter notifications by tab
  const filteredNotifications = useMemo(() => {
    if (activeTab === "all") return notifications
    if (activeTab === "forms")
      return notifications.filter((n) => n.type === "form" || n.type === "response" || n.type === "review")
    return notifications.filter((n) => n.type === "comment" || n.type === "share" || n.type === "published")
  }, [notifications, activeTab])

  // Pagination
  const totalPages = Math.ceil(filteredNotifications.length / itemsPerPage)
  const paginatedNotifications = filteredNotifications.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  )

  // Counts
  const allCount = notifications.length
  const formsCount = notifications.filter(
    (n) => n.type === "form" || n.type === "response" || n.type === "review",
  ).length
  const blogCount = notifications.filter(
    (n) => n.type === "comment" || n.type === "share" || n.type === "published",
  ).length

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(paginatedNotifications.map((n) => n._id))
    } else {
      setSelectedIds([])
    }
  }

  const handleSelect = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds((prev) => [...prev, id])
    } else {
      setSelectedIds((prev) => prev.filter((i) => i !== id))
    }
  }

  const handleDelete = () => {
    setNotifications((prev) => prev.filter((n) => !selectedIds.includes(n._id)))
    setSelectedIds([])
    setSelectMode(false)
  }

  const getActionLink = (notification: Notification) => {
    switch (notification.type) {
      case "comment":
        return "View Comment"
      case "form":
        return "View Form"
      case "share":
        return "View Post"
      case "review":
        return "View Review"
      case "published":
        return "View Post"
      case "response":
        return "View Form"
      default:
        return "View"
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
      <div className="fixed inset-y-0 right-0 w-full max-w-4xl border-l border-border bg-background shadow-lg">
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border px-6 py-4">
            <h1 className="text-2xl font-bold">Notifications</h1>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => setSelectMode(!selectMode)} className="gap-2">
                <CheckSquare className="h-4 w-4" />
                Select
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDelete}
                disabled={selectedIds.length === 0}
                className="gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </Button>
            </div>
          </div>

          {/* Tabs & Content */}
          {notifications.length === 0 ? (
            <EmptyState
              icon="notifications"
              title="There are no Notifications here yet."
              description="You will be notified when an activity starts"
            />
          ) : (
            <>
              {/* Tabs */}
              <div className="border-b border-border px-6">
                <div className="flex gap-6">
                  <button
                    onClick={() => {
                      setActiveTab("all")
                      setCurrentPage(1)
                    }}
                    className={cn(
                      "border-b-2 py-3 text-sm font-medium transition-colors",
                      activeTab === "all"
                        ? "border-primary text-foreground"
                        : "border-transparent text-muted-foreground hover:text-foreground",
                    )}
                  >
                    All ({allCount})
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab("forms")
                      setCurrentPage(1)
                    }}
                    className={cn(
                      "border-b-2 py-3 text-sm font-medium transition-colors",
                      activeTab === "forms"
                        ? "border-primary text-foreground"
                        : "border-transparent text-muted-foreground hover:text-foreground",
                    )}
                  >
                    Forms ({formsCount})
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab("blog")
                      setCurrentPage(1)
                    }}
                    className={cn(
                      "border-b-2 py-3 text-sm font-medium transition-colors",
                      activeTab === "blog"
                        ? "border-primary text-foreground"
                        : "border-transparent text-muted-foreground hover:text-foreground",
                    )}
                  >
                    Blog ({blogCount})
                  </button>
                </div>
              </div>

              {/* Select All */}
              {selectMode && (
                <div className="flex items-center justify-between border-b border-border px-6 py-3">
                  <div className="flex items-center gap-3">
                    <Checkbox
                      checked={
                        selectedIds.length === paginatedNotifications.length && paginatedNotifications.length > 0
                      }
                      onCheckedChange={handleSelectAll}
                    />
                    <span className="text-sm">Select All</span>
                  </div>
                  <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
                    <X className="h-5 w-5" />
                  </button>
                </div>
              )}

              {/* Notification List */}
              <div className="flex-1 overflow-auto">
                {paginatedNotifications.map((notification) => (
                  <div
                    key={notification._id}
                    className={cn(
                      "flex items-center gap-4 border-b border-border px-6 py-4 transition-colors hover:bg-muted/50",
                      selectedIds.includes(notification._id) && "bg-primary/5",
                    )}
                  >
                    {selectMode && (
                      <Checkbox
                        checked={selectedIds.includes(notification._id)}
                        onCheckedChange={(checked) => handleSelect(notification._id, checked as boolean)}
                      />
                    )}

                    {/* Avatar */}
                    <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-lg">
                      <Image
                        src={notification.actor.avatar || "/placeholder.svg"}
                        alt={notification.actor.name}
                        fill
                        className={cn("object-cover", notification.actor.isCompany && "object-contain p-1")}
                      />
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <p className="text-sm">
                        <span className="font-semibold text-primary">{notification.actor.name}</span>{" "}
                        <span className="text-muted-foreground">{notification.action}</span>
                        {notification.target && (
                          <>
                            {" "}
                            <span className="font-medium text-primary">{notification.target}</span>
                          </>
                        )}
                      </p>
                      <div className="mt-1 flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <svg
                            className="h-3 w-3"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <rect x="3" y="4" width="18" height="18" rx="2" />
                            <path d="M16 2v4M8 2v4M3 10h18" />
                          </svg>
                          {notification.date}
                        </span>
                        <span className="flex items-center gap-1">
                          <svg
                            className="h-3 w-3"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <circle cx="12" cy="12" r="10" />
                            <path d="M12 6v6l4 2" />
                          </svg>
                          {notification.time}
                        </span>
                      </div>
                    </div>

                    {/* Action Link */}
                    <button className="text-sm font-medium text-primary hover:underline">
                      {getActionLink(notification)}
                    </button>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between border-t border-border px-6 py-4">
                <p className="text-sm text-muted-foreground">
                  Showing {paginatedNotifications.length} notification(s) of {filteredNotifications.length}
                </p>
                {totalPages > 1 && (
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                    >
                      Back
                    </Button>
                    {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((page) => (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setCurrentPage(page)}
                        className={cn("h-8 w-8 p-0", currentPage === page && "bg-primary text-primary-foreground")}
                      >
                        {page}
                      </Button>
                    ))}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
