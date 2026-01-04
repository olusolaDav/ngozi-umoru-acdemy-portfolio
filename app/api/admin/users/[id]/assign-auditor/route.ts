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
 * Assign an auditor to a client
 * POST /api/admin/users/[id]/assign-auditor
 * Body: { auditorId: string }
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

    const { auditorId } = await req.json()

    if (!auditorId) {
      return NextResponse.json({ error: "Auditor ID is required" }, { status: 400 })
    }

    const db = await getDb()
    const usersCollection = db.collection("users")

    // Verify auditor exists and is an auditor
    const auditor = await usersCollection.findOne({
      _id: new ObjectId(auditorId),
      role: "auditor"
    })

    if (!auditor) {
      return NextResponse.json({ error: "Auditor not found" }, { status: 404 })
    }

    // Verify client exists
    const client = await usersCollection.findOne({
      _id: new ObjectId(id),
      role: "client"
    })

    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 })
    }

    // Update client with assigned auditor
    const result = await usersCollection.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          assignedAuditor: {
            _id: auditor._id,
            name: auditor.name,
            email: auditor.email,
            avatar: auditor.avatar,
            assignedAt: new Date()
          }
        }
      }
    )

    if (result.modifiedCount === 0) {
      return NextResponse.json({ error: "Failed to assign auditor" }, { status: 500 })
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
      message: `Auditor ${auditor.name} assigned successfully`
    })
  } catch (error: any) {
    console.error("[ASSIGN_AUDITOR] Error:", error)
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    )
  }
}
