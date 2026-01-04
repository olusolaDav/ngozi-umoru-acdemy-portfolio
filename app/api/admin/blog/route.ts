import { NextResponse } from "next/server"
import { createBlog, listAllBlogs, type BlogStatus } from "@/lib/blog"

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const limit = Number(url.searchParams.get("limit") || 50)
    const skip = Number(url.searchParams.get("skip") || 0)
    const status = url.searchParams.get("status") as BlogStatus | null

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
    console.error("/api/admin/blog POST error:", err)
    return NextResponse.json({ error: "internal" }, { status: 500 })
  }
}
