"use client"

import { useState, useRef, useEffect } from 'react'
import { Download, ExternalLink, Maximize2, FileText, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

interface DocumentViewerProps {
  url: string
  title: string
  format?: string
  originalName?: string
}

export function DocumentViewer({ url, title, format, originalName }: DocumentViewerProps) {
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  const isPDF = format?.toLowerCase() === 'pdf' || originalName?.toLowerCase().endsWith('.pdf')
  
  // Use Google Docs Viewer for PDF rendering
  const viewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`

  const handleDownload = async () => {
    try {
      const filename = originalName || title || 'document.pdf'
      // Use the download proxy endpoint that sets proper Content-Disposition headers
      // This ensures the browser uses the original filename for the download
      const downloadUrl = `/api/download?url=${encodeURIComponent(url)}&filename=${encodeURIComponent(filename)}`
      
      const link = document.createElement('a')
      link.href = downloadUrl
      // Don't set download attribute - the backend Content-Disposition header will handle it
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      toast.success("Download started", {
        description: `Downloading: ${filename}`
      })
    } catch (error) {
      console.error('Download error:', error)
      toast.error("Download failed", {
        description: "There was an error downloading the file"
      })
    }
  }

  const openInNewTab = () => {
    window.open(viewerUrl, '_blank')
  }

  const toggleFullscreen = () => {
    const elem = document.documentElement
    if (!document.fullscreenElement) {
      elem.requestFullscreen().catch(err => {
        toast.error(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`)
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  }

  useEffect(() => {
    const onFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }
    document.addEventListener('fullscreenchange', onFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange)
  }, [])
  
  const handleIframeError = () => {
    setIsLoading(false)
    setLoadError(true)
    toast.error("Couldn't load document preview", {
      description: "There was an issue loading the document in the viewer.",
    })
  }

  return (
    <div className="flex flex-col h-screen bg-gray-100 dark:bg-gray-900">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-3 bg-gray-800 text-white">
        <div className="flex items-center gap-3 min-w-0">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 bg-red-500/20`}>
            <FileText className="h-4 w-4 text-red-400" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium truncate">{title}</p>
            <p className="text-xs text-gray-400">PDF Document</p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={openInNewTab}
            className="text-white hover:bg-gray-700 gap-2"
            title="Open in new tab"
          >
            <ExternalLink className="h-4 w-4" />
             <span className="hidden sm:inline">Open</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleFullscreen}
            className="text-white hover:bg-gray-700"
            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
          >
            <Maximize2 className="h-4 w-4" />
          </Button>
        
        </div>
      </div>

      {/* Viewer */}
      <div className="flex-grow relative bg-gray-200 dark:bg-gray-800">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
               <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
              <p className="text-lg font-semibold mt-4">Loading document...</p>
              <p className="text-sm text-gray-500">Please wait a moment.</p>
            </div>
          </div>
        )}
        
        {!loadError && (
          <iframe
            ref={iframeRef}
            src={viewerUrl}
            className={`w-full h-full border-0 transition-opacity duration-500 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
            onLoad={() => setIsLoading(false)}
            onError={handleIframeError}
            title={title}
            allow="fullscreen"
          />
        )}

        {loadError && (
           <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center p-8 bg-white dark:bg-gray-700 rounded-lg shadow-lg max-w-md mx-auto">
               <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Preview Unavailable</h3>
              <p className="text-muted-foreground mb-6">
                The PDF could not be loaded in the previewer. This can happen due to network issues or if the file is corrupted.
              </p>
              <Button onClick={handleDownload} className="gap-2 w-full">
                <Download className="h-4 w-4" />
                Download PDF
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Keep the old export name for backwards compatibility
export { DocumentViewer as PDFViewer }