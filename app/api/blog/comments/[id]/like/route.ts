import { NextResponse } from "next/server"
import { likeComment, unlikeComment } from "@/lib/blog"

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await req.json().catch(() => ({}))
    const action = body?.action || "like"
    const comment = action === "unlike" ? await unlikeComment(id) : await likeComment(id)
    if (!comment) return NextResponse.json({ error: "not found" }, { status: 404 })
    return NextResponse.json({ ok: true, comment })
  } catch (err) {
    console.error("/api/blog/comments/[id]/like POST error:", err)
    return NextResponse.json({ error: "internal" }, { status: 500 })
  }
}
