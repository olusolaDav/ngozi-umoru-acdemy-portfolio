"use client"

import { useEffect, useState } from "react"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer-dynamic"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { 
  Search, 
  FileText, 
  Download, 
  ExternalLink, 
  File, 
  Image as ImageIcon, 
  Video, 
  Music, 
  Archive,
  Filter,
  ChevronLeft,
  ChevronRight,
  HardDrive,
  Calendar,
  Eye
} from "lucide-react"
import { getFileTypeInfo, formatFileSize } from "@/lib/file-icons"
import { formatDistanceToNow } from "date-fns"

// Resource categories for academic portfolio
const RESOURCE_CATEGORIES = [
  { value: "worksheets", label: "Worksheets" },
  { value: "curriculum", label: "Curriculum" },
  { value: "lesson-slides", label: "Lesson Slides" },
] as const

type ResourceCategory = typeof RESOURCE_CATEGORIES[number]["value"]

// Helper to get category label
const getCategoryLabel = (categoryValue: string): string => {
  const category = RESOURCE_CATEGORIES.find(c => c.value === categoryValue)
  return category?.label || categoryValue
}

interface Resource {
  _id: string
  title: string
  description?: string
  category: string
  fileUrl: string
  downloadUrl?: string
  fileName?: string
  format?: string
  resourceType?: string
  bytes?: number
  thumbnail?: string
  createdAt: string
}

const getFileIcon = (format?: string, resourceType?: string) => {
  if (resourceType === "image" || format?.match(/^(jpg|jpeg|png|gif|webp|svg)$/i)) {
    return <ImageIcon className="h-8 w-8 text-green-500" />
  }
  if (resourceType === "video" || format?.match(/^(mp4|avi|mov|wmv|webm)$/i)) {
    return <Video className="h-8 w-8 text-purple-500" />
  }
  if (format?.match(/^(mp3|wav|ogg|aac)$/i)) {
    return <Music className="h-8 w-8 text-pink-500" />
  }
  if (format?.match(/^(zip|rar|7z|tar|gz)$/i)) {
    return <Archive className="h-8 w-8 text-yellow-500" />
  }
  if (format?.match(/^(pdf)$/i)) {
    return <FileText className="h-8 w-8 text-red-500" />
  }
  if (format?.match(/^(doc|docx)$/i)) {
    return <FileText className="h-8 w-8 text-blue-500" />
  }
  if (format?.match(/^(xls|xlsx)$/i)) {
    return <FileText className="h-8 w-8 text-green-600" />
  }
  if (format?.match(/^(ppt|pptx)$/i)) {
    return <FileText className="h-8 w-8 text-orange-500" />
  }
  return <File className="h-8 w-8 text-gray-500" />
}


const formatDate = (dateString?: string) => {
  if (!dateString) return ""
  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return ""
    return formatDistanceToNow(date, { addSuffix: true })
  } catch {
    return ""
  }
}

