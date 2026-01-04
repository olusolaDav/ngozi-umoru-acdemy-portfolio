"use client"

import { use, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Download, FileText } from "lucide-react"
import { DocumentViewer } from "@/components/dashboard/resources/pdf-viewer"

interface Resource {
  _id: string
  title: string
  description: string
  category: string
  targetAudience: string
  file: {
    url: string
    publicId: string
    originalName: string
    size: number
    format: string
    resourceType: string
    thumbnail?: string
  }
  uploadedBy: string
  uploadedAt: string
  downloads: number
  isActive: boolean
}

interface PageProps {
  params: Promise<{ id: string }>
}

export default function ViewResourcePage({ params }: PageProps) {
  const { id } = use(params)
  const router = useRouter()
  const [resource, setResource] = useState<Resource | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchResource = async () => {
      try {
        const response = await fetch(`/api/admin/resources/${id}`)
        if (!response.ok) throw new Error("Failed to fetch resource")
        
        const data = await response.json()
        setResource(data.resource)
      } catch (error) {
        console.error("Error fetching resource:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchResource()
  }, [id])

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-sm text-muted-foreground">Loading document...</p>
        </div>
      </div>
    )
  }

  if (!resource) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <p className="text-muted-foreground">Resource not found</p>
      </div>
    )
  }

  const handleDownload = async () => {
    try {
      const filename = resource.file.originalName || resource.title || 'document.pdf'
      // Use the download proxy endpoint that sets proper Content-Disposition headers
      // This ensures the browser uses the original filename for the download
      const downloadUrl = `/api/download?url=${encodeURIComponent(resource.file.url)}&filename=${encodeURIComponent(filename)}`
      
      const link = document.createElement('a')
      link.href = downloadUrl
      // Don't set download attribute - the backend Content-Disposition header will handle it
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (error) {
      console.error('Download error:', error)
    }
  }

  const isPDF = resource.file.format?.toLowerCase() === 'pdf' || 
                resource.file.originalName?.toLowerCase().endsWith('.pdf')

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center bg-red-100`}>
                <FileText className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">{resource.title}</h1>
                <p className="text-sm text-gray-500">{resource.file.originalName}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={handleDownload}
              className="gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:from-cyan-600 hover:to-blue-700"
              size="sm"
            >
              <Download className="h-4 w-4" />
              Download
            </Button>
          </div>
        </div>
      </div>

      {/* Document Viewer */}
      <div className="h-[calc(100vh-80px)]">
        <DocumentViewer 
          url={resource.file.url} 
          title={resource.title}
          format={resource.file.format}
          originalName={resource.file.originalName}
        />
      </div>

      {/* Document Info Panel */}
      <div className="fixed bottom-4 right-4 bg-white rounded-lg shadow-lg p-4 max-w-sm border">
        <h3 className="font-semibold text-sm mb-2">Document Details</h3>
        <div className="space-y-1 text-xs text-gray-600">
          <p><span className="font-medium">Size:</span> {(resource.file.size / (1024 * 1024)).toFixed(2)} MB</p>
          <p><span className="font-medium">Format:</span> {resource.file.format?.toUpperCase() || 'PDF'}</p>
          <p><span className="font-medium">Uploaded:</span> {new Date(resource.uploadedAt).toLocaleDateString()}</p>
        </div>
      </div>
    </div>
  )
}