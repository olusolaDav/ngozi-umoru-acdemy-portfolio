import { NextResponse } from "next/server"
import { getBlogById, updateBlog, deleteBlog, publishBlog, unpublishBlog } from "@/lib/blog"

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
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
    console.error("/api/admin/blog/[id] PUT error:", err)
    return NextResponse.json({ error: "internal" }, { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
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
    const body = await req.json()
    const { action, title, excerpt, tags, scheduledAt } = body

    let post = null

    if (action === "publish") {
      post = await publishBlog(id, { title, excerpt, tags })
    } else if (action === "schedule") {
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
