import { NextResponse } from "next/server"
import { listPublishedBlogs } from "@/lib/blog"

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const limit = Number(url.searchParams.get("limit") || 20)
    const skip = Number(url.searchParams.get("skip") || 0)
    const posts = await listPublishedBlogs(limit, skip)
    return NextResponse.json({ ok: true, posts })
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("/api/blog GET error:", err)
    return NextResponse.json({ error: "internal" }, { status: 500 })
  }
}
