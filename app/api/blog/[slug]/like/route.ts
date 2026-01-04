import { NextResponse } from "next/server"
import { likeBlog, unlikeBlog, getBlogBySlug } from "@/lib/blog"

export async function POST(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params
    const body = await req.json().catch(() => ({}))
    const action = body?.action || "like"

    const post = await getBlogBySlug(slug)
    if (!post) return NextResponse.json({ error: "not found" }, { status: 404 })

    const updated = action === "unlike" ? await unlikeBlog(post._id) : await likeBlog(post._id)
    if (!updated) return NextResponse.json({ error: "not found" }, { status: 404 })

    return NextResponse.json({ ok: true, post: updated })
  } catch (err) {
    console.error("/api/blog/[slug]/like POST error:", err)
    return NextResponse.json({ error: "internal" }, { status: 500 })
  }
}
