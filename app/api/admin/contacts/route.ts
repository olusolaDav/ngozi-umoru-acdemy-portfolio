import { NextRequest, NextResponse } from "next/server"
import { getDb } from "@/lib/mongodb"
import { verifySession } from "@/lib/auth"
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

// GET: Fetch all contact submissions with pagination
export async function GET(request: NextRequest) {
  try {
    const cookieHeader = request.headers.get("cookie")
    const cookies = parseCookies(cookieHeader)
    const session = cookies.session
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const payload = verifySession(session)
    if (!payload || (payload as any).role !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "12")
    const search = searchParams.get("search") || ""
    const status = searchParams.get("status") || "all"
    const department = searchParams.get("department") || "all"
    const sort = searchParams.get("sort") || "newest"

    const db = await getDb()
    const collection = db.collection("contact_submissions")

    // Build query
    const query: any = {}
    
    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { message: { $regex: search, $options: "i" } },
      ]
    }

    if (status !== "all") {
      query.status = status
    }

    if (department !== "all") {
      query.department = department
    }

    // Sort options
    let sortOption: any = { createdAt: -1 } // newest first
    if (sort === "oldest") {
      sortOption = { createdAt: 1 }
    } else if (sort === "name") {
      sortOption = { fullName: 1 }
    }

    // Get total count
    const total = await collection.countDocuments(query)
    const pages = Math.ceil(total / limit)
    const skip = (page - 1) * limit

    // Fetch submissions
    const submissions = await collection
      .find(query)
      .sort(sortOption)
      .skip(skip)
      .limit(limit)
      .toArray()

    // Get counts by status
    const stats = await collection.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 }
        }
      }
    ]).toArray()

    const statusCounts = {
      total: total,
      unread: stats.find(s => s._id === "unread")?.count || 0,
      read: stats.find(s => s._id === "read")?.count || 0,
      replied: stats.find(s => s._id === "replied")?.count || 0,
    }

    return NextResponse.json({
      submissions: submissions.map(s => ({
        ...s,
        _id: s._id.toString(),
      })),
      pagination: {
        page,
        limit,
        total,
        pages,
      },
      stats: statusCounts,
    })
  } catch (error) {
    console.error("Failed to fetch contact submissions:", error)
    return NextResponse.json(
      { error: "Failed to fetch contact submissions" },
      { status: 500 }
    )
  }
}
