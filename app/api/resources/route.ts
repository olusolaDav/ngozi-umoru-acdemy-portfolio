import { NextResponse } from "next/server"
import { getDb } from "@/lib/mongodb"

// GET - Fetch public resources (no auth required)
export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const limit = Number(url.searchParams.get("limit") || 20)
    const skip = Number(url.searchParams.get("skip") || 0)
    const category = url.searchParams.get("category")

    const db = await getDb()

    // Build query - only fetch active resources
    const query: any = { isActive: { $ne: false } }
    if (category && category !== "all") {
      query.category = category
    }

    // Fetch resources sorted by newest first (use uploadedAt as primary, fallback to createdAt)
    const resources = await db
      .collection("resources")
      .find(query)
      .sort({ uploadedAt: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray()

    // Get total count for pagination
    const total = await db.collection("resources").countDocuments(query)

    // Get unique categories
    const categories = await db.collection("resources").distinct("category")

    return NextResponse.json({
      ok: true,
      resources: resources.map((r) => {
        // Handle the nested file structure from admin API (source of truth)
        const file = r.file || {}
        
        return {
          _id: r._id.toString(),
          title: r.title,
          description: r.description || "",
          category: r.category,
          // File URLs
          fileUrl: file.url || r.fileUrl,
          downloadUrl: file.downloadUrl || r.downloadUrl || null,
          // File metadata - prioritize nested file object
          fileName: file.originalName || r.fileName,
          format: file.format || r.format || null,
          resourceType: file.resourceType || r.resourceType,
          bytes: file.size || r.bytes,
          thumbnail: file.thumbnail || r.thumbnail || null,
          // Dates
          createdAt: r.uploadedAt || r.createdAt,
        }
      }),
      total,
      categories,
    })
  } catch (error) {
    console.error("GET /api/resources error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
