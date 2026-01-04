"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { MoreVertical, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import type { BlogComment } from "@/lib/blog-data"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"


interface BlogCommentCardProps {
  comment: BlogComment
  isSelected?: boolean
  onSelect?: (checked: boolean) => void
  showCheckbox?: boolean
  onPublish?: () => void
  onUnpublish?: () => void
  onDelete?: () => void
}

export function BlogCommentCard({
  comment,
  isSelected,
  onSelect,
  showCheckbox = false,
  onPublish,
  onUnpublish,
  onDelete,
}: BlogCommentCardProps) {
  const [expanded, setExpanded] = useState(false)
  const [replies, setReplies] = useState<any[]>([])
  const [loadingReplies, setLoadingReplies] = useState(false)

  useEffect(() => {
    let mounted = true
    const loadReplies = async () => {
      try {
        setLoadingReplies(true)
        const res = await fetch(`/api/blog/comments/${comment._id}/replies`)
        const data = await res.json()
        if (mounted && res.ok && data.ok) {
          setReplies(data.replies || [])
        }
      } finally {
        if (mounted) setLoadingReplies(false)
      }
    }
    loadReplies()
    return () => { mounted = false }
  }, [comment._id])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })
  }

  const shouldTruncate = comment.content.length > 200
  const displayContent = expanded || !shouldTruncate ? comment.content : comment.content.slice(0, 200) + "..."

  return (
    <div className={cn("border-b border-border py-6 last:border-b-0", isSelected && "bg-primary/5")}>
      <div className="flex items-start gap-4">
        {/* Checkbox */}
        {showCheckbox && (
          <Checkbox
            checked={isSelected}
            onCheckedChange={onSelect}
            className={cn(
              "mt-4 h-5 w-5 rounded border-2",
              isSelected ? "border-primary bg-primary text-primary-foreground" : "border-muted-foreground/30",
            )}
          />
        )}

        {/* Avatar */}
        <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-lg">
          <Avatar className="h-9 w-9 border-2 border-primary/20">
                            <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-xs font-semibold text-primary-foreground">
                              {comment.author.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                                .toUpperCase()
                                .slice(0, 2)}
                            </AvatarFallback>
                          </Avatar>
        </div>

        {/* Content */}
        <div className="flex-1">
          {/* Header */}
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <span className="font-semibold text-primary">{comment.author.name}</span>
            <span className="text-muted-foreground">commented on</span>
            <span className="font-medium text-primary">"{comment.postTitle}</span>
          </div>

          {/* Comment Text */}
          <p className="text-muted-foreground">{displayContent}</p>

          {/* Show More/Less */}
          {shouldTruncate && (
            <button onClick={() => setExpanded(!expanded)} className="mt-2 font-medium text-primary hover:underline">
              {expanded ? "Show Less" : "Show More"}
            </button>
          )}
        </div>

        {/* Date */}
        <div className="flex flex-shrink-0 items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          {formatDate(comment.createdAt)}
        </div>

        {/* Actions Menu */}
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
            {/* Show Publish only if status is not published */}
            {comment.status !== "published" && (
              <DropdownMenuItem onClick={onPublish}>Publish Comment</DropdownMenuItem>
            )}
            {/* Show Unpublish only if status is published */}
            {comment.status === "published" && (
              <DropdownMenuItem onClick={onUnpublish}>Unpublish Comment</DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={() => onSelect?.(!isSelected)}>Select</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onDelete} className="text-destructive focus:text-destructive">
              Delete Comment
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        {/* Replies under the comment for moderation visibility */}
        <div className="mt-4 space-y-2 ml-16">
      {loadingReplies ? (
        <div className="text-sm text-muted-foreground">Loading replies...</div>
      ) : replies.length === 0 ? null : (
        replies.map((r) => (
          <div key={r._id} className="flex items-start gap-3 rounded-lg border border-border p-3">
            <div className="relative h-8 w-8 flex-shrink-0 overflow-hidden rounded-lg">
              <Avatar className="h-7 w-7 border-2 border-primary/20">
                <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-[10px] font-semibold text-primary-foreground">
                  {(r.authorName || 'Anonymous').split(" ").map((n: string)=>n[0]).join("").toUpperCase().slice(0,2)}
                </AvatarFallback>
              </Avatar>
            </div>
            <div>
              <div className="text-sm font-medium text-foreground">{r.authorName || 'Anonymous'}</div>
              <div className="text-sm text-muted-foreground">{r.content}</div>
              <div className="text-xs text-muted-foreground mt-1">{new Date(r.createdAt).toLocaleDateString('en-GB')}</div>
            </div>
          </div>
        ))
      )}
        </div>
      </div>
    </div>
  )
}
