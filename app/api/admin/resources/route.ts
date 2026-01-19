import { NextResponse } from "next/server"
import { verifySession } from "@/lib/auth"
import { getDb } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

function parseCookies(cookieHeader: string | null) {
  if (!cookieHeader) return {}
  return Object.fromEntries(
    cookieHeader
      .split(";")
      .map((c) => c.trim().split("="))
      .map(([k, v]) => [k, decodeURIComponent(v)])
  )
}

export async function POST(req: Request) {
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

    const formData = await req.formData()
    const file = formData.get("file") as File
    const title = formData.get("title") as string
    const description = formData.get("description") as string
    const category = formData.get("category") as string
    const targetAudience = formData.get("targetAudience") as string || "all"
    
    if (!file || !title || !category) {
      return NextResponse.json({ 
        error: "Missing required fields: file, title, and category" 
      }, { status: 400 })
    }

    // Upload file to Cloudinary via the unified upload API
    const uploadFormData = new FormData()
    uploadFormData.append("file", file)
    uploadFormData.append("folder", "resources")
    // Don't set public_id - let Cloudinary use the original filename with extension
    // This is critical for raw files (documents) to be downloadable

    const uploadResponse = await fetch(`${process.env.APP_URL || "http://localhost:3000"}/api/upload/file`, {
      method: "POST",
      body: uploadFormData,
      headers: {
        cookie: cookieHeader || ""
      }
    })

    if (!uploadResponse.ok) {
      const uploadError = await uploadResponse.json().catch(() => ({ error: "Upload failed" }))
      console.error("[ADMIN_RESOURCE_UPLOAD] Upload error:", uploadError)
      throw new Error(uploadError.error || "Failed to upload file")
    }

    const uploadData = await uploadResponse.json()
    
    if (!uploadData.data?.url) {
      throw new Error("Invalid upload response - missing file URL")
    }
    
    const fileUrl = uploadData.data.url
    const filePublicId = uploadData.data.publicId

    // Save resource metadata to database
    const db = await getDb()
    const resourcesCollection = db.collection("resources")

    const resource = {
      title,
      description: description || "",
      category,
      targetAudience,
      file: {
        url: fileUrl,
        publicId: filePublicId,
        originalName: file.name,
        size: uploadData.data.bytes,
        format: uploadData.data.format,
        resourceType: uploadData.data.resourceType,
        thumbnail: uploadData.data.thumbnail || null
      },
      uploadedBy: (payload as any).userId,
      uploadedAt: new Date(),
      downloads: 0,
      isActive: true
    }

    const result = await resourcesCollection.insertOne(resource)

    console.log(`[ADMIN_RESOURCE_UPLOAD] Resource uploaded: ${title}`)

    return NextResponse.json({
      success: true,
      resource: {
        _id: result.insertedId.toString(),
        ...resource
      }
    })

  } catch (error: any) {
    console.error("[ADMIN_RESOURCE_UPLOAD] Error:", error.message)
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    )
  }
}

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

    const { url } = req
    const { searchParams } = new URL(url)
    const search = searchParams.get("search") || ""
    const category = searchParams.get("category") || "all"
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "12")

    const db = await getDb()
    const resourcesCollection = db.collection("resources")

    // Build query
    let query: any = { isActive: true }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { category: { $regex: search, $options: "i" } }
      ]
    }

    if (category !== "all") {
      query.category = category
    }

    // Calculate skip for pagination
    const skip = (page - 1) * limit

    // Get resources with pagination
    const resources = await resourcesCollection
      .find(query)
      .sort({ uploadedAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray()

    // Get total count
    const total = await resourcesCollection.countDocuments(query)

    // Transform data
    const transformedResources = resources.map(resource => ({
      _id: resource._id.toString(),
      title: resource.title,
      description: resource.description,
      category: resource.category,
      targetAudience: resource.targetAudience,
      file: resource.file,
      uploadedBy: resource.uploadedBy,
      uploadedAt: resource.uploadedAt,
      downloads: resource.downloads,
      isActive: resource.isActive
    }))

    return NextResponse.json({
      resources: transformedResources,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })

  } catch (error: any) {
    console.error("[ADMIN_RESOURCES_LIST] Error:", error.message)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// DELETE - Delete one or more resources
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

    const body = await req.json()
    const { ids } = body

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: "No resource IDs provided" }, { status: 400 })
    }

    const db = await getDb()
    const resourcesCollection = db.collection("resources")

    // Convert string IDs to ObjectIds
    const objectIds = ids.map((id: string) => new ObjectId(id))

    // Delete resources (soft delete by setting isActive to false)
    const result = await resourcesCollection.updateMany(
      { _id: { $in: objectIds } },
      { $set: { isActive: false, deletedAt: new Date() } }
    )

    console.log(`[ADMIN_RESOURCES_DELETE] Deleted ${result.modifiedCount} resources`)

    return NextResponse.json({
      success: true,
      deletedCount: result.modifiedCount
    })

  } catch (error: any) {
    console.error("[ADMIN_RESOURCES_DELETE] Error:", error.message)
    return NextResponse.json(
      { error: "Failed to delete resources" },
      { status: 500 }
    )
  }
}
