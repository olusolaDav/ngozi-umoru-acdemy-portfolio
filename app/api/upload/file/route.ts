import { NextResponse } from "next/server"
import { verifySession } from "@/lib/auth"
import { v2 as cloudinary } from "cloudinary"

function parseCookies(cookieHeader: string | null) {
  if (!cookieHeader) return {}
  return Object.fromEntries(
    cookieHeader
      .split(";")
      .map((c) => c.trim().split("="))
      .map(([k, v]) => [k, decodeURIComponent(v)])
  )
}

// Allowed file types and their corresponding Cloudinary resource types
const FILE_CONFIG = {
  // Images
  "image/jpeg": { resourceType: "image", maxSize: 10 * 1024 * 1024 }, // 10MB
  "image/png": { resourceType: "image", maxSize: 10 * 1024 * 1024 },
  "image/gif": { resourceType: "image", maxSize: 10 * 1024 * 1024 },
  "image/webp": { resourceType: "image", maxSize: 10 * 1024 * 1024 },
  "image/svg+xml": { resourceType: "image", maxSize: 5 * 1024 * 1024 },
  
  // Documents - PDFs as raw for download, thumbnails generated separately
  "application/pdf": { resourceType: "raw", maxSize: 50 * 1024 * 1024 }, // 50MB
  "application/msword": { resourceType: "raw", maxSize: 50 * 1024 * 1024 }, // .doc
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": { resourceType: "raw", maxSize: 50 * 1024 * 1024 }, // .docx
  "application/vnd.ms-excel": { resourceType: "raw", maxSize: 50 * 1024 * 1024 }, // .xls
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": { resourceType: "raw", maxSize: 50 * 1024 * 1024 }, // .xlsx
  "application/vnd.ms-powerpoint": { resourceType: "raw", maxSize: 100 * 1024 * 1024 }, // .ppt - 100MB
  "application/vnd.openxmlformats-officedocument.presentationml.presentation": { resourceType: "raw", maxSize: 100 * 1024 * 1024 }, // .pptx - 100MB
  "text/plain": { resourceType: "raw", maxSize: 5 * 1024 * 1024 }, // .txt
  "text/csv": { resourceType: "raw", maxSize: 10 * 1024 * 1024 }, // .csv
  
  // Videos
  "video/mp4": { resourceType: "video", maxSize: 100 * 1024 * 1024 }, // 100MB
  "video/webm": { resourceType: "video", maxSize: 100 * 1024 * 1024 },
  "video/quicktime": { resourceType: "video", maxSize: 100 * 1024 * 1024 },
  
  // Audio
  "audio/mpeg": { resourceType: "video", maxSize: 50 * 1024 * 1024 }, // 50MB
  "audio/wav": { resourceType: "video", maxSize: 50 * 1024 * 1024 },
  "audio/ogg": { resourceType: "video", maxSize: 50 * 1024 * 1024 },
} as const

type AllowedMimeType = keyof typeof FILE_CONFIG

