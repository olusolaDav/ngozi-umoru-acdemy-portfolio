"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { ArrowLeft, Download, FileText, FileIcon, AlertCircle } from "lucide-react"

interface ResourceFile {
  url: string
  publicId?: string
  originalName?: string
  size?: number
  format?: string
  resourceType?: string
  thumbnail?: string
}

interface ResourceDetailsModalProps {
  resource: {
    _id: string
    title: string
    description: string
    file?: ResourceFile
    fileUrl?: string
  } | null
  onClose: () => void
  showDownload?: boolean
  isEnabled?: boolean
}

// Helper function to determine file type
const getFileType = (file?: ResourceFile): 'pdf' | 'word' | 'other' => {
  if (!file) return 'other'
  const format = file.format?.toLowerCase()
  const name = file.originalName?.toLowerCase() || ''
  
  if (format === 'pdf' || name.endsWith('.pdf')) return 'pdf'
  if (format === 'doc' || format === 'docx' || name.endsWith('.doc') || name.endsWith('.docx')) return 'word'
  return 'other'
}

export function ResourceDetailsModal({ resource, onClose, showDownload = true, isEnabled = true }: ResourceDetailsModalProps) {
  const router = useRouter()
  
  if (!resource) return null

  const fileUrl = resource.file?.url || resource.fileUrl || ''
  const fileType = getFileType(resource.file)
  const isPDF = fileType === 'pdf'

  const handleDownload = () => {
    if (!fileUrl || !isEnabled) return
    const link = document.createElement("a")
    link.href = fileUrl
    link.download = resource.file?.originalName || `${resource.title}.pdf`
    link.click()
  }

  const handleContactUs = () => {
    onClose()
    router.push("/contact")
  }

  return (
    <Dialog open={!!resource} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-md p-0 gap-0 overflow-hidden border-0 rounded-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-4">
          <h2 className="text-xl font-semibold">Resources Details</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </button>
        </div>

        <div className="px-6 pb-6 space-y-5">
          {/* Icon Section - Full width with gradient */}
          <div className={`relative w-full h-44 rounded-xl overflow-hidden flex items-center justify-center ${
            isPDF 
              ? 'bg-gradient-to-br from-slate-100 via-slate-200 to-slate-100' 
              : 'bg-gradient-to-br from-slate-100 via-slate-200 to-slate-100'
          }`}>
            {/* Large Folder Icon */}
            <div className="relative h-24 w-32">
              <svg viewBox="0 0 100 80" className="h-full w-full">
                <path
                  d="M0 15 C0 10 5 5 10 5 L35 5 L45 15 L90 15 C95 15 100 20 100 25 L100 70 C100 75 95 80 90 80 L10 80 C5 80 0 75 0 70 Z"
                  fill="#E2E8F0"
                  stroke="#CBD5E1"
                  strokeWidth="1"
                />
                <path d="M5 25 L95 25 L95 70 C95 73 93 75 90 75 L10 75 C7 75 5 73 5 70 Z" fill="#F1F5F9" />
              </svg>
            </div>
          </div>

          {/* Title */}
          <h3 className="text-lg font-semibold leading-relaxed">{resource.title}</h3>

          {/* Description */}
          {resource.description && (
            <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
              {resource.description.split("\n").map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
          )}

          {/* Show info message and contact button when not enabled */}
          {!isEnabled && (
            <>
              <div className="flex items-start gap-2 text-sm">
                <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                <span className="text-red-600">
                  Kindly contact the Administrator to have access to these resources
                </span>
              </div>
              
              <Button
                onClick={handleContactUs}
                className="w-full gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:from-cyan-600 hover:to-blue-700 h-12 text-base"
              >
                Contact Us
              </Button>
            </>
          )}

          {/* Download Button - only show when enabled */}
          {showDownload && isEnabled && (
            <Button
              onClick={handleDownload}
              className="w-full gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:from-cyan-600 hover:to-blue-700 h-12 text-base"
            >
              <Download className="h-5 w-5" />
              Download Document
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
