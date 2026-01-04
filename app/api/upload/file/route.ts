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
      .map(c => c.trim().split("="))
      .map(([k, v]) => [k, decodeURIComponent(v)])
  )
}

// Max file size: 100MB
const MAX_FILE_SIZE = 100 * 1024 * 1024

// --------------------
// POST Handler
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
    const folder = (formData.get("folder") as string) || "uploads"

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File size exceeds 100MB limit" },
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
    // File Classification
    // --------------------
    const isImage = file.type.startsWith("image/")
    const isVideo = file.type.startsWith("video/")
    const isAudio = file.type.startsWith("audio/")

    const resourceType = isImage
      ? "image"
      : isVideo
      ? "video"
      : isAudio
      ? "video"
      : "raw"

    // --------------------
    // Upload Options
    // --------------------
    const uploadFolder = `accuvice/${folder}/${(payload as any).role}`

    const uploadOptions: any = {
      resource_type: resourceType,
      folder: uploadFolder,
      overwrite: false,
      use_filename: true,
      unique_filename: true,
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
    // URL Handling (CRITICAL FIX)
    // --------------------
    let viewUrl: string
    let downloadUrl: string | null = null

    if (uploadResult.resource_type === "raw") {
      viewUrl = `https://res.cloudinary.com/${cloudName}/raw/upload/${uploadResult.public_id}`
      downloadUrl = `https://res.cloudinary.com/${cloudName}/raw/upload/fl_attachment/${uploadResult.public_id}`
    } else {
      viewUrl = uploadResult.secure_url
    }

    // --------------------
    // Response
    // --------------------
    return NextResponse.json({
      ok: true,
      data: {
        url: viewUrl,
        downloadUrl,
        publicId: uploadResult.public_id,
        resourceType: uploadResult.resource_type,
        format: uploadResult.format,
        bytes: uploadResult.bytes,
        originalFilename: file.name,
        thumbnail:
          uploadResult.resource_type === "image"
            ? `https://res.cloudinary.com/${cloudName}/image/upload/w_350,h_250,c_fill,f_auto,q_auto/${uploadResult.public_id}`
            : null,
      },
    })
  } catch (error: any) {
    console.error("[UPLOAD ERROR]", error)
    return NextResponse.json(
      { error: error?.message || "Upload failed" },
      { status: 500 }
    )
  }
}
