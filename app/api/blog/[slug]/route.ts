import { NextResponse } from "next/server"
import { getBlogBySlug } from "@/lib/blog"

export async function GET(req: Request, { params }: { params: { slug: string } }) {
  try {
    const { slug } = params
    const post = await getBlogBySlug(slug)
    if (!post) return NextResponse.json({ error: "not found" }, { status: 404 })
    return NextResponse.json({ ok: true, post })
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("/api/blog/[slug] GET error:", err)
    return NextResponse.json({ error: "internal" }, { status: 500 })
  }
}
