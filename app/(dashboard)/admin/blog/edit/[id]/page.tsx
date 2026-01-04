"use client"

import { useParams, useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { BlogEditor } from "@/components/dashboard/blog/blog-editor"
import { Loader2 } from "lucide-react"

interface BlogPost {
  _id: string
  title: string
  slug: string
  content: string
  excerpt?: string
  thumbnail?: string
  status: "published" | "draft" | "scheduled"
  tags?: string[]
}

export default function EditBlogPostPage() {
  const params = useParams()
  const router = useRouter()
  const postId = params.id as string
  const [post, setPost] = useState<BlogPost | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editorKey, setEditorKey] = useState(Date.now())

  useEffect(() => {
    // Reset state when postId changes
    setPost(null)
    setLoading(true)
    setError(null)
    
    async function fetchPost() {
      try {
        // Add cache-busting to ensure fresh data
        const res = await fetch(`/api/admin/blog/${postId}?t=${Date.now()}`, {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache',
          }
        })
        const data = await res.json()
        console.log("Fetched post data:", data) // Debug log
        if (data.ok && data.post) {
          setPost(data.post)
          setEditorKey(Date.now()) // Force fresh editor state
        } else {
          setError("Post not found")
        }
      } catch (err) {
        console.error("Error fetching post:", err)
        setError("Failed to load post")
      } finally {
        setLoading(false)
      }
    }
    fetchPost()
  }, [postId])

  const handleSave = async (data: { title: string; slug: string; content: string; thumbnail?: string | null }) => {
    try {
      const res = await fetch(`/api/admin/blog/${postId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: data.title,
          slug: data.slug,
          content: data.content,
          thumbnail: data.thumbnail,
        }),
      })
      const result = await res.json()
      if (result.ok) {
        console.log("Post updated:", result.post._id)
        // Update local state with saved post data
        setPost(result.post)
      }
    } catch (error) {
      console.error("Error updating post:", error)
    }
  }

  const handlePreview = () => {
    router.push(`/admin/blog/preview/${postId}`)
  }

  const handlePublish = () => {
    router.push(`/admin/blog/publish/${postId}`)
  }

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error || !post) {
    return (
      <div className="flex h-[calc(100vh-4rem)] flex-col items-center justify-center">
        <p className="text-muted-foreground">{error || "Post not found"}</p>
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
      <BlogEditor
        key={editorKey}
        initialTitle={post.title}
        initialContent={post.content}
        postId={post._id}
        onSave={handleSave}
        onPreview={handlePreview}
        onPublish={handlePublish}
      />
    </div>
  )
}
