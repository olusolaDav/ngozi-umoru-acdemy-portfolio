import { NextResponse } from "next/server"
import { createComment, listPublishedCommentsByPost, getBlogBySlug } from "@/lib/blog"

export async function GET(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params
    const url = new URL(req.url)
    const limit = Number(url.searchParams.get("limit") || 50)
    const skip = Number(url.searchParams.get("skip") || 0)

    const post = await getBlogBySlug(slug)
    if (!post) {
      return NextResponse.json({ error: "post not found" }, { status: 404 })
    }

    const comments = await listPublishedCommentsByPost(post._id, limit, skip)
    return NextResponse.json({ ok: true, comments })
  } catch (err) {
    console.error("/api/blog/[slug]/comments GET error:", err)
    return NextResponse.json({ error: "internal" }, { status: 500 })
  }
}

export async function POST(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params
    const body = await req.json()
    const { name, subject, message, parentId } = body

    if (!name || !message) {
      return NextResponse.json({ error: "name and message are required" }, { status: 400 })
    }

    const post = await getBlogBySlug(slug)
    if (!post) {
      return NextResponse.json({ error: "post not found" }, { status: 404 })
    }

    const comment = await createComment({
      postId: post._id,
      postSlug: post.slug,
      postTitle: post.title,
      authorName: name,
      subject,
      content: message,
      parentId,
    })

    return NextResponse.json({ 
      ok: true, 
      comment,
      message: "Your comment has been submitted and is pending approval."
    })
  } catch (err) {
    console.error("/api/blog/[slug]/comments POST error:", err)
    return NextResponse.json({ error: "internal" }, { status: 500 })
  }
}
