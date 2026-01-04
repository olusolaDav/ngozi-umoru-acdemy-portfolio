import { NextResponse } from "next/server"
import { verifySession } from "@/lib/auth"
import { getDb } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

// --------------------
// Helpers
// --------------------
function parseCookies(cookieHeader: string | null) {
  if (!cookieHeader) return {}
  return Object.fromEntries(
    cookieHeader
      .split(";")
      .map(c => c.trim().split("="))
      .map(([k, v]) => [k, decodeURIComponent(v)])
  )
}

// --------------------
// POST – Create Resource
// --------------------
export async function POST(req: Request) {
  try {
    // --------------------
    // Auth
    // --------------------
    const cookieHeader = req.headers.get("cookie")
    const cookies = parseCookies(cookieHeader)
    const session = cookies.session

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const payload = verifySession(session)
    if (!payload || (payload as any).role !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    // --------------------
    // Form Data
    // --------------------
    const formData = await req.formData()

    const file = formData.get("file") as File
    const title = formData.get("title") as string
    const description = (formData.get("description") as string) || ""
    const category = formData.get("category") as string
    const targetAudience = (formData.get("targetAudience") as string) || "all"

    if (!file || !title || !category) {
      return NextResponse.json(
        { error: "Missing required fields: file, title, category" },
        { status: 400 }
      )
    }

    // --------------------
    // Upload via /api/upload/file (DRY)
    // --------------------
    const uploadFormData = new FormData()
    uploadFormData.append("file", file)
    uploadFormData.append("folder", "resources")

    const uploadResponse = await fetch(
      `${process.env.APP_URL || "https://ngoziumoru.info"}/api/upload/file`,
      {
        method: "POST",
        body: uploadFormData,
        headers: {
          cookie: cookieHeader || "",
        },
      }
    )

    if (!uploadResponse.ok) {
      const err = await uploadResponse.json().catch(() => ({}))
      throw new Error(err.error || "File upload failed")
    }

    const uploadData = await uploadResponse.json()

    if (!uploadData?.data?.url) {
      throw new Error("Invalid upload response from upload service")
    }

    // --------------------
    // IMPORTANT: URL SELECTION LOGIC
    // --------------------
    const {
      url,
      downloadUrl,
      publicId,
      resourceType,
      bytes,
      format,
      thumbnail,
    } = uploadData.data

    /**
     * RULE:
     * - raw (pdf/doc/xls): use downloadUrl
     * - image/video/audio: use url
     */
    const primaryUrl =
      resourceType === "raw" && downloadUrl ? downloadUrl : url

    // --------------------
    // Save to DB
    // --------------------
    const db = await getDb()
    const resourcesCollection = db.collection("resources")

    const resource = {
      title,
      description,
      category,
      targetAudience,
      file: {
        url: primaryUrl,        // UI should always use this
        viewUrl: url || null,   // optional preview
        downloadUrl: downloadUrl || null,
        publicId,
        originalName: file.name,
        size: bytes,
        format,
        resourceType,
        thumbnail: thumbnail || null,
      },
      uploadedBy: (payload as any).userId,
      uploadedAt: new Date(),
      downloads: 0,
      isActive: true,
    }

    const result = await resourcesCollection.insertOne(resource)

    return NextResponse.json({
      success: true,
      resource: {
        _id: result.insertedId.toString(),
        ...resource,
      },
    })
  } catch (error: any) {
    console.error("[ADMIN_RESOURCE_UPLOAD]", error)
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    )
  }
}

// --------------------
// GET – List Resources
// --------------------
export async function GET(req: Request) {
  try {
    const cookieHeader = req.headers.get("cookie")
    const cookies = parseCookies(cookieHeader)
    const session = cookies.session

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const payload = verifySession(session)
    if (!payload || (payload as any).role !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const search = searchParams.get("search") || ""
    const category = searchParams.get("category") || "all"
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "12")

    const db = await getDb()
    const resourcesCollection = db.collection("resources")

    let query: any = { isActive: true }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { category: { $regex: search, $options: "i" } },
      ]
    }

    if (category !== "all") {
      query.category = category
    }

    const skip = (page - 1) * limit

    const resources = await resourcesCollection
      .find(query)
      .sort({ uploadedAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray()

    const total = await resourcesCollection.countDocuments(query)

    return NextResponse.json({
      resources: resources.map(r => ({
        ...r,
        _id: r._id.toString(),
      })),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("[ADMIN_RESOURCES_GET]", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// --------------------
// DELETE – Soft Delete
// --------------------
export async function DELETE(req: Request) {
  try {
    const cookieHeader = req.headers.get("cookie")
    const cookies = parseCookies(cookieHeader)
    const session = cookies.session

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const payload = verifySession(session)
    if (!payload || (payload as any).role !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    const { ids } = await req.json()

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: "No resource IDs provided" }, { status: 400 })
    }

    const db = await getDb()
    const resourcesCollection = db.collection("resources")

    const objectIds = ids.map(id => new ObjectId(id))

    const result = await resourcesCollection.updateMany(
      { _id: { $in: objectIds } },
      { $set: { isActive: false, deletedAt: new Date() } }
    )

    return NextResponse.json({
      success: true,
      deletedCount: result.modifiedCount,
    })
  } catch (error) {
    console.error("[ADMIN_RESOURCES_DELETE]", error)
    return NextResponse.json(
      { error: "Failed to delete resources" },
      { status: 500 }
    )
  }
}
