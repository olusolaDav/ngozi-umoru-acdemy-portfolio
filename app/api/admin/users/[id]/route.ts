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
    const usersCollection = db.collection("users")

    // Get user details
    const user = await usersCollection.findOne(
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

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // If this is a client, get their collaborators
    let collaborators: any[] = []
    if (user.role === "client") {
      const collabDocs = await usersCollection
        .find({ 
          role: "collaborator", 
          addedBy: new ObjectId(id),
          deleted: { $ne: true }
        })
        .toArray()
      
      collaborators = collabDocs.map(collab => ({
        _id: collab._id.toString(),
        name: collab.name || "Unknown",
        email: collab.email,
        avatar: collab.avatar || null,
        jobTitle: collab.repTitle || collab.title || "Collaborator",
        companyName: user.companyName || user.name || "Not specified",
        addedSince: collab.createdAt ? new Date(collab.createdAt).toLocaleDateString('en-GB', {
          day: 'numeric',
          month: 'long', 
          year: 'numeric'
        }) : "Unknown",
        clientId: id
      }))
    }

    // Transform user data
    const userData = {
      _id: user._id.toString(),
      name: user.name || "Unknown",
      email: user.email,
      role: user.role,
      status: user.status || "active",
      companyName: user.companyName || user.name || "Not specified",
      companyLogo: user.companyLogo || null,
      avatar: user.avatar || null,
      sector: user.sector || null,
      addedSince: user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'long', 
        year: 'numeric'
      }) : "Unknown",
      phone: user.phone || null,
      address: user.address || null,
      cityState: user.cityState || null,
      title: user.repTitle || user.title || (user.role?.charAt(0).toUpperCase() + user.role?.slice(1)),
      about: user.about || null,
      repName: user.repName || null,
      repTitle: user.repTitle || null,
      parentClientId: user.parentClientId || null,
      collaborators: collaborators,
      resourcesEnabled: user.resourcesEnabled || false
    }

    return NextResponse.json({ user: userData })

  } catch (error: any) {
    console.error("[ADMIN_USER_DETAIL] Error:", error.message)
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
    const { resourcesEnabled, status } = body

    const db = await getDb()
    const usersCollection = db.collection("users")

    // Build update object
    const updateFields: any = {}
    
    if (resourcesEnabled !== undefined) {
      updateFields["profile.resourcesEnabled"] = resourcesEnabled
    }
    
    if (status !== undefined) {
      updateFields.status = status
    }

    // Update user
    const result = await usersCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateFields }
    )

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true })

  } catch (error: any) {
    console.error("[ADMIN_USER_UPDATE] Error:", error.message)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// DELETE - Delete a user
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
    const usersCollection = db.collection("users")

    // Check if user exists
    const user = await usersCollection.findOne({ _id: new ObjectId(id) })
    
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Prevent deleting admin users
    if (user.role === "admin") {
      return NextResponse.json({ error: "Cannot delete admin users" }, { status: 403 })
    }

    // If deleting a client, also delete their collaborators
    if (user.role === "client") {
      await usersCollection.deleteMany({ 
        role: "collaborator",
        addedBy: new ObjectId(id)
      })
    }

    // Delete the user
    await usersCollection.deleteOne({ _id: new ObjectId(id) })

    return NextResponse.json({ success: true, message: "User deleted successfully" })

  } catch (error: any) {
    console.error("[ADMIN_USER_DELETE] Error:", error.message)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}