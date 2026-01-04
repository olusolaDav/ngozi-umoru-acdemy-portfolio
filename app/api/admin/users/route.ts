import { NextResponse } from "next/server"
import { verifySession } from "@/lib/auth"
import { getDb } from "@/lib/mongodb"

function parseCookies(cookieHeader: string | null) {
  if (!cookieHeader) return {}
  return Object.fromEntries(
    cookieHeader
      .split(";")
      .map((c) => c.trim().split("="))
      .map(([k, v]) => [k, decodeURIComponent(v)])
  )
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
    const role = searchParams.get("role") || "all"
    const status = searchParams.get("status") || "all" 
    const sector = searchParams.get("sector") || "all"
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "12")
    const sort = searchParams.get("sort") || "newest"

    const db = await getDb()
    const usersCollection = db.collection("users")

    // Build query
    let query: any = {}

    // Exclude admin users from the list
    query.role = { $ne: "admin" }

    // Search filter
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { companyName: { $regex: search, $options: "i" } }
      ]
    }

    // Role filter
    if (role !== "all") {
      query.role = role
    }

    // Status filter  
    if (status !== "all") {
      query.status = status
    }

    // Sector filter
    if (sector !== "all") {
      query.sector = sector
    }

    // Sort options
    let sortOption: any = {}
    switch (sort) {
      case "newest":
        sortOption = { createdAt: -1 }
        break
      case "oldest":
        sortOption = { createdAt: 1 }
        break
      case "name":
        sortOption = { name: 1 }
        break
      case "email":
        sortOption = { email: 1 }
        break
      default:
        sortOption = { createdAt: -1 }
    }

    // Calculate skip for pagination
    const skip = (page - 1) * limit

    // Get users with pagination
    const users = await usersCollection
      .find(query, {
        projection: {
          password: 0, // Exclude password from response
          verificationCode: 0,
          resetPasswordToken: 0,
          resetPasswordExpires: 0
        }
      })
      .sort(sortOption)
      .skip(skip)
      .limit(limit)
      .toArray()

    // Get total count for pagination
    const total = await usersCollection.countDocuments(query)

    // For collaborators, get their client company names
    const collaboratorIds = users.filter(u => u.role === 'collaborator').map(u => u.addedBy).filter(Boolean)
    const clientsMap = new Map()
    
    if (collaboratorIds.length > 0) {
      const clients = await usersCollection
        .find({ _id: { $in: collaboratorIds } })
        .toArray()
      clients.forEach(client => {
        clientsMap.set(client._id.toString(), client.companyName || client.name || "Not specified")
      })
    }

    // Transform data to match frontend expectations
    const transformedUsers = users.map(user => ({
      _id: user._id.toString(),
      name: user.name || "Unknown",
      email: user.email,
      role: user.role,
      status: user.status || "active",
      companyName: user.role === 'collaborator' && user.addedBy 
        ? clientsMap.get(user.addedBy.toString()) || "Not specified"
        : user.companyName || user.name || "Not specified",
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
      parentClientId: user.parentClientId || null,
      // Note: Removed progress as per requirement
    }))

    return NextResponse.json({
      users: transformedUsers,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })

  } catch (error: any) {
    console.error("[ADMIN_USERS] Error:", error.message)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}