// GET: List all form submissions (admin view)

import { NextRequest, NextResponse } from "next/server"
import { verifySession } from "@/lib/auth"
import { getAdminFormSubmissions, getFormDefinitions } from "@/lib/forms/form-db"

function parseCookies(cookieHeader: string | null) {
  if (!cookieHeader) return {}
  return Object.fromEntries(
    cookieHeader
      .split(";")
      .map((c) => c.trim().split("="))
      .map(([k, v]) => [k, decodeURIComponent(v)])
  )
}

export async function GET(request: NextRequest) {
  try {
    const cookieHeader = request.headers.get("cookie")
    const cookies = parseCookies(cookieHeader)
    const session = cookies.session

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const payload = verifySession(session) as any
    if (!payload || payload.role !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "12")
    const status = searchParams.get("status") as any || "all"
    const formId = searchParams.get("formId") || undefined
    const search = searchParams.get("search") || undefined
    const sector = searchParams.get("sector") || undefined

    const result = await getAdminFormSubmissions({
      page,
      limit,
      status,
      formId,
      search,
      sector,
    })

    // Get form definitions for filtering
    const formDefinitions = await getFormDefinitions()

    return NextResponse.json({
      success: true,
      ...result,
      formDefinitions,
    })
  } catch (error) {
    console.error("Error fetching admin forms:", error)
    return NextResponse.json(
      { error: "Failed to fetch form submissions" },
      { status: 500 }
    )
  }
}
