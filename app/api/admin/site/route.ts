import { NextResponse } from "next/server"
import { verifySession } from "@/lib/auth"
import { getDb } from "@/lib/mongodb"
import { defaultSiteContent, getMergedSiteContent, validateSection } from "@/lib/default-site-content"
import type { SiteContent } from "@/lib/site-types"

function parseCookies(cookieHeader: string | null) {
  if (!cookieHeader) return {}
  return Object.fromEntries(
    cookieHeader
      .split(";")
      .map(c => c.trim().split("="))
      .map(([k, v]) => [k, decodeURIComponent(v)])
  )
}

// Valid sections that can be updated
const VALID_SECTIONS = [
  "hero", 
  "about", 
  "experience", 
  "education", 
  "publications",
  "profile",
  "footer",
  "metadata"
] as const

// GET - Fetch site content (public access)
export async function GET(req: Request) {
  try {
    const db = await getDb()
    const siteContent = await db.collection("site_content").findOne({ type: "homepage" })

    if (!siteContent || !siteContent.content) {
      // Return default content from imported data files
      return NextResponse.json({ 
        ok: true, 
        content: defaultSiteContent,
        source: "default"
      })
    }

    // Merge with defaults to ensure all fields exist
    const mergedContent = getMergedSiteContent(siteContent.content as Partial<SiteContent>)

    return NextResponse.json({ 
      ok: true, 
      content: mergedContent,
      source: "database",
      updatedAt: siteContent.updatedAt
    })
  } catch (error) {
    console.error("GET /api/admin/site error:", error)
    // Return default content as fallback on error
    return NextResponse.json({ 
      ok: true, 
      content: defaultSiteContent,
      source: "fallback",
      error: "Database unavailable, using default content"
    })
  }
}

// PUT - Update site content (admin only)
export async function PUT(req: Request) {
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

    const db = await getDb()
    const body = await req.json()

    // Get current content or use defaults
    let currentDoc = await db.collection("site_content").findOne({ type: "homepage" })
    let content: SiteContent = currentDoc?.content 
      ? getMergedSiteContent(currentDoc.content as Partial<SiteContent>)
      : JSON.parse(JSON.stringify(defaultSiteContent))

    // Handle section update
    if (body.section && body.data) {
      // Validate section name
      if (!VALID_SECTIONS.includes(body.section)) {
        return NextResponse.json({ 
          error: `Invalid section. Valid sections: ${VALID_SECTIONS.join(", ")}` 
        }, { status: 400 })
      }

      // Validate section data
      if (!validateSection(body.section, body.data)) {
        return NextResponse.json({ 
          error: `Invalid data for section: ${body.section}` 
        }, { status: 400 })
      }

      // Update the specific section
      (content as any)[body.section] = body.data
    } 
    // Handle full content update
    else if (body.content) {
      content = getMergedSiteContent(body.content as Partial<SiteContent>)
    }

    // Upsert the content
    await db.collection("site_content").updateOne(
      { type: "homepage" },
      { 
        $set: { 
          content,
          updatedAt: new Date(),
          updatedBy: (payload as any).userId,
        } 
      },
      { upsert: true }
    )

    return NextResponse.json({ 
      ok: true, 
      message: body.section 
        ? `${body.section.charAt(0).toUpperCase() + body.section.slice(1)} section updated successfully`
        : "Site content updated successfully"
    })
  } catch (error) {
    console.error("PUT /api/admin/site error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// DELETE - Reset site content to defaults (admin only)
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

    const db = await getDb()
    const url = new URL(req.url)
    const section = url.searchParams.get("section")

    if (section) {
      // Reset specific section to default
      if (!VALID_SECTIONS.includes(section as any)) {
        return NextResponse.json({ error: "Invalid section" }, { status: 400 })
      }

      const currentDoc = await db.collection("site_content").findOne({ type: "homepage" })
      const content: SiteContent = currentDoc?.content 
        ? getMergedSiteContent(currentDoc.content as Partial<SiteContent>)
        : JSON.parse(JSON.stringify(defaultSiteContent))

      // Reset the specific section to default  
      (content as any)[section] = (defaultSiteContent as any)[section]

      await db.collection("site_content").updateOne(
        { type: "homepage" },
        { 
          $set: { 
            content,
            updatedAt: new Date(),
            updatedBy: (payload as any).userId,
          } 
        },
        { upsert: true }
      )

      return NextResponse.json({ 
        ok: true, 
        message: `${section.charAt(0).toUpperCase() + section.slice(1)} section reset to default`
      })
    }

    // Reset all content to defaults
    await db.collection("site_content").updateOne(
      { type: "homepage" },
      { 
        $set: { 
          content: defaultSiteContent,
          updatedAt: new Date(),
          updatedBy: (payload as any).userId,
        } 
      },
      { upsert: true }
    )

    return NextResponse.json({ 
      ok: true, 
      message: "All site content reset to defaults"
    })
  } catch (error) {
    console.error("DELETE /api/admin/site error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