export async function POST(req: Request) {
  try {
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

    const formData = await req.formData()
    const file = formData.get("file") as File
    const folder = formData.get("folder") as string || "uploads"
    const publicId = formData.get("public_id") as string || undefined
    
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Check if file type is allowed
    const fileConfig = FILE_CONFIG[file.type as AllowedMimeType]
    if (!fileConfig) {
      return NextResponse.json({ 
        error: `File type '${file.type}' is not allowed. Supported types: images (JPEG, PNG, GIF, WebP, SVG), documents (PDF, Word, Excel, PowerPoint, TXT, CSV), videos (MP4, WebM), audio (MP3, WAV, OGG)` 
      }, { status: 400 })
    }

    // Validate file size based on type
    if (file.size > fileConfig.maxSize) {
      const maxSizeMB = fileConfig.maxSize / (1024 * 1024)
      return NextResponse.json({ 
        error: `File size exceeds ${maxSizeMB}MB limit for this file type` 
      }, { status: 400 })
    }

    // Get Cloudinary config
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
    const apiKey = process.env.CLOUDINARY_API_KEY
    const apiSecret = process.env.CLOUDINARY_API_SECRET

    console.log(`[UPLOAD] Cloudinary config - cloud: ${cloudName}, apiKey: ${apiKey ? 'SET' : 'MISSING'}, apiSecret: ${apiSecret ? 'SET' : 'MISSING'}`)

    if (!cloudName || !apiKey || !apiSecret) {
      return NextResponse.json({ error: "Cloudinary configuration missing. Please add CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET to your .env file." }, { status: 500 })
    }

    // Configure Cloudinary with API credentials for signed uploads
    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
    })

    console.log(`[UPLOAD] Uploading ${file.type} (${(file.size / 1024).toFixed(1)}KB) to Cloudinary with signed upload...`)

    // Determine upload options based on resource type
    const resourceType = fileConfig.resourceType
    const uploadFolder = `academic-portfolio/${folder}/${(payload as any).role}`

    // Convert file to buffer for streaming upload (more efficient for large files)
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // For raw files (documents), we need to include the file extension in public_id
    // so that Cloudinary serves the file with the correct extension
    let finalPublicId = publicId
    if (resourceType === 'raw' && !publicId) {
      // Use the original filename (with extension) for raw files
      // This ensures the download URL includes the extension
      finalPublicId = file.name
    }

    // Upload to Cloudinary using streaming with retry logic
    let cloudinaryResponse
    const maxRetries = 2
    let lastError

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`[UPLOAD] Attempt ${attempt}/${maxRetries} for file: ${file.name}`)
        
        cloudinaryResponse = await new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            {
              resource_type: resourceType as "image" | "raw" | "video" | "auto",
              folder: uploadFolder,
              public_id: finalPublicId,
              use_filename: true,
              unique_filename: true,
              timeout: 120000, // 2 minute timeout
              chunk_size: 6000000, // 6MB chunks for better network handling
            },
            (error, result) => {
              if (error) {
                reject(error)
              } else {
                resolve(result)
              }
            }
          )
          uploadStream.end(buffer)
        }) as any
        
        // If we get here, upload succeeded
        break
        
      } catch (error: any) {
        lastError = error
        console.log(`[UPLOAD] Attempt ${attempt} failed:`, error?.message)
        
        // If this is the last attempt, throw the error
        if (attempt === maxRetries) {
          throw lastError
        }
        
        // Wait before retrying (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, attempt * 2000))
      }
    }

    console.log(`[UPLOAD] Success: ${cloudinaryResponse.secure_url}`)

    // Generate thumbnail URL
    let thumbnail = null
    const isPDF = file.type === 'application/pdf' || cloudinaryResponse.format === 'pdf'
    
    if (cloudinaryResponse.resource_type === 'image' && !isPDF) {
      // For regular images, create a resized thumbnail
      thumbnail = `https://res.cloudinary.com/${cloudName}/image/upload/w_350,h_250,c_fill,f_auto,q_auto/${cloudinaryResponse.public_id}`
    }
    // Note: PDFs uploaded as 'raw' don't support thumbnail generation
    // The UI will show a PDF icon placeholder instead

    return NextResponse.json({
      ok: true,
      data: {
        url: cloudinaryResponse.secure_url,
        publicId: cloudinaryResponse.public_id,
        format: cloudinaryResponse.format,
        resourceType: cloudinaryResponse.resource_type,
        bytes: cloudinaryResponse.bytes,
        originalFilename: cloudinaryResponse.original_filename,
        thumbnail: thumbnail,
        isPDF: isPDF,
      },
    })
  } catch (error: any) {
    console.error("[UPLOAD] Full error:", error)
    console.error("[UPLOAD] Error message:", error?.message)
    console.error("[UPLOAD] Error http_code:", error?.http_code)
    console.error("[UPLOAD] Error error:", error?.error)
    
    const errorMessage = error?.message || error?.error?.message || JSON.stringify(error) || "Unknown upload error"
    return NextResponse.json({ 
      error: errorMessage
    }, { status: 500 })
  }
}
