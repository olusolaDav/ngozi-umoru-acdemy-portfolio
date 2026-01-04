"use client"

import { useParams, useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Clock, Calendar, Heart, Share2, Loader2 } from "lucide-react"

interface BlogPost {
  _id: string
  title: string
  slug: string
  content: string
  excerpt?: string
  thumbnail?: string
  status: "published" | "draft" | "scheduled"
  tags: string[]
  views: number
  likes: number
  shares: number
  readTime: number
  createdAt: string
  publishedAt?: string
}

export default function PreviewBlogPostPage() {
  const params = useParams()
  const router = useRouter()
  const postId = params.id as string
  const [post, setPost] = useState<BlogPost | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchPost() {
      try {
        const res = await fetch(`/api/admin/blog/${postId}`)
        const data = await res.json()
        if (data.ok && data.post) {
          setPost({
            ...data.post,
            tags: data.post.tags || [],
            views: data.post.views || 0,
            likes: data.post.likes || 0,
            shares: data.post.shares || 0,
            readTime: data.post.readTime || 5,
          })
        }
      } catch (err) {
        console.error("Error fetching post:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchPost()
  }, [postId])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!post) {
    return (
      <div className="flex h-full flex-col items-center justify-center">
        <p className="text-muted-foreground">Post not found</p>
        <button
          onClick={() => router.push("/admin/blog")}
          className="mt-4 text-primary hover:underline"
        >
          Back to Blog Posts
        </button>
      </div>
    )
  }

  return (
    <div className="relative min-h-full">
      <div className="fixed left-0 top-20 z-50 rotate-[-45deg] bg-red-500 px-8 py-1 text-sm font-bold text-white shadow-lg">
        Preview
      </div>

      <Button variant="ghost" onClick={() => router.push(`/admin/blog/edit/${postId}`)} className="mb-6 gap-2">
        <ArrowLeft className="h-4 w-4" />
        Back to Editor
      </Button>

      <article className="mx-auto max-w-3xl">
        <div className="mb-8 text-center">
          <span className="mb-4 inline-block rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
            OUR BLOG
          </span>
          <h1 className="mb-4 text-3xl font-bold leading-tight md:text-4xl">
            {post.title}
          </h1>
          <p className="mb-6 text-muted-foreground">{post.excerpt}</p>

          <div className="flex flex-wrap items-center justify-center gap-4 text-sm">
            {post.tags[0] && <span className="rounded-full bg-cyan-500 px-3 py-1 text-white">{post.tags[0]}</span>}
            <span className="flex items-center gap-1 text-muted-foreground">
              <Clock className="h-4 w-4" />
              {post.readTime} Min
            </span>
            <span className="flex items-center gap-1 text-muted-foreground">
              <Calendar className="h-4 w-4" />
              {formatDate(post.publishedAt || post.createdAt)}
            </span>
            <span className="flex items-center gap-1 text-muted-foreground">
              <Heart className="h-4 w-4" />
              {post.likes} Likes
            </span>
            <span className="flex items-center gap-1 text-muted-foreground">
              <Share2 className="h-4 w-4" />
              {post.shares} Shares
            </span>
          </div>
        </div>

        <div className="relative mb-8 aspect-video w-full overflow-hidden rounded-xl">
          <Image 
            src={post.thumbnail || "/placeholder.svg"} 
            alt={post.title} 
            fill 
            className="object-cover" 
          />
        </div>

        <div
          className="prose prose-lg max-w-none dark:prose-invert"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        <div className="mt-12 border-t border-border pt-8">
          <h2 className="mb-4 text-xl font-semibold">Leave Your Comment</h2>
          <div className="rounded-xl border border-border p-4">
            <textarea
              placeholder="Write your comment..."
              className="w-full resize-none border-0 bg-transparent p-0 placeholder:text-muted-foreground focus:outline-none"
              rows={4}
              disabled
            />
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            Comments are disabled in preview mode.
          </p>
        </div>
      </article>

      <button
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className="fixed bottom-8 right-8 flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90"
      >
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 15l-6-6-6 6" />
        </svg>
      </button>
    </div>
  )
}
