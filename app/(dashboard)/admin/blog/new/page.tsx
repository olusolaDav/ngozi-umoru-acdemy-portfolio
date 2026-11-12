"use client"

import { useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { BlogEditor } from "@/components/dashboard/blog/blog-editor"

export default function NewBlogPostPage() {
  const router = useRouter()
  const [postId, setPostId] = useState<string | null>(null)
  const postIdRef = useRef<string | null>(null)

  const handleSave = async (data: { title: string; slug: string; content: string; thumbnail?: string | null }) => {
    const currentPostId = postIdRef.current
    const res = await fetch(currentPostId ? `/api/admin/blog/${currentPostId}` : "/api/admin/blog", {
      method: currentPostId ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: data.title,
        slug: data.slug,
        content: data.content,
        thumbnail: data.thumbnail,
        status: "draft",
      }),
    })
    const result = await res.json()
    if (!res.ok || !result.ok || !result.post?._id) {
      throw new Error(result.error || "Unable to save blog post.")
    }

    postIdRef.current = result.post._id
    setPostId(result.post._id)
  }

  const handlePreview = async () => {
    const currentPostId = postIdRef.current || postId
    if (currentPostId) {
      router.push(`/admin/blog/preview/${currentPostId}`)
    } else {
      alert("Please save the post first before previewing.")
    }
  }

  const handlePublish = async () => {
    const currentPostId = postIdRef.current || postId
    if (currentPostId) {
      router.push(`/admin/blog/publish/${currentPostId}`)
    } else {
      alert("Please save the post first before publishing.")
    }
  }

  return (
    <div className="-m-6 h-[calc(100vh-4rem)]">
      <BlogEditor 
        onSave={handleSave} 
        onPreview={handlePreview} 
        onPublish={handlePublish}
      />
    </div>
  )
}
