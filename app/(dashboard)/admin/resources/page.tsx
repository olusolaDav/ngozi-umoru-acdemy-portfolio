"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { 
  Upload, Search, Plus, Loader2, ExternalLink, CheckSquare, Trash2, LayoutGrid, List, X
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { ResourceCard } from "@/components/dashboard/resources/resource-card"
import { AdminDashboardHeader } from "@/components/dashboard/admin-dashboard-header"
import { toast } from "sonner"
import { formatFileSize } from "@/lib/file-icons"

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

interface ResourcesResponse {
  resources: Resource[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

interface UploadingFile {
  file: File
  progress: number
  timeLeft: string
  status: "uploading" | "complete" | "error"
}

export default function AdminResourcesPage() {
  const [resources, setResources] = useState<Resource[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [selectMode, setSelectMode] = useState(false)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false)
  const [uploadingFile, setUploadingFile] = useState<UploadingFile | null>(null)
  const [fileName, setFileName] = useState("")
  const [description, setDescription] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  // Fetch resources
  const fetchResources = useCallback(async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({ search })
      const response = await fetch(`/api/admin/resources?${params}`)
      
      if (!response.ok) throw new Error('Failed to fetch resources')
      
      const data: ResourcesResponse = await response.json()
      setResources(data.resources)
    } catch (error) {
      console.error('Error fetching resources:', error)
      toast.error('Failed to load resources')
    } finally {
      setLoading(false)
    }
  }, [search])

  useEffect(() => {
    fetchResources()
  }, [fetchResources])

