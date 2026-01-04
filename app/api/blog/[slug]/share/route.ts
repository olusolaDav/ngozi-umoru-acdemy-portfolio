import { NextResponse } from "next/server"
import { getBlogBySlug } from "@/lib/blog"
import { getDb } from "@/lib/mongodb"

export async function POST(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params
    const post = await getBlogBySlug(slug)
    if (!post) return NextResponse.json({ error: "not found" }, { status: 404 })

    const db = await getDb()
    await db.collection("blogs").updateOne({ _id: new (await import("mongodb")).ObjectId(post._id) }, { $inc: { shares: 1 } })
    const doc = await db.collection("blogs").findOne({ _id: new (await import("mongodb")).ObjectId(post._id) })

    if (!doc) return NextResponse.json({ error: "not found" }, { status: 404 })
    return NextResponse.json({ ok: true, post: { ...doc, _id: doc._id.toString() } })
  } catch (err) {
    console.error("/api/blog/[slug]/share POST error:", err)
    return NextResponse.json({ error: "internal" }, { status: 500 })
  }
}
