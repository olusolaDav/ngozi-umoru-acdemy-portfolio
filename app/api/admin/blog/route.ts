import { NextResponse } from "next/server"
import { BlogSlugConflictError, createBlog, listAllBlogs, type BlogStatus } from "@/lib/blog"

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const requestedLimit = Number(url.searchParams.get("limit") || 50)
    const requestedSkip = Number(url.searchParams.get("skip") || 0)
    const limit = Number.isFinite(requestedLimit) ? Math.min(100, Math.max(1, Math.floor(requestedLimit))) : 50
    const skip = Number.isFinite(requestedSkip) ? Math.max(0, Math.floor(requestedSkip)) : 0
    const status = url.searchParams.get("status") as BlogStatus | null

    if (status && !["published", "draft", "scheduled"].includes(status)) {
      return NextResponse.json({ error: "invalid status" }, { status: 400 })
    }

    const { posts, total } = await listAllBlogs(limit, skip, status || undefined)
    return NextResponse.json({ ok: true, posts, total })
  } catch (err) {
    console.error("/api/admin/blog GET error:", err)
    return NextResponse.json({ error: "internal" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { title, slug, content, excerpt, thumbnail, tags, status, authorId, authorName } = body

    const post = await createBlog({
      title,
      slug,
      content,
      excerpt,
      thumbnail,
      tags,
      status: status || "draft",
      authorId,
      authorName,
    })

    return NextResponse.json({ ok: true, post })
  } catch (err) {
    if (err instanceof BlogSlugConflictError) {
      return NextResponse.json({ error: err.message }, { status: 409 })
    }
    console.error("/api/admin/blog POST error:", err)
    return NextResponse.json({ error: "internal" }, { status: 500 })
  }
}
