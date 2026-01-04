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

/**
 * Enable/configure resources for a client
 * POST /api/admin/users/[id]/enable-resources
 * Body: { resourceIds: string[] }
 */
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
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

    const { resourceIds } = await req.json()

    if (!Array.isArray(resourceIds)) {
      return NextResponse.json({ error: "resourceIds must be an array" }, { status: 400 })
    }

    const db = await getDb()
    const usersCollection = db.collection("users")

    // Verify client exists
    const client = await usersCollection.findOne({
      _id: new ObjectId(id),
      role: "client"
    })

    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 })
    }

    // Verify all resources exist
    const resourcesCollection = db.collection("resources")
    const resourceObjectIds = resourceIds.map(rid => new ObjectId(rid))
    
    const validResources = await resourcesCollection
      .find({ _id: { $in: resourceObjectIds } })
      .toArray()

    if (validResources.length !== resourceIds.length) {
      return NextResponse.json({ error: "Some resources not found" }, { status: 404 })
    }

    // Update client with enabled resources
    const result = await usersCollection.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          enabledResources: resourceObjectIds,
          resourcesEnabled: resourceIds.length > 0,
          enabledResourcesUpdatedAt: new Date()
        }
      }
    )

    if (result.modifiedCount === 0) {
      return NextResponse.json({ error: "Failed to enable resources" }, { status: 500 })
    }

    // Fetch and return updated client
    const updatedClient = await usersCollection.findOne(
      { _id: new ObjectId(id) },
      {
        projection: {
          password: 0,
          verificationCode: 0,
          resetPasswordToken: 0,
          resetPasswordExpires: 0
        }
      }
    )

    return NextResponse.json({
      success: true,
      user: updatedClient,
      message: `${resourceIds.length} resource(s) enabled successfully`
    })
  } catch (error: any) {
    console.error("[ENABLE_RESOURCES] Error:", error)
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    )
  }
}

/**
 * Get all resources available for a client to enable
 * GET /api/admin/users/[id]/enable-resources
 */
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
    const usersCollection = db.collection("users")

    // Get client and their enabled resources
    const client = await usersCollection.findOne({
      _id: new ObjectId(id),
      role: "client"
    })

    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 })
    }

    // Get all available resources
    const resourcesCollection = db.collection("resources")
    const resources = await resourcesCollection
      .find({ isActive: true })
      .sort({ uploadedAt: -1 })
      .toArray()

    // Map resources with enabled status
    const enabledResourceIds = (client.enabledResources || []).map((id: ObjectId) => id.toString())
    const resourcesWithStatus = resources.map(resource => ({
      _id: resource._id.toString(),
      title: resource.title,
      description: resource.description,
      category: resource.category,
      file: {
        url: resource.file.url,
        originalName: resource.file.originalName,
        format: resource.file.format,
        thumbnail: resource.file.thumbnail
      },
      uploadedAt: resource.uploadedAt,
      enabled: enabledResourceIds.includes(resource._id.toString())
    }))

    return NextResponse.json({
      success: true,
      client: {
        _id: client._id.toString(),
        name: client.name,
        companyName: client.companyName
      },
      resources: resourcesWithStatus,
      enabledCount: enabledResourceIds.length,
      totalCount: resourcesWithStatus.length
    })
  } catch (error: any) {
    console.error("[GET_RESOURCES] Error:", error)
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    )
  }
}
