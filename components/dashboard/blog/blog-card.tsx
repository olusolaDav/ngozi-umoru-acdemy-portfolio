"use client"

import Image from "next/image"
import { MoreVertical, Eye, MessageSquare } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

interface BlogPost {
  _id: string
  title: string
  slug: string
  content: string
  excerpt: string
  thumbnail: string
  author?: {
    _id: string
    name: string
    avatar?: string
  }
  status: "published" | "draft" | "scheduled"
  tags: string[]
  views: number
  commentsCount: number
  likes: number
  shares: number
  readTime: number
  createdAt: string
  publishedAt?: string
  scheduledAt?: string
  updatedAt: string
}

interface BlogCardProps {
  post: BlogPost
  onEdit?: () => void
  onView?: () => void
  onPreview?: () => void
  onPublish?: () => void
  onUnpublish?: () => void
  onRevertToDraft?: () => void
  onShare?: () => void
  onViewComments?: () => void
  onAddTags?: () => void
  onSchedule?: () => void
  onDiscard?: () => void
  onDelete?: () => void
  isSelected?: boolean
  onSelect?: () => void
}

export function BlogCard({
  post,
  onEdit,
  onView,
  onPreview,
  onPublish,
  onUnpublish,
  onRevertToDraft,
  onShare,
  onViewComments,
  onAddTags,
  onSchedule,
  onDiscard,
  onDelete,
  isSelected,
  onSelect,
}: BlogCardProps) {
  const isPublished = post.status === "published"
  const isDraft = post.status === "draft"
  const isScheduled = post.status === "scheduled"

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })
  }

  const formatScheduledDateTime = (dateString: string) => {
    const date = new Date(dateString)
    const dateStr = date.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })
    const timeStr = date.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
    })
    return `${dateStr} at ${timeStr}`
  }

  const getStatusBadge = () => {
    if (isPublished) {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
          <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
          Published
        </span>
      )
    }
    if (isScheduled) {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-medium text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
          <span className="h-1.5 w-1.5 rounded-full bg-purple-500" />
          Scheduled
        </span>
      )
    }
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">
        <span className="h-1.5 w-1.5 rounded-full bg-yellow-500" />
        Draft
      </span>
    )
  }

  return (
    <div
      className={cn(
        "group flex items-start gap-4 rounded-xl border border-border bg-card p-4 transition-all hover:shadow-md",
        isSelected && "border-primary bg-primary/5",
      )}
    >
      <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg">
        <Image src={post.thumbnail || "/placeholder.svg"} alt={post.title} fill className="object-cover" />
      </div>

      <div className="flex flex-1 flex-col gap-2">
        <h3 className="line-clamp-1 font-semibold text-foreground">{post.title}</h3>

        <div className="flex flex-wrap items-center gap-3 text-sm">
          {getStatusBadge()}
          <span className="text-muted-foreground">•</span>
          {isScheduled && post.scheduledAt ? (
            <span className="text-muted-foreground">
              Scheduled: {formatScheduledDateTime(post.scheduledAt)}
            </span>
          ) : (
            <span className="text-muted-foreground">{formatDate(post.publishedAt || post.createdAt)}</span>
          )}

          {isPublished && post.tags && post.tags.length > 0 && (
            <>
              {post.tags.slice(0, 2).map((tag) => (
                <span
                  key={tag}
                  className={cn(
                    "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium",
                    tag === "Digital Skills"
                      ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                      : "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400",
                  )}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-current" />
                  {tag}
                </span>
              ))}
            </>
          )}
        </div>

        {isPublished && (
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Eye className="h-4 w-4" />
              {post.views || 0}
            </span>
            <span className="flex items-center gap-1">
              <MessageSquare className="h-4 w-4" />
              {post.commentsCount || 0}
            </span>
          </div>
        )}
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 flex-shrink-0 rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          {isPublished ? (
            <>
              <DropdownMenuItem onClick={onEdit}>Edit Post</DropdownMenuItem>
              <DropdownMenuItem onClick={onView}>View Post</DropdownMenuItem>
              <DropdownMenuItem onClick={onRevertToDraft}>Revert to Draft</DropdownMenuItem>
              <DropdownMenuItem onClick={onShare}>Share</DropdownMenuItem>
              <DropdownMenuItem onClick={onViewComments}>View Comments</DropdownMenuItem>
              <DropdownMenuItem onClick={onAddTags}>Add Tags</DropdownMenuItem>
              <DropdownMenuItem onClick={onUnpublish}>Unpublish Post</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onDelete} className="text-destructive focus:text-destructive">
                Delete Post
              </DropdownMenuItem>
            </>
          ) : (
            <>
              <DropdownMenuItem onClick={onEdit}>Edit Post</DropdownMenuItem>
              <DropdownMenuItem onClick={onPreview}>Preview Post</DropdownMenuItem>
              <DropdownMenuItem onClick={onPublish}>Publish Post</DropdownMenuItem>
              <DropdownMenuItem onClick={onAddTags}>Add Tags</DropdownMenuItem>
              <DropdownMenuItem onClick={onSchedule}>Schedule Post</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onDiscard} className="text-destructive focus:text-destructive">
                Discard Draft
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
