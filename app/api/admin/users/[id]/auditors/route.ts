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
 * Get all available auditors for assignment
 * GET /api/admin/users/[id]/assign-auditor
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

    // Get client and check if they already have an assigned auditor
    const client = await usersCollection.findOne({
      _id: new ObjectId(id),
      role: "client"
    })

    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 })
    }

    // Get all active auditors
    const auditors = await usersCollection
      .find({
        role: "auditor",
        status: "active"
      })
      .project({
        _id: 1,
        name: 1,
        email: 1,
        avatar: 1,
        phone: 1,
        address: 1,
        expertise: 1,
        addedSince: 1
      })
      .sort({ name: 1 })
      .toArray()

    const auditorList = auditors.map(auditor => ({
      _id: auditor._id.toString(),
      name: auditor.name,
      email: auditor.email,
      avatar: auditor.avatar,
      phone: auditor.phone,
      address: auditor.address,
      expertise: auditor.expertise,
      addedSince: auditor.addedSince,
      isAssigned: client.assignedAuditor?._id?.toString() === auditor._id.toString()
    }))

    return NextResponse.json({
      success: true,
      client: {
        _id: client._id.toString(),
        name: client.name,
        companyName: client.companyName
      },
      auditors: auditorList,
      currentAuditor: client.assignedAuditor || null
    })
  } catch (error: any) {
    console.error("[GET_AUDITORS] Error:", error)
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    )
  }
}
