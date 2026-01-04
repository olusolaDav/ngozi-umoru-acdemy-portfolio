import { NextResponse } from "next/server"
import { listAllComments, publishComment, unpublishComment, deleteComment, deleteMultipleComments, type CommentStatus } from "@/lib/blog"

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const limit = Number(url.searchParams.get("limit") || 50)
    const skip = Number(url.searchParams.get("skip") || 0)
    const status = url.searchParams.get("status") as CommentStatus | null

    const { comments, total } = await listAllComments(limit, skip, status || undefined)
    return NextResponse.json({ ok: true, comments, total })
  } catch (err) {
    console.error("/api/admin/blog/comments GET error:", err)
    return NextResponse.json({ error: "internal" }, { status: 500 })
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json()
    const { id, ids, action } = body

    if (action === "publish" && id) {
      const comment = await publishComment(id)
      if (!comment) {
        return NextResponse.json({ error: "not found" }, { status: 404 })
      }
      return NextResponse.json({ ok: true, comment })
    }

    if (action === "unpublish" && id) {
      const comment = await unpublishComment(id)
      if (!comment) {
        return NextResponse.json({ error: "not found" }, { status: 404 })
      }
      return NextResponse.json({ ok: true, comment })
    }

    if (action === "delete" && id) {
      const deleted = await deleteComment(id)
      if (!deleted) {
        return NextResponse.json({ error: "not found" }, { status: 404 })
      }
      return NextResponse.json({ ok: true })
    }

    if (action === "delete-multiple" && ids && Array.isArray(ids)) {
      const count = await deleteMultipleComments(ids)
      return NextResponse.json({ ok: true, deletedCount: count })
    }

    return NextResponse.json({ error: "invalid action" }, { status: 400 })
  } catch (err) {
    console.error("/api/admin/blog/comments PATCH error:", err)
    return NextResponse.json({ error: "internal" }, { status: 500 })
  }
}
