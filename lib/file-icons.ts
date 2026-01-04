import {
  FileText,
  File,
  Video,
  Image,
  Music,
  Code,
  FileJson,
  Archive,
  Layers,
  LucideIcon,
} from "lucide-react"

export interface FileTypeInfo {
  icon: LucideIcon
  label: string
  color: string // Tailwind color classes for the icon
  bgColor: string // Tailwind bg color classes
  category: "document" | "image" | "video" | "audio" | "spreadsheet" | "presentation" | "code" | "archive" | "other"
}

export const getFileTypeInfo = (filename: string, resourceType?: string): FileTypeInfo => {
  const ext = filename.toLowerCase().split(".").pop() || ""

  // PDF
  if (ext === "pdf") {
    return {
      icon: FileText,
      label: "PDF",
      color: "text-red-600",
      bgColor: "bg-red-50 dark:bg-red-950/30",
      category: "document",
    }
  }

  // Word Documents
  if (["doc", "docx", "docm"].includes(ext)) {
    return {
      icon: FileText,
      label: ext.toUpperCase(),
      color: "text-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-950/30",
      category: "document",
    }
  }

  // PowerPoint
  if (["ppt", "pptx", "pptm", "odp"].includes(ext)) {
    return {
      icon: Layers,
      label: ext.toUpperCase(),
      color: "text-orange-600",
      bgColor: "bg-orange-50 dark:bg-orange-950/30",
      category: "presentation",
    }
  }

  // Excel/Spreadsheet
  if (["xls", "xlsx", "xlsm", "csv", "ods"].includes(ext)) {
    return {
      icon: Layers,
      label: ext.toUpperCase(),
      color: "text-green-600",
      bgColor: "bg-green-50 dark:bg-green-950/30",
      category: "spreadsheet",
    }
  }

  // Images
  if (["jpg", "jpeg", "png", "gif", "webp", "svg", "bmp", "ico"].includes(ext)) {
    return {
      icon: Image,
      label: ext.toUpperCase(),
      color: "text-purple-600",
      bgColor: "bg-purple-50 dark:bg-purple-950/30",
      category: "image",
    }
  }

  // Videos
  if (["mp4", "mpeg", "mov", "mkv", "webm", "avi", "flv", "wmv", "m4v"].includes(ext)) {
    return {
      icon: Video,
      label: ext.toUpperCase(),
      color: "text-cyan-600",
      bgColor: "bg-cyan-50 dark:bg-cyan-950/30",
      category: "video",
    }
  }

  // Audio
  if (["mp3", "wav", "aac", "flac", "ogg", "m4a", "wma"].includes(ext)) {
    return {
      icon: Music,
      label: ext.toUpperCase(),
      color: "text-amber-600",
      bgColor: "bg-amber-50 dark:bg-amber-950/30",
      category: "audio",
    }
  }

  // Archives
  if (["zip", "rar", "7z", "tar", "gz", "bz2"].includes(ext)) {
    return {
      icon: Archive,
      label: ext.toUpperCase(),
      color: "text-yellow-600",
      bgColor: "bg-yellow-50 dark:bg-yellow-950/30",
      category: "archive",
    }
  }

  // Code Files
  if (["js", "ts", "jsx", "tsx", "py", "java", "cpp", "c", "cs", "rb", "php", "go", "rs", "swift", "kt"].includes(ext)) {
    return {
      icon: Code,
      label: ext.toUpperCase(),
      color: "text-slate-600",
      bgColor: "bg-slate-50 dark:bg-slate-950/30",
      category: "code",
    }
  }

  // JSON
  if (ext === "json") {
    return {
      icon: FileJson,
      label: "JSON",
      color: "text-indigo-600",
      bgColor: "bg-indigo-50 dark:bg-indigo-950/30",
      category: "code",
    }
  }

  // Text Files
  if (["txt", "md", "rtf"].includes(ext)) {
    return {
      icon: FileText,
      label: ext.toUpperCase(),
      color: "text-gray-600",
      bgColor: "bg-gray-50 dark:bg-gray-950/30",
      category: "document",
    }
  }

  // Default
  return {
    icon: File,
    label: ext.toUpperCase() || "FILE",
    color: "text-gray-600",
    bgColor: "bg-gray-50 dark:bg-gray-950/30",
    category: "other",
  }
}

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes"
  const k = 1024
  const sizes = ["Bytes", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i]
}

export const isImageFile = (filename: string): boolean => {
  const ext = filename.toLowerCase().split(".").pop() || ""
  return ["jpg", "jpeg", "png", "gif", "webp", "svg", "bmp"].includes(ext)
}

export const isVideoFile = (filename: string): boolean => {
  const ext = filename.toLowerCase().split(".").pop() || ""
  return ["mp4", "mpeg", "mov", "mkv", "webm", "avi", "flv", "wmv", "m4v"].includes(ext)
}

export const isPDFFile = (filename: string): boolean => {
  return filename.toLowerCase().endsWith(".pdf")
}

export const getCloudinaryUrl = (publicId: string, fileFormat: string, options?: Record<string, string | number>): string => {
  const baseUrl = "https://res.cloudinary.com/dztffms5x"
  const defaults = {
    quality: "auto",
    fetch_format: "auto",
  }
  const params = { ...defaults, ...options }
  const queryString = Object.entries(params)
    .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
    .join("&")

  return `${baseUrl}/image/upload/${queryString}/v1/${publicId}.${fileFormat}`
}