  // Filter resources
  const filteredResources = useMemo(() => {
    return resources.filter(resource =>
      resource.title.toLowerCase().includes(search.toLowerCase()) ||
      resource.description.toLowerCase().includes(search.toLowerCase())
    )
  }, [resources, search])

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(filteredResources.map((r) => r._id))
    } else {
      setSelectedIds([])
    }
  }

  const handleSelect = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds((prev) => [...prev, id])
    } else {
      setSelectedIds((prev) => prev.filter((i) => i !== id))
    }
  }

  const handleOpenDocument = (resource: Resource) => {
    if (resource.file.url) {
      window.open(resource.file.url, '_blank')
    } else {
      toast.error("File URL not available")
    }
  }

  // Delete selected resources
  const handleDeleteSelected = async () => {
    if (selectedIds.length === 0) return
    
    setIsDeleting(true)
    try {
      const response = await fetch('/api/admin/resources', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedIds })
      })
      
      if (!response.ok) {
        throw new Error('Failed to delete resources')
      }
      
      toast.success(`${selectedIds.length} resource(s) deleted successfully`)
      setSelectedIds([])
      setSelectMode(false)
      setDeleteDialogOpen(false)
      fetchResources()
    } catch (error) {
      console.error('Error deleting resources:', error)
      toast.error('Failed to delete resources')
    } finally {
      setIsDeleting(false)
    }
  }

  // Upload functionality
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0]
      setFileName(file.name.replace(/\.[^/.]+$/, ""))

      setUploadingFile({
        file,
        progress: 0,
        timeLeft: "Preparing upload...",
        status: "uploading",
      })

      let progress = 0
      const interval = setInterval(() => {
        progress += Math.random() * 8 + 2
        if (progress >= 95) {
          progress = 95
          setUploadingFile((prev) =>
            prev ? { ...prev, progress: 95, timeLeft: "Finalizing..." } : null,
          )
          clearInterval(interval)
          
          setTimeout(() => {
            setUploadingFile((prev) =>
              prev ? { ...prev, progress: 100, status: "complete", timeLeft: "Complete" } : null,
            )
          }, 1500)
          
        } else {
          const timeLeft = Math.ceil((100 - progress) / 4)
          setUploadingFile((prev) =>
            prev
              ? {
                  ...prev,
                  progress: Math.round(progress),
                  timeLeft: `${timeLeft} Sec left`,
                }
              : null,
          )
        }
      }, 500)
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    onDropRejected: (fileRejections) => {
      const rejection = fileRejections[0]
      if (rejection) {
        const error = rejection.errors[0]
        if (error.code === 'file-too-large') {
          toast.error("File too large", {
            description: "Please select a file smaller than 100MB"
          })
        } else {
          toast.error("File rejected", {
            description: error.message
          })
        }
      }
    },
    maxSize: 100 * 1024 * 1024, // 100MB
    multiple: false,
  })

  const handleCancelUpload = () => {
    setUploadingFile(null)
    setFileName("")
    setDescription("")
  }

  const handleSubmit = async () => {
    if (!uploadingFile || uploadingFile.status !== "complete" || isSubmitting) return

    setIsSubmitting(true)
    const toastId = toast.loading("Uploading resource...", {
      description: "Please wait while we upload your file"
    })

    try {
      const formData = new FormData()
      formData.append('file', uploadingFile.file)
      formData.append('title', fileName)
      formData.append('description', description)
      formData.append('category', 'document')
      formData.append('targetAudience', 'all')
      
      const response = await fetch('/api/admin/resources', {
        method: 'POST',
        body: formData,
      })
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error occurred' }))
        throw new Error(errorData.error || 'Failed to upload resource')
      }
      
      setUploadDialogOpen(false)
      handleCancelUpload()
      fetchResources()
      
      toast.success("Resource uploaded successfully!", {
        id: toastId,
        description: `"${fileName}" has been added to your resources`
      })
      
    } catch (error: any) {
      console.error("Upload error:", error)
      
      let errorMessage = "Failed to upload resource. Please try again."
      
      if (error.message?.includes('Timeout') || error.message?.includes('Request Timeout')) {
        errorMessage = "Upload timed out. Please check your internet connection and try again."
      } else if (error.message?.includes('too large')) {
        errorMessage = "File is too large. Please select a file under 50MB."
      } else if (error.message) {
        errorMessage = error.message
      }
      
      toast.error("Upload Failed", {
        id: toastId,
        description: errorMessage
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-950/50">
      {/* Header */}
      <AdminDashboardHeader
        title="Resources"
        description="Manage your academic resources, documents, media files and more"
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Resources" },
        ]}
        actions={
          <Dialog open={uploadDialogOpen} onOpenChange={(open) => {
            if (!isSubmitting) {
              setUploadDialogOpen(open)
              if (!open) handleCancelUpload()
            }
          }}>
            <DialogTrigger asChild>
              <Button className="gap-2 bg-blue-600 hover:bg-blue-700 text-white">
                <Plus className="h-4 w-4" />
                Add Resource
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl">
              <DialogHeader>
                <DialogTitle>Upload Resource</DialogTitle>
              </DialogHeader>
              <div className="space-y-6">
                {/* Drag & Drop Zone */}
                <div
                  {...getRootProps()}
                  className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors ${
                    isDragActive 
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-950/20" 
                      : "border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 hover:border-blue-400"
                  }`}
                >
                  <input {...getInputProps()} />
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-950/50">
                    <Upload className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <p className="mb-1 text-center font-medium text-gray-900 dark:text-gray-50">Drag & Drop or Choose File to Upload</p>
                  <p className="mb-4 text-center text-sm text-gray-600 dark:text-gray-400">All file formats supported - up to 100MB</p>
                  <Button variant="outline" className="gap-2">
                    <Search className="h-4 w-4" />
                    Browse Files
                  </Button>
                </div>

                {/* Upload Progress */}
                {uploadingFile && (
                  <div className="flex items-center gap-4 rounded-lg border bg-white dark:bg-gray-900 p-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800">
                      <Upload className="h-6 w-6 text-gray-600 dark:text-gray-400" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 dark:text-gray-50">{uploadingFile.file.name}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {formatFileSize(uploadingFile.file.size)} - {uploadingFile.timeLeft} - {uploadingFile.progress}% Completed
                      </p>
                      <div className="mt-2 h-2 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                        <div
                          className="h-full rounded-full bg-blue-600 transition-all duration-300"
                          style={{ width: `${uploadingFile.progress}%` }}
                        />
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" onClick={handleCancelUpload} disabled={isSubmitting}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}

                {/* Document Details */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-50">Document Details</h3>
                  <Input 
                    placeholder="File Name" 
                    value={fileName} 
                    onChange={(e) => setFileName(e.target.value)}
                    disabled={isSubmitting}
                    className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700"
                  />
                  <Textarea
                    placeholder="Describe the file shortly"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    disabled={isSubmitting}
                    className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700"
                  />
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-4">
                  <Button 
                    variant="outline" 
                    onClick={() => setUploadDialogOpen(false)}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    disabled={!uploadingFile || uploadingFile.status !== "complete" || isSubmitting || !fileName.trim()}
                    className="bg-blue-600 hover:bg-blue-700 text-white min-w-[150px]"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      "Upload Resource"
                    )}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        }
      />

      {/* Main Content */}
      <div className="px-6 py-8">
        {/* Search and Controls */}
        <div className="mb-6 space-y-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search resources..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700"
              />
            </div>

            {/* View Toggle */}
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`flex items-center gap-2 px-3 py-2 text-sm font-medium transition-colors ${
                    viewMode === "grid" 
                      ? "text-blue-600 dark:text-blue-400 border-r border-gray-200 dark:border-gray-700" 
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                  }`}
                >
                  <LayoutGrid className="h-4 w-4" />
                  Grid
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`flex items-center gap-2 px-3 py-2 text-sm font-medium transition-colors ${
                    viewMode === "list" 
                      ? "text-blue-600 dark:text-blue-400" 
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                  }`}
                >
                  <List className="h-4 w-4" />
                  List
                </button>
              </div>

              <button
                onClick={() => {
                  setSelectMode(!selectMode)
                  if (selectMode) setSelectedIds([])
                }}
                className={`flex items-center gap-2 px-3 py-2 text-sm font-medium transition-colors rounded-lg border ${
                  selectMode 
                    ? "bg-blue-600 text-white border-blue-600 dark:bg-blue-600 dark:border-blue-600" 
                    : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                }`}
              >
                <CheckSquare className="h-4 w-4" />
                Select
              </button>
            </div>
          </div>

          {/* Select Mode Bar */}
          {selectMode && (
            <div className="flex items-center justify-between rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4">
              <div className="flex items-center gap-3">
                <Checkbox
                  checked={selectedIds.length === filteredResources.length && filteredResources.length > 0}
                  onCheckedChange={handleSelectAll}
                />
                <span className="text-sm font-medium text-gray-900 dark:text-gray-50">Select All</span>
                {selectedIds.length > 0 && (
                  <span className="text-sm text-gray-600 dark:text-gray-400">({selectedIds.length} selected)</span>
                )}
              </div>
              {selectedIds.length > 0 && (
                <Button 
                  onClick={() => setDeleteDialogOpen(true)} 
                  variant="destructive" 
                  size="sm" 
                  className="gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete Selected
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Resources Grid/List */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Loading resources...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Grid View */}
            {viewMode === "grid" && (
              <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2">
                {filteredResources.map((resource) => (
                  <ResourceCard
                    key={resource._id}
                    id={resource._id}
                    title={resource.title}
                    description={resource.description}
                    file={resource.file}
                    isSelected={selectedIds.includes(resource._id)}
                    selectMode={selectMode}
                    onSelect={handleSelect}
                    onView={() => handleOpenDocument(resource)}
                    uploadedDate={new Date(resource.uploadedAt).toLocaleDateString()}
                  />
                ))}
              </div>
            )}

            {/* List View */}
            {viewMode === "list" && (
              <div className="space-y-3">
                {filteredResources.map((resource) => (
                  <ResourceCard
                    key={resource._id}
                    id={resource._id}
                    title={resource.title}
                    description={resource.description}
                    file={resource.file}
                    isSelected={selectedIds.includes(resource._id)}
                    selectMode={selectMode}
                    onSelect={handleSelect}
                    onView={() => handleOpenDocument(resource)}
                    uploadedDate={new Date(resource.uploadedAt).toLocaleDateString()}
                  />
                ))}
              </div>
            )}

            {/* Empty State */}
            {filteredResources.length === 0 && !loading && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="rounded-lg bg-gray-100 dark:bg-gray-900 p-6 mb-4">
                  <Upload className="h-12 w-12 text-gray-400 dark:text-gray-600 mx-auto" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-50 mb-2">No resources found</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {search ? "Try a different search term" : "Upload your first resource to get started"}
                </p>
                {!search && (
                  <Button onClick={() => setUploadDialogOpen(true)} className="gap-2 bg-blue-600 hover:bg-blue-700">
                    <Plus className="h-4 w-4" />
                    Add Resource
                  </Button>
                )}
              </div>
            )}

            {/* Footer count */}
            {filteredResources.length > 0 && (
              <div className="mt-6 flex items-center justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Showing {filteredResources.length} resource(s) of {resources.length}
                </p>
              </div>
            )}
          </>
        )}

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Resources</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete {selectedIds.length} resource(s)? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteSelected}
                disabled={isDeleting}
                className="bg-red-600 text-white hover:bg-red-700"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  "Delete"
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  )
}
