import { NextResponse } from "next/server"
import { verifySession } from "@/lib/auth"
import { v2 as cloudinary } from "cloudinary"

// --------------------
// Helpers
// --------------------
function parseCookies(cookieHeader: string | null) {
  if (!cookieHeader) return {}
  return Object.fromEntries(
    cookieHeader
      .split(";")
      .map((c) => c.trim().split("="))
      .map(([k, v]) => [k, decodeURIComponent(v)])
  )
}

// Max file size: 10MB for blog images
const MAX_FILE_SIZE = 10 * 1024 * 1024

// --------------------
// POST Handler - Optimized for blog content images
// --------------------
export async function POST(req: Request) {
  try {
    // --------------------
    // Auth
    // --------------------
    const cookieHeader = req.headers.get("cookie")
    const cookies = parseCookies(cookieHeader)
    const session = cookies.session

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const payload = verifySession(session)
    if (!payload) {
      return NextResponse.json({ error: "Invalid session" }, { status: 403 })
    }

    // --------------------
    // Form Data
    // --------------------
    const formData = await req.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Validate it's an image
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "File must be an image" }, { status: 400 })
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "Image size exceeds 10MB limit" },
        { status: 400 }
      )
    }

    // --------------------
    // Cloudinary Config
    // --------------------
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
    const apiKey = process.env.CLOUDINARY_API_KEY
    const apiSecret = process.env.CLOUDINARY_API_SECRET

    if (!cloudName || !apiKey || !apiSecret) {
      return NextResponse.json(
        { error: "Cloudinary configuration missing" },
        { status: 500 }
      )
    }

    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
    })

    // --------------------
    // Upload Options - Optimized for blog images
    // --------------------
    const uploadOptions = {
      resource_type: "image" as const,
      folder: "blog_content",
      overwrite: false,
      unique_filename: true,
      // Optimize images automatically
      transformation: [
        { quality: "auto:good" },
        { fetch_format: "auto" },
      ],
    }

    // --------------------
    // Upload
    // --------------------
    const buffer = Buffer.from(await file.arrayBuffer())

    const uploadResult: any = await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(uploadOptions, (error, result) => {
          if (error) reject(error)
          else resolve(result)
        })
        .end(buffer)
    })

    // --------------------
    // Response
    // --------------------
    return NextResponse.json({
      ok: true,
      data: {
        url: uploadResult.secure_url,
        publicId: uploadResult.public_id,
        width: uploadResult.width,
        height: uploadResult.height,
        format: uploadResult.format,
        bytes: uploadResult.bytes,
      },
    })
  } catch (error: any) {
    console.error("Blog image upload error:", error)
    return NextResponse.json(
      { error: error.message || "Upload failed" },
      { status: 500 }
    )
  }
}
