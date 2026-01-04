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

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
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

    const db = await getDb()
    const resourcesCollection = db.collection("resources")

    const resource = await resourcesCollection.findOne({ _id: new ObjectId(id) })

    if (!resource) {
      return NextResponse.json({ error: "Resource not found" }, { status: 404 })
    }

    return NextResponse.json({
      resource: {
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
      }
    })

  } catch (error: any) {
    console.error("[ADMIN_RESOURCE_DETAIL] Error:", error.message)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
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
    const { title, description, category, targetAudience, isActive } = body

    const db = await getDb()
    const resourcesCollection = db.collection("resources")

    // Build update object
    const updateFields: any = {}
    
    if (title !== undefined) updateFields.title = title
    if (description !== undefined) updateFields.description = description
    if (category !== undefined) updateFields.category = category
    if (targetAudience !== undefined) updateFields.targetAudience = targetAudience
    if (isActive !== undefined) updateFields.isActive = isActive
    
    updateFields.updatedAt = new Date()

    const result = await resourcesCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateFields }
    )

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Resource not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true })

  } catch (error: any) {
    console.error("[ADMIN_RESOURCE_UPDATE] Error:", error.message)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
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

    const db = await getDb()
    const resourcesCollection = db.collection("resources")

    // Soft delete - mark as inactive
    const result = await resourcesCollection.updateOne(
      { _id: new ObjectId(id) },
      { 
        $set: { 
          isActive: false,
          deletedAt: new Date()
        }
      }
    )

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Resource not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true })

  } catch (error: any) {
    console.error("[ADMIN_RESOURCE_DELETE] Error:", error.message)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}