"use client"

import { useParams, useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { PublishPostForm } from "@/components/dashboard/blog/publish-post-form"
import { Loader2 } from "lucide-react"

interface BlogPost {
  _id: string
  title: string
  slug: string
  content: string
  excerpt?: string
  thumbnail?: string
  status: "published" | "draft" | "scheduled"
  tags: string[]
  readTime?: number
}

export default function PublishBlogPostPage() {
  const params = useParams()
  const router = useRouter()
  const postId = params.id as string
  const [post, setPost] = useState<BlogPost | null>(null)
  const [loading, setLoading] = useState(true)
  const [publishing, setPublishing] = useState(false)

  // Extract first image from content
  const extractFirstImage = (content: string): string | null => {
    const imgMatch = content?.match(/<img[^>]+src="([^"]+)"/);
    return imgMatch ? imgMatch[1] : null;
  }

  useEffect(() => {
    async function fetchPost() {
      try {
        const res = await fetch(`/api/admin/blog/${postId}`)
        const data = await res.json()
        if (data.ok && data.post) {
          const content = data.post.content || ""
          const thumbnail = data.post.thumbnail || extractFirstImage(content)
          setPost({
            ...data.post,
            tags: data.post.tags || [],
            thumbnail,
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

  const handlePublishNow = async (data: { title: string; metaDescription: string; tags: string[] }) => {
    setPublishing(true)
    try {
      // Use PATCH to publish - it handles updating title, excerpt, and tags
      const publishRes = await fetch(`/api/admin/blog/${postId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "publish",
          title: data.title,
          excerpt: data.metaDescription,
          tags: data.tags,
        }),
      })

      if (publishRes.ok) {
        router.push("/admin/blog")
      }
    } catch (error) {
      console.error("Error publishing post:", error)
    } finally {
      setPublishing(false)
    }
  }

  const handleSchedule = async (data: { title: string; metaDescription: string; tags: string[]; scheduledAt?: string }) => {
    if (!data.scheduledAt) {
      alert("Please select a scheduled date and time.")
      return
    }

    setPublishing(true)
    try {
      // Use PATCH to schedule - it handles updating title, excerpt, tags, and scheduledAt
      const scheduleRes = await fetch(`/api/admin/blog/${postId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "schedule",
          title: data.title,
          excerpt: data.metaDescription,
          tags: data.tags,
          scheduledAt: new Date(data.scheduledAt).toISOString(),
        }),
      })

      if (scheduleRes.ok) {
        router.push("/admin/blog")
      }
    } catch (error) {
      console.error("Error scheduling post:", error)
    } finally {
      setPublishing(false)
    }
  }

  const handleClose = () => {
    router.push(`/admin/blog/edit/${postId}`)
  }

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!post) {
    return (
      <div className="flex h-[calc(100vh-4rem)] flex-col items-center justify-center">
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
    <div className="-m-6 h-[calc(100vh-4rem)]">
      {publishing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Publishing...</p>
          </div>
        </div>
      )}
      <PublishPostForm 
        post={post as any} 
        onPublishNow={handlePublishNow} 
        onSchedule={handleSchedule} 
        onClose={handleClose} 
      />
    </div>
  )
}
