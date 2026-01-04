"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import Link from "next/link"
import { FileText, Download, ExternalLink, File, Image as ImageIcon, Video, Music, Archive, ArrowRight, HardDrive, Calendar } from "lucide-react"
import { getFileTypeInfo, formatFileSize } from "@/lib/file-icons"
import { formatDistanceToNow } from "date-fns"
import { ScrollAnimation } from "@/components/ui/scroll-animation"

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

export function ResourcesPreviewSection() {
  const [resources, setResources] = useState<Resource[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchResources = async () => {
      try {
        const res = await fetch("/api/resources?limit=3")
        const data = await res.json()
        if (data.ok && data.resources) {
          setResources(data.resources)
        }
      } catch (error) {
        console.error("Error fetching resources:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchResources()
  }, [])

  if (isLoading) {
    return (
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="flex items-center justify-between mb-12">
            <div>
              <div className="inline-block px-3 py-1 bg-background border border-border text-sm font-medium rounded-full mb-4">
                RESOURCES
              </div>
              <h2 className="text-3xl md:text-4xl font-bold">
                Academic <span className="text-primary">Resources</span>
              </h2>
            </div>
            <Link href="/resources">
              <Button size="lg" className="hidden md:inline-flex gap-2">
                View All
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex flex-col p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl aspect-square">
                <div className="flex items-start gap-4">
                  <Skeleton className="w-14 h-14 rounded-lg" />
                  <div className="flex-1">
                    <div className="flex justify-between gap-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-5 w-12 rounded" />
                    </div>
                    <Skeleton className="h-3 w-full mt-2" />
                  </div>
                </div>
                <div className="flex-1" />
                <div className="flex gap-4 mb-3">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-3 w-20" />
                </div>
                <Skeleton className="h-9 w-full rounded" />
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  // If no resources, don't show the section
  if (resources.length === 0) {
    return null
  }

  return (
    <section className="py-20 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="flex items-center justify-between mb-12">
          <ScrollAnimation>
            <div>
              <div className="inline-block px-3 py-1 bg-background border border-border text-sm font-medium rounded-full mb-4">
                RESOURCES
              </div>
              <h2 className="text-3xl md:text-4xl font-bold">
                Academic <span className="text-primary">Resources</span>
              </h2>
              <p className="text-muted-foreground mt-2">
                Teaching materials, research papers, and educational resources
              </p>
            </div>
          </ScrollAnimation>
          <Link href="/resources">
            <Button size="lg" className="hidden md:inline-flex gap-2">
              View All
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {resources.map((resource, index) => {
            const fileInfo = getFileTypeInfo(resource.fileName || resource.fileUrl || "", resource.resourceType)
            const Icon = fileInfo.icon

            return (
              <ScrollAnimation key={resource._id} delay={index * 0.1}>
                <div className="group relative flex flex-col gap-4 p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl transition-all duration-200 hover:shadow-md hover:border-gray-300 dark:hover:border-gray-600 aspect-square">
                  {/* Top Row: File Icon + Content + Badge */}
                  <div className="flex items-start gap-4">
                    {/* File Icon */}
                    <div className={`flex-shrink-0 w-14 h-14 rounded-lg ${fileInfo.bgColor} flex items-center justify-center`}>
                      <Icon className={`h-7 w-7 ${fileInfo.color}`} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <h3 className="font-semibold text-gray-900 dark:text-gray-50 line-clamp-2 text-sm">
                            {resource.title}
                          </h3>
                          <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mt-0.5">
                            {resource.description || "No description"}
                          </p>
                        </div>
                        <span className={`flex-shrink-0 px-2 py-0.5 rounded text-xs font-medium ${fileInfo.bgColor} ${fileInfo.color}`}>
                          {fileInfo.label}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Spacer */}
                  <div className="flex-1" />

                  {/* Metadata */}
                  <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                    <span className="flex items-center gap-1">
                      <HardDrive className="h-3 w-3" />
                      {resource.bytes ? formatFileSize(resource.bytes) : "--"}
                    </span>
                    {resource.createdAt && (
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(resource.createdAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex-shrink-0">
                    <a 
                      href={resource.downloadUrl || resource.fileUrl} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="block"
                    >
                      <Button
                        size="sm"
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium h-8"
                      >
                        <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
                        View
                      </Button>
                    </a>
                  </div>
                </div>
              </ScrollAnimation>
            )
          })}
        </div>

        <div className="text-center md:hidden">
          <Link href="/resources">
            <Button size="lg" className="gap-2">
              View All Resources
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
