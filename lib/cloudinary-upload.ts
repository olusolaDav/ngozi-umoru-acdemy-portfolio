import { v2 as cloudinary } from "cloudinary"

// Allowed file types and their corresponding Cloudinary resource types
const FILE_CONFIG = {
  // Images
  "image/jpeg": { resourceType: "image", maxSize: 10 * 1024 * 1024 }, // 10MB
  "image/png": { resourceType: "image", maxSize: 10 * 1024 * 1024 },
  "image/gif": { resourceType: "image", maxSize: 10 * 1024 * 1024 },
  "image/webp": { resourceType: "image", maxSize: 10 * 1024 * 1024 },
  "image/svg+xml": { resourceType: "image", maxSize: 5 * 1024 * 1024 },

  // Documents
  "application/pdf": { resourceType: "raw", maxSize: 50 * 1024 * 1024 },
  "application/msword": { resourceType: "raw", maxSize: 50 * 1024 * 1024 },
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": { resourceType: "raw", maxSize: 50 * 1024 * 1024 },
  "application/vnd.ms-excel": { resourceType: "raw", maxSize: 50 * 1024 * 1024 },
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": { resourceType: "raw", maxSize: 50 * 1024 * 1024 },
  "application/vnd.ms-powerpoint": { resourceType: "raw", maxSize: 100 * 1024 * 1024 },
  "application/vnd.openxmlformats-officedocument.presentationml.presentation": { resourceType: "raw", maxSize: 100 * 1024 * 1024 },
  "text/plain": { resourceType: "raw", maxSize: 5 * 1024 * 1024 },
  "text/csv": { resourceType: "raw", maxSize: 10 * 1024 * 1024 },

  // Videos
  "video/mp4": { resourceType: "video", maxSize: 100 * 1024 * 1024 },
  "video/webm": { resourceType: "video", maxSize: 100 * 1024 * 1024 },
  "video/quicktime": { resourceType: "video", maxSize: 100 * 1024 * 1024 },

  // Audio
  "audio/mpeg": { resourceType: "video", maxSize: 50 * 1024 * 1024 },
  "audio/wav": { resourceType: "video", maxSize: 50 * 1024 * 1024 },
  "audio/ogg": { resourceType: "video", maxSize: 50 * 1024 * 1024 },
} as const

type AllowedMimeType = keyof typeof FILE_CONFIG

export { FILE_CONFIG, type AllowedMimeType }

export interface UploadOptions {
  folder?: string
  publicId?: string
  /** Role of the uploader, used for folder organization */
  role?: string
}

export interface UploadResult {
  url: string
  publicId: string
  format: string
  resourceType: string
  bytes: number
  originalFilename: string
  thumbnail: string | null
  isPDF: boolean
}

/**
 * Upload a file directly to Cloudinary. Call this from server-side code
 * (API routes, server actions) instead of making an HTTP self-fetch.
 */
export async function uploadFileToCloudinary(
  file: File,
  options: UploadOptions = {}
): Promise<UploadResult> {
  const { folder = "uploads", publicId, role = "admin" } = options

  // Check if file type is allowed
  const fileConfig = FILE_CONFIG[file.type as AllowedMimeType]
  if (!fileConfig) {
    throw new Error(
      `File type '${file.type}' is not allowed. Supported types: images (JPEG, PNG, GIF, WebP, SVG), documents (PDF, Word, Excel, PowerPoint, TXT, CSV), videos (MP4, WebM), audio (MP3, WAV, OGG)`
    )
  }

  // Validate file size based on type
  if (file.size > fileConfig.maxSize) {
    const maxSizeMB = fileConfig.maxSize / (1024 * 1024)
    throw new Error(`File size exceeds ${maxSizeMB}MB limit for this file type`)
  }

  // Get Cloudinary config
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
  const apiKey = process.env.CLOUDINARY_API_KEY
  const apiSecret = process.env.CLOUDINARY_API_SECRET

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error(
      "Cloudinary configuration missing. Please add CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET to your .env file."
    )
  }

  // Configure Cloudinary
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
  })

  console.log(`[UPLOAD] Uploading ${file.type} (${(file.size / 1024).toFixed(1)}KB) to Cloudinary with signed upload...`)

  const resourceType = fileConfig.resourceType
  const uploadFolder = `academic-portfolio/${folder}/${role}`

  // Convert file to buffer
  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)

  // For raw files (documents), include file extension in public_id
  let finalPublicId = publicId
  if (resourceType === "raw" && !publicId) {
    finalPublicId = file.name
  }

  // Upload with retry logic
  let cloudinaryResponse: any
  const maxRetries = 2
  let lastError: any

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
            timeout: 120000,
            chunk_size: 6000000,
          },
          (error, result) => {
            if (error) reject(error)
            else resolve(result)
          }
        )
        uploadStream.end(buffer)
      })

      break // success
    } catch (error: any) {
      lastError = error
      console.log(`[UPLOAD] Attempt ${attempt} failed:`, error?.message)
      if (attempt === maxRetries) throw lastError
      await new Promise((resolve) => setTimeout(resolve, attempt * 2000))
    }
  }

  console.log(`[UPLOAD] Success: ${cloudinaryResponse.secure_url}`)

  // Generate thumbnail URL
  let thumbnail: string | null = null
  const isPDF = file.type === "application/pdf" || cloudinaryResponse.format === "pdf"

  if (cloudinaryResponse.resource_type === "image" && !isPDF) {
    thumbnail = `https://res.cloudinary.com/${cloudName}/image/upload/w_350,h_250,c_fill,f_auto,q_auto/${cloudinaryResponse.public_id}`
  }

  return {
    url: cloudinaryResponse.secure_url,
    publicId: cloudinaryResponse.public_id,
    format: cloudinaryResponse.format,
    resourceType: cloudinaryResponse.resource_type,
    bytes: cloudinaryResponse.bytes,
    originalFilename: cloudinaryResponse.original_filename,
    thumbnail,
    isPDF,
  }
}