export default function ResourcesPage() {
  const [resources, setResources] = useState<Resource[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<"all" | ResourceCategory>("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [total, setTotal] = useState(0)
  const itemsPerPage = 12

  useEffect(() => {
    const fetchResources = async () => {
      setIsLoading(true)
      try {
        const skip = (currentPage - 1) * itemsPerPage
        const categoryParam = selectedCategory !== "all" ? `&category=${selectedCategory}` : ""
        const res = await fetch(`/api/resources?limit=${itemsPerPage}&skip=${skip}${categoryParam}`)
        const data = await res.json()
        if (data.ok) {
          setResources(data.resources || [])
          setCategories(data.categories || [])
          setTotal(data.total || 0)
        }
      } catch (error) {
        console.error("Error fetching resources:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchResources()
  }, [currentPage, selectedCategory])

  const filteredResources = resources.filter((resource) =>
    resource.title.toLowerCase().includes(search.toLowerCase()) ||
    resource.description?.toLowerCase().includes(search.toLowerCase())
  )

  const totalPages = Math.ceil(total / itemsPerPage)

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />

      {/* Hero Section */}
      <section className="pt-32 pb-16 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-block px-3 py-1 bg-background border border-border text-sm font-medium rounded-full mb-4">
              RESOURCES
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Academic <span className="text-primary">Resources</span>
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              Browse teaching materials, research papers, and educational resources. 
              Download or view documents to support your learning journey.
            </p>

            {/* Search and Filter */}
            <div className="flex flex-col gap-4 max-w-2xl mx-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search resources..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 h-12"
                />
              </div>
              
              {/* Category Tabs */}
              <div className="flex flex-wrap justify-center gap-2">
                <button
                  onClick={() => {
                    setSelectedCategory("all")
                    setCurrentPage(1)
                  }}
                  className={`px-4 py-2 text-sm font-medium rounded-full transition-colors ${
                    selectedCategory === "all"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  All Resources
                </button>
                {RESOURCE_CATEGORIES.map((category) => (
                  <button
                    key={category.value}
                    onClick={() => {
                      setSelectedCategory(category.value)
                      setCurrentPage(1)
                    }}
                    className={`px-4 py-2 text-sm font-medium rounded-full transition-colors ${
                      selectedCategory === category.value
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                  >
                    {category.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Resources Grid */}
      <section className="py-16 px-4 flex-1">
        <div className="container mx-auto max-w-6xl">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div key={i} className="flex flex-col p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl aspect-square">
                  <div className="flex items-start gap-3">
                    <Skeleton className="w-12 h-12 rounded-lg" />
                    <div className="flex-1">
                      <div className="flex justify-between gap-2">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-4 w-10 rounded" />
                      </div>
                      <Skeleton className="h-3 w-full mt-1" />
                    </div>
                  </div>
                  <div className="flex-1" />
                  <div className="flex gap-3 mb-3">
                    <Skeleton className="h-3 w-14" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                  <Skeleton className="h-9 w-full rounded" />
                </div>
              ))}
            </div>
          ) : filteredResources.length === 0 ? (
            <div className="text-center py-16">
              <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Resources Found</h3>
              <p className="text-muted-foreground">
                {search ? "Try adjusting your search terms" : "No resources have been uploaded yet"}
              </p>
            </div>
          ) : (
            <>
              <div className="mb-6 text-sm text-muted-foreground">
                Showing {filteredResources.length} of {total} resources
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredResources.map((resource) => {
                  const fileInfo = getFileTypeInfo(resource.fileName || resource.fileUrl || "", resource.resourceType)
                  const Icon = fileInfo.icon

                  return (
                    <div 
                      key={resource._id} 
                      className="group relative flex flex-col p-5 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-900/80 border border-gray-200 dark:border-gray-700 rounded-2xl transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/10 hover:border-blue-300 dark:hover:border-blue-700 hover:-translate-y-1 h-[380px]"
                    >
                      {/* File Icon - Larger and Centered */}
                      <div className="flex justify-center mb-3">
                        <div className={`w-16 h-16 rounded-2xl ${fileInfo.bgColor} flex items-center justify-center shadow-lg transform transition-transform group-hover:scale-110 group-hover:rotate-3`}>
                          <Icon className={`h-8 w-8 ${fileInfo.color}`} />
                        </div>
                      </div>

                      {/* File Type Badge */}
                      <div className="flex justify-center mb-3">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${fileInfo.bgColor} ${fileInfo.color} border border-current/20`}>
                          {fileInfo.label}
                        </span>
                      </div>

                      {/* Content - Title and Description */}
                      <div className="text-center mb-3">
                        <h3 className="font-bold text-gray-900 dark:text-gray-50 line-clamp-2 text-sm mb-2 leading-tight px-2">
                          {resource.title}
                        </h3>
                        <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 leading-relaxed px-2">
                          {resource.description || "No description available"}
                        </p>
                      </div>

                      {/* Category Badge - Very small */}
                      {resource.category && (
                        <div className="flex justify-center mb-3">
                          <span className="px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-medium text-[10px]">
                            {getCategoryLabel(resource.category)}
                          </span>
                        </div>
                      )}
                      {/* Spacer to push metadata and button to bottom */}
                      <div className="flex-grow" />

                      {/* Metadata */}
                      <div className="flex items-center justify-center gap-4 text-xs text-gray-500 dark:text-gray-400 pb-3 border-t border-gray-200 dark:border-gray-700 pt-3 mt-auto">
                        <span className="flex items-center gap-1.5 font-medium">
                          <HardDrive className="h-3.5 w-3.5" />
                          {resource.bytes ? formatFileSize(resource.bytes) : "--"}
                        </span>
                        {resource.createdAt && (
                          <span className="flex items-center gap-1.5 font-medium">
                            <Calendar className="h-3.5 w-3.5" />
                            {new Date(resource.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </span>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex-shrink-0">
                        {(() => {
                          const format = resource.format?.toLowerCase()
                          const resourceType = resource.resourceType?.toLowerCase()
                          const extension = resource.fileName?.split('.').pop()?.toLowerCase()
                          
                          // Determine if file should be viewed or downloaded
                          let isViewable = 
                            resourceType === 'image' || 
                            resourceType === 'video' ||
                            format === 'pdf' ||
                            ['mp3', 'wav', 'ogg', 'aac', 'mpeg'].includes(format || '')
                          
                          // Check file extension as fallback
                          if (!isViewable && extension) {
                            if (extension === 'pdf') isViewable = true
                            if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(extension)) isViewable = true
                            if (['mp4', 'webm', 'mov'].includes(extension)) isViewable = true
                            if (['mp3', 'wav', 'ogg'].includes(extension)) isViewable = true
                          }
                          
                          const ButtonIcon = isViewable ? Eye : Download
                          const buttonText = isViewable ? 'View' : 'Download'
                          
                          return (
                            <a 
                              href={resource.downloadUrl || resource.fileUrl} 
                              download={!isViewable ? (resource.fileName || resource.title) : undefined}
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="block"
                            >
                              <Button
                                size="sm"
                                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-sm font-semibold h-10 shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer "
                              >
                                <ButtonIcon className="mr-2 h-4 w-4" />
                                {buttonText}
                              </Button>
                            </a>
                          )
                        })()}
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-12">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                      let page
                      if (totalPages <= 5) {
                        page = i + 1
                      } else if (currentPage <= 3) {
                        page = i + 1
                      } else if (currentPage >= totalPages - 2) {
                        page = totalPages - 4 + i
                      } else {
                        page = currentPage - 2 + i
                      }
                      return (
                        <Button
                          key={page}
                          variant={currentPage === page ? "default" : "outline"}
                          size="sm"
                          onClick={() => setCurrentPage(page)}
                          className="w-9"
                        >
                          {page}
                        </Button>
                      )
                    })}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      <Footer />
    </div>
  )
}
