import { NextResponse } from "next/server"
import { getBlogById, updateBlog, deleteBlog, publishBlog, unpublishBlog, BlogSlugConflictError, type BlogRecord } from "@/lib/blog"
import { blogContentText } from "@/lib/blog-content"

function isValidId(id: string) {
  return /^[a-f\d]{24}$/i.test(id)
}

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    if (!isValidId(id)) return NextResponse.json({ error: "invalid id" }, { status: 400 })
    const post = await getBlogById(id)
    if (!post) {
      return NextResponse.json({ error: "not found" }, { status: 404 })
    }
    return NextResponse.json({ ok: true, post })
  } catch (err) {
    console.error("/api/admin/blog/[id] GET error:", err)
    return NextResponse.json({ error: "internal" }, { status: 500 })
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    if (!isValidId(id)) return NextResponse.json({ error: "invalid id" }, { status: 400 })
    const body = await req.json()
    
    // Only include fields that are explicitly provided (not undefined)
    const updates: Record<string, any> = {}
    if (body.title !== undefined) updates.title = body.title
    if (body.slug !== undefined) updates.slug = body.slug
    if (body.content !== undefined) updates.content = body.content
    if (body.excerpt !== undefined) updates.excerpt = body.excerpt
    if (body.thumbnail !== undefined) updates.thumbnail = body.thumbnail
    if (body.tags !== undefined) updates.tags = body.tags
    if (body.status !== undefined) updates.status = body.status

    const post = await updateBlog(id, updates)

    if (!post) {
      return NextResponse.json({ error: "not found" }, { status: 404 })
    }

    return NextResponse.json({ ok: true, post })
  } catch (err) {
    if (err instanceof BlogSlugConflictError) {
      return NextResponse.json({ error: err.message }, { status: 409 })
    }
    console.error("/api/admin/blog/[id] PUT error:", err)
    return NextResponse.json({ error: "internal" }, { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    if (!isValidId(id)) return NextResponse.json({ error: "invalid id" }, { status: 400 })
    const deleted = await deleteBlog(id)
    if (!deleted) {
      return NextResponse.json({ error: "not found" }, { status: 404 })
    }
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("/api/admin/blog/[id] DELETE error:", err)
    return NextResponse.json({ error: "internal" }, { status: 500 })
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    if (!isValidId(id)) return NextResponse.json({ error: "invalid id" }, { status: 400 })
    const body = await req.json()
    const { action, title, excerpt, tags, scheduledAt } = body

    let post = null

    if (action === "publish") {
      const current = await getBlogById(id) as BlogRecord | null
      if (!current) return NextResponse.json({ error: "not found" }, { status: 404 })
      if (!blogContentText(current.content)) {
        return NextResponse.json({ error: "Add blog content and save the draft before publishing." }, { status: 422 })
      }
      post = await publishBlog(id, { title, excerpt, tags })
    } else if (action === "schedule") {
      const current = await getBlogById(id) as BlogRecord | null
      if (!current) return NextResponse.json({ error: "not found" }, { status: 404 })
      if (!blogContentText(current.content)) {
        return NextResponse.json({ error: "Add blog content and save the draft before scheduling." }, { status: 422 })
      }
      post = await publishBlog(id, { title, excerpt, tags, scheduledAt })
    } else if (action === "unpublish" || action === "revert-to-draft") {
      post = await unpublishBlog(id)
    } else {
      return NextResponse.json({ error: "invalid action" }, { status: 400 })
    }

    if (!post) {
      return NextResponse.json({ error: "not found" }, { status: 404 })
    }

    return NextResponse.json({ ok: true, post })
  } catch (err) {
    console.error("/api/admin/blog/[id] PATCH error:", err)
    return NextResponse.json({ error: "internal" }, { status: 500 })
  }
}
