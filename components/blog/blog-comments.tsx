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

export function BlogComments({ comments, postId, postSlug }: BlogCommentsProps) {
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
      <div className="container mx-auto px-4 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <ScrollAnimation>
            <h2 className="text-3xl font-bold mb-8">
              <span className="text-foreground">{comments.length}</span>{" "}
              <span className="text-muted-foreground font-normal">Comments</span>
            </h2>
          </ScrollAnimation>

          {comments.length > 0 ? (
            <div className="space-y-6 mb-12">
              {comments.map((comment, index) => (
                <ScrollAnimation key={comment._id} delay={index * 0.1}>
                  <CommentCard comment={comment} />
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

function CommentCard({ comment }: { comment: BlogComment }) {
  const [replies, setReplies] = useState<BlogComment[]>([])
  const [loadingReplies, setLoadingReplies] = useState(false)
  
  // Comment like state - managed locally like replies
  const [likes, setLikes] = useState(comment.likes || 0)
  const [isLiked, setIsLiked] = useState(false)

  const loadReplies = async () => {
    try {
      setLoadingReplies(true)
      const res = await fetch(`/api/blog/comments/${comment._id}/replies`)
      const data = await res.json()
      if (res.ok && data.ok) {
        setReplies(
          (data.replies || []).map((c: any) => ({
            _id: c._id,
            postId: c.postId,
            postTitle: c.postTitle,
            author: { _id: c.authorId || "anonymous", name: c.authorName || "Anonymous" },
            content: c.content,
            status: c.status,
            likes: c.likes || 0,
            createdAt: c.createdAt,
            updatedAt: c.updatedAt,
          }))
        )
      }
    } finally {
      setLoadingReplies(false)
    }
  }

  useEffect(() => {
    if (comment._id) {
      loadReplies()
      // Check localStorage for liked status on mount
      const key = `comment_like_${comment._id}`
      const likedInStorage = typeof window !== 'undefined' && localStorage.getItem(key) === '1'
      setIsLiked(likedInStorage)
    }
  }, [comment._id])

  const toggleCommentLike = async () => {
    const key = `comment_like_${comment._id}`
    const newLikedStatus = !isLiked

    // Optimistic UI update
    setIsLiked(newLikedStatus)
    setLikes(prev => prev + (newLikedStatus ? 1 : -1))

    try {
      const res = await fetch(`/api/blog/comments/${comment._id}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: newLikedStatus ? 'like' : 'unlike' })
      })

      if (res.ok) {
        if (newLikedStatus) {
          localStorage.setItem(key, '1')
        } else {
          localStorage.removeItem(key)
        }
      } else {
        // Revert on failure
        setIsLiked(!newLikedStatus)
        setLikes(prev => prev + (newLikedStatus ? -1 : 1))
      }
    } catch (err) {
      console.error('Error toggling comment like:', err)
      // Revert on failure
      setIsLiked(!newLikedStatus)
      setLikes(prev => prev + (newLikedStatus ? -1 : 1))
    }
  }

  return (
    <div className="flex gap-4 pb-6 border-b border-border last:border-b-0">
      <div className="relative w-12 h-12 rounded-full overflow-hidden flex-shrink-0 bg-gradient-to-br from-teal-100 to-cyan-100">
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

      <div className="flex-1">
        <div className="mb-2">
          <h4 className="font-semibold text-foreground">{comment.author.name}</h4>
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Calendar className="w-3.5 h-3.5" />
            <span>{formatBlogDate(comment.createdAt)}</span>
          </div>
        </div>

        <p className="text-muted-foreground leading-relaxed mb-3">{comment.content}</p>

        <div className="flex items-center gap-4">
            <button 
              onClick={toggleCommentLike} 
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors cursor-pointer"
            >
              <Heart className={`w-4 h-4 ${isLiked ? 'text-red-500 fill-current' : ''}`} />
              <span>{likes}</span>
            </button>
            <ReplyButton comment={comment} onSubmitted={loadReplies} />
        </div>

        <div className="mt-4 space-y-3">
          {loadingReplies && (
            <div className="text-sm text-muted-foreground">Loading replies...</div>
          )}
          {replies.map((r) => (
            <ReplyCard key={r._id} reply={r} />
          ))}
        </div>
      </div>
    </div>
  )
}

function ReplyCard({ reply }: { reply: BlogComment }) {
  const [likes, setLikes] = useState(reply.likes || 0)
  const [isLiked, setIsLiked] = useState(false)

  useEffect(() => {
    const key = `comment_like_${reply._id}`
    const likedInStorage = typeof window !== 'undefined' && localStorage.getItem(key) === '1'
    setIsLiked(likedInStorage)
  }, [reply._id])

  const toggleLike = async () => {
    const key = `comment_like_${reply._id}`
    const newLikedStatus = !isLiked

    // Optimistic UI update
    setIsLiked(newLikedStatus)
    setLikes(prev => prev + (newLikedStatus ? 1 : -1))

    try {
      const res = await fetch(`/api/blog/comments/${reply._id}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: newLikedStatus ? 'like' : 'unlike' })
      })

      if (res.ok) {
        if (newLikedStatus) {
          localStorage.setItem(key, '1')
        } else {
          localStorage.removeItem(key)
        }
      } else {
        // Revert on failure
        setIsLiked(!newLikedStatus)
        setLikes(prev => prev + (newLikedStatus ? -1 : 1))
      }
    } catch (err) {
      console.error('Error toggling reply like:', err)
      // Revert on failure
      setIsLiked(!newLikedStatus)
      setLikes(prev => prev + (newLikedStatus ? -1 : 1))
    }
  }

  return (
    <div className="ml-6 flex items-start gap-3 rounded-lg border border-border p-3">
      <Avatar className="h-7 w-7 border-2 border-primary/20">
        <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-[10px] font-semibold text-primary-foreground">
          {reply.author.name.split(" ").map(n=>n[0]).join("").toUpperCase().slice(0,2)}
        </AvatarFallback>
      </Avatar>
      <div>
        <div className="flex gap-1">      
            <div className="text-sm font-medium text-foreground">{reply.author.name}</div>
            <div className="text-xs text-muted-foreground mt-1">{formatBlogDate(reply.createdAt)}</div>
        </div>
  
        <div className="text-sm text-muted-foreground">{reply.content}</div>
        <div className="flex items-center gap-4">
            <button 
              onClick={toggleLike} 
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors cursor-pointer"
            >
              <Heart className={`w-4 h-4 ${isLiked ? 'text-red-500 fill-current' : ''}`} />
              <span>{likes}</span>
            </button>
        </div>
       
      </div>
    </div>
  )
}

function ReplyButton({ comment, onSubmitted }: { comment: BlogComment, onSubmitted?: () => void }) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [message, setMessage] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const submitReply = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch(`/api/blog/comments/${comment._id}/replies`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, message }),
      })
      const data = await res.json()
      if (res.ok && data.ok) {
        setOpen(false)
        setName("")
        setMessage("")
        if (onSubmitted) onSubmitted()
      } else {
        setError(data.error || "Failed to submit reply.")
      }
    } catch (err) {
      setError("Failed to submit reply.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="">
      <button
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors"
        onClick={() => setOpen(true)}
      >
        <Reply className="w-4 h-4" />
        <span>Reply</span>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-background p-6 shadow-xl">
            <h4 className="text-lg font-semibold mb-4">Reply to {comment.author.name}</h4>
            {error && <p className="mb-3 text-sm text-red-500">{error}</p>}
            <form onSubmit={submitReply} className="space-y-4">
              <Input
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <Textarea
                placeholder="Your reply"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
              />
              <div className="flex justify-end gap-2">
                <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Submit Reply"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
