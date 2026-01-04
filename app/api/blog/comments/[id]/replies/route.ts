import { NextResponse } from "next/server"
import { getCommentById, listPublishedRepliesByParentId, createComment } from "@/lib/blog"

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const url = new URL(req.url)
    const limit = Number(url.searchParams.get("limit") || 50)
    const skip = Number(url.searchParams.get("skip") || 0)

    const parent: any = await getCommentById(id)
    if (!parent) {
      return NextResponse.json({ error: "comment not found" }, { status: 404 })
    }

    const replies = await listPublishedRepliesByParentId(id, limit, skip)
    return NextResponse.json({ ok: true, replies })
  } catch (err) {
    console.error("/api/blog/comments/[id]/replies GET error:", err)
    return NextResponse.json({ error: "internal" }, { status: 500 })
  }
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await req.json()
    const { name, message } = body

    if (!name || !message) {
      return NextResponse.json({ error: "name and message are required" }, { status: 400 })
    }

    const parent: any = await getCommentById(id)
    if (!parent) {
      return NextResponse.json({ error: "comment not found" }, { status: 404 })
    }

    const reply = await createComment({
      postId: parent.postId,
      postSlug: parent.postSlug,
      postTitle: parent.postTitle,
      authorName: name,
      content: message,
      parentId: id,
    })

    return NextResponse.json({ ok: true, reply, message: "Reply posted." })
  } catch (err) {
    console.error("/api/blog/comments/[id]/replies POST error:", err)
    return NextResponse.json({ error: "internal" }, { status: 500 })
  }
}
