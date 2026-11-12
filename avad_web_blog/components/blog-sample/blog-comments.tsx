"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Calendar, Reply, Loader2, CheckCircle, Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ScrollAnimation } from "@/components/ui/scroll-animation"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"


interface BlogComment {
  _id: string
  postId: string
  postTitle: string
  author: {
    _id: string
    name: string
    avatar?: string
  }
  content: string
  status: "published" | "unpublished" | "pending"
  likes?: number
  createdAt: string
  updatedAt: string
}

interface BlogCommentsProps {
  comments: BlogComment[]
  postId: string
  postSlug?: string
}

function formatBlogDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })
}

export function BlogComments({ comments: initialComments, postId, postSlug }: BlogCommentsProps) {
  const [comments, setComments] = useState<BlogComment[]>(initialComments)
  const [name, setName] = useState("")
  const [subject, setSubject] = useState("")
  const [message, setMessage] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [replyingTo, setReplyingTo] = useState<BlogComment | null>(null)
  const [replyName, setReplyName] = useState("")
  const [replyMessage, setReplyMessage] = useState("")
  const [replySubmitting, setReplySubmitting] = useState(false)
  const [replyMap, setReplyMap] = useState<Record<string, BlogComment[]>>({})

  // Fetch the latest published comments from the API on mount so the list
  // is always up-to-date regardless of when the static page was built.
  const fetchComments = async () => {
    try {
      const res = await fetch(`/api/blog/${postSlug || postId}/comments`, { cache: "no-store" })
      const data = await res.json()
      if (res.ok && data.ok && Array.isArray(data.comments)) {
        const mapped: BlogComment[] = data.comments.map((c: any) => ({
          _id: c._id,
          postId: c.postId,
          postTitle: c.postTitle || "",
          author: {
            _id: c.authorId || c.author?._id || "anonymous",
            name: c.authorName || c.author?.name || "Anonymous",
            avatar: c.authorAvatar || c.author?.avatar,
          },
          content: c.content,
          status: c.status,
          likes: c.likes || 0,
          createdAt: c.createdAt,
          updatedAt: c.updatedAt,
        }))
        setComments(mapped)
      }
    } catch {
      // silently fall back to server-rendered initial comments
    }
  }

  useEffect(() => {
    fetchComments()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postSlug, postId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitError(null)

    try {
      const res = await fetch(`/api/blog/${postSlug || postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          subject,
          message,
        }),
      })

      const data = await res.json()

      if (res.ok && data.ok) {
        setSubmitSuccess(true)
        setName("")
        setSubject("")
        setMessage("")
        // Re-fetch so any auto-approved comments appear immediately
        await fetchComments()
        setTimeout(() => setSubmitSuccess(false), 5000)
      } else {
        setSubmitError(data.error || "Failed to submit comment. Please try again.")
      }
    } catch (error) {
      console.error("Error submitting comment:", error)
      setSubmitError("Failed to submit comment. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="py-12 bg-background">
      <div className="container mx-auto px-4 md:px-6">
        <div className="max-w-4xl mx-auto">
          <ScrollAnimation>
            <h2 className="text-3xl font-bold mb-8">
              <span className="text-foreground">{comments.length}</span>{" "}
              <span className="text-muted-foreground font-normal">Comments</span>
            </h2>
          </ScrollAnimation>

          {comments.length > 0 ? (
            <div className="space-y-0 mb-12">
              {comments.map((comment, index) => (
                <ScrollAnimation key={comment._id} delay={index * 0.1}>
                  <CommentNode comment={comment} depth={0} />
                </ScrollAnimation>
              ))}
            </div>
          ) : (
            <div className="mb-12 text-center py-8 text-muted-foreground">
              <p>No comments yet. Be the first to comment!</p>
            </div>
          )}

          <div className="border-t border-border my-12" />

          <ScrollAnimation>
            <h3 className="text-2xl font-bold text-foreground mb-8">Leave Your Comment</h3>
            
            {submitSuccess && (
              <div className="mb-6 flex items-center gap-2 rounded-lg bg-green-50 p-4 text-green-700 dark:bg-green-900/20 dark:text-green-400">
                <CheckCircle className="h-5 w-5" />
                <p>Your comment has been submitted and is pending approval by the admin.</p>
              </div>
            )}
            
            {submitError && (
              <div className="mb-6 rounded-lg bg-red-50 p-4 text-red-700 dark:bg-red-900/20 dark:text-red-400">
                <p>{submitError}</p>
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Input
                    type="text"
                    placeholder="Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="h-12 rounded-xl border-border bg-background px-4"
                  />
                </div>
                <div>
                  <Input
                    type="text"
                    placeholder="Subject"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="h-12 rounded-xl border-border bg-background px-4"
                  />
                </div>
              </div>

              <div>
                <Textarea
                  placeholder="Write your message here"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                  className="min-h-[200px] rounded-xl border-border bg-background px-4 py-4 resize-none"
                />
              </div>

              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-8 py-6 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Send Message"
                  )}
                </Button>
              </motion.div>
            </form>
          </ScrollAnimation>
        </div>
      </div>
    </section>
  )
}

function mapRawComment(c: any): BlogComment {
  return {
    _id: c._id,
    postId: c.postId,
    postTitle: c.postTitle || "",
    author: {
      _id: c.authorId || c.author?._id || "anonymous",
      name: c.authorName || c.author?.name || "Anonymous",
      avatar: c.authorAvatar || c.author?.avatar,
    },
    content: c.content,
    status: c.status,
    likes: c.likes || 0,
    createdAt: c.createdAt,
    updatedAt: c.updatedAt,
  }
}

/**
 * A single recursive component that renders a comment (or reply) and all
 * its descendants. Each node can itself reply, producing unlimited depth.
 */
function CommentNode({ comment, depth = 0 }: { comment: BlogComment; depth?: number }) {
  const [replies, setReplies] = useState<BlogComment[]>([])
  const [loadingReplies, setLoadingReplies] = useState(false)
  const [showReplyForm, setShowReplyForm] = useState(false)
  const [replyName, setReplyName] = useState("")
  const [replyMessage, setReplyMessage] = useState("")
  const [replySubmitting, setReplySubmitting] = useState(false)
  const [replyError, setReplyError] = useState<string | null>(null)
  const [likes, setLikes] = useState(comment.likes || 0)
  const [isLiked, setIsLiked] = useState(false)

  const loadReplies = async () => {
    try {
      setLoadingReplies(true)
      const res = await fetch(`/api/blog/comments/${comment._id}/replies`, { cache: "no-store" })
      const data = await res.json()
      if (res.ok && data.ok) {
        setReplies((data.replies || []).map(mapRawComment))
      }
    } finally {
      setLoadingReplies(false)
    }
  }

  useEffect(() => {
    if (comment._id) {
      loadReplies()
      const key = `comment_like_${comment._id}`
      setIsLiked(typeof window !== "undefined" && localStorage.getItem(key) === "1")
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [comment._id])

  const toggleLike = async () => {
    const key = `comment_like_${comment._id}`
    const newLiked = !isLiked
    setIsLiked(newLiked)
    setLikes((p) => p + (newLiked ? 1 : -1))
    try {
      const res = await fetch(`/api/blog/comments/${comment._id}/like`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: newLiked ? "like" : "unlike" }),
      })
      if (res.ok) {
        newLiked ? localStorage.setItem(key, "1") : localStorage.removeItem(key)
      } else {
        setIsLiked(!newLiked)
        setLikes((p) => p + (newLiked ? -1 : 1))
      }
    } catch {
      setIsLiked(!newLiked)
      setLikes((p) => p + (newLiked ? -1 : 1))
    }
  }

  const submitReply = async (e: React.FormEvent) => {
    e.preventDefault()
    setReplySubmitting(true)
    setReplyError(null)
    try {
      const res = await fetch(`/api/blog/comments/${comment._id}/replies`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: replyName, message: replyMessage }),
      })
      const data = await res.json()
      if (res.ok && data.ok) {
        // Add the new reply immediately — replies are auto-published
        setReplies((prev) => [...prev, mapRawComment(data.reply)])
        setShowReplyForm(false)
        setReplyName("")
        setReplyMessage("")
      } else {
        setReplyError(data.error || "Failed to submit reply.")
      }
    } catch {
      setReplyError("Failed to submit reply.")
    } finally {
      setReplySubmitting(false)
    }
  }

  const isTopLevel = depth === 0
  // Cap left-border indentation visually at depth 4 to avoid extreme nesting
  const indentClass = depth > 0 ? "ml-6 sm:ml-10 pl-4 border-l-2 border-border" : ""

  return (
    <div className={indentClass}>
      <div className={`flex gap-3 ${isTopLevel ? "pb-6 border-b border-border last:border-b-0" : "py-3"}`}>
        {/* Avatar */}
        <Avatar className={`flex-shrink-0 border-2 border-primary/20 ${isTopLevel ? "h-10 w-10" : "h-7 w-7"}`}>
          <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-xs font-semibold text-primary-foreground">
            {comment.author.name
              .split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase()
              .slice(0, 2)}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex flex-wrap items-baseline gap-2 mb-1">
            <h4 className={`font-semibold text-foreground ${isTopLevel ? "text-base" : "text-sm"}`}>
              {comment.author.name}
            </h4>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Calendar className="w-3 h-3" />
              <span>{formatBlogDate(comment.createdAt)}</span>
            </div>
          </div>

          <p className={`text-muted-foreground leading-relaxed mb-2 ${isTopLevel ? "text-base" : "text-sm"}`}>
            {comment.content}
          </p>

          {/* Actions */}
          <div className="flex items-center gap-4">
            <button
              onClick={toggleLike}
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors cursor-pointer"
            >
              <Heart className={`w-3.5 h-3.5 ${isLiked ? "text-red-500 fill-current" : ""}`} />
              <span>{likes}</span>
            </button>
            <button
              onClick={() => setShowReplyForm((v) => !v)}
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors cursor-pointer"
            >
              <Reply className="w-3.5 h-3.5" />
              <span>Reply</span>
            </button>
          </div>

          {/* Inline reply form */}
          {showReplyForm && (
            <form onSubmit={submitReply} className="mt-3 space-y-2">
              {replyError && <p className="text-xs text-red-500">{replyError}</p>}
              <Input
                placeholder="Your name"
                value={replyName}
                onChange={(e) => setReplyName(e.target.value)}
                required
                className="h-9 text-sm rounded-lg"
              />
              <Textarea
                placeholder={`Reply to ${comment.author.name}…`}
                value={replyMessage}
                onChange={(e) => setReplyMessage(e.target.value)}
                required
                className="min-h-[80px] text-sm rounded-lg resize-none"
              />
              <div className="flex gap-2">
                <Button type="submit" size="sm" disabled={replySubmitting} className="rounded-lg">
                  {replySubmitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Post Reply"}
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => { setShowReplyForm(false); setReplyError(null) }}
                  className="rounded-lg"
                >
                  Cancel
                </Button>
              </div>
            </form>
          )}

          {/* Nested replies */}
          {loadingReplies && (
            <p className="mt-2 text-xs text-muted-foreground">Loading replies…</p>
          )}
          {replies.length > 0 && (
            <div className="mt-3 space-y-0">
              {replies.map((r) => (
                <CommentNode key={r._id} comment={r} depth={depth + 1} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
