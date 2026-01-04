"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { ExternalLink, Trash2, Calendar, HardDrive } from "lucide-react"
import { getFileTypeInfo, formatFileSize } from "@/lib/file-icons"

interface FileInfo {
  url: string
  publicId: string
  originalName: string
  size: number
  format: string
  resourceType: string
  thumbnail?: string
}

interface ResourceCardProps {
  id: string
  title: string
  description: string
  file: FileInfo
  isSelected?: boolean
  selectMode?: boolean
  onSelect?: (id: string, checked: boolean) => void
  onView?: () => void
  onDelete?: (id: string) => void
  uploadedDate?: string
}

export function ResourceCard({
  id,
  title,
  description,
  file,
  isSelected = false,
  selectMode = false,
  onSelect,
  onView,
  onDelete,
  uploadedDate,
}: ResourceCardProps) {
  const fileTypeInfo = getFileTypeInfo(file.originalName, file.resourceType)
  const IconComponent = fileTypeInfo.icon

  const handleViewClick = () => {
    if (file.url) {
      window.open(file.url, '_blank', 'noopener,noreferrer')
    }
  }

  return (
    <div
      className={`group relative flex items-center gap-4 p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl transition-all duration-200 hover:shadow-md hover:border-gray-300 dark:hover:border-gray-600 ${
        isSelected ? "ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-gray-950 border-blue-500" : ""
      }`}
    >
      {/* Selection Checkbox */}
      {selectMode && (
        <div className="flex-shrink-0">
          <Checkbox
            checked={isSelected}
            onCheckedChange={(checked) => onSelect?.(id, checked as boolean)}
            className="border-2 border-gray-300 dark:border-gray-600"
          />
        </div>
      )}

      {/* File Icon */}
      <div className={`flex-shrink-0 w-14 h-14 rounded-lg ${fileTypeInfo.bgColor} flex items-center justify-center`}>
        <IconComponent className={`h-7 w-7 ${fileTypeInfo.color}`} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-gray-900 dark:text-gray-50 truncate text-sm">
              {title}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
              {description || "No description"}
            </p>
          </div>
          <span className={`flex-shrink-0 px-2 py-0.5 rounded text-xs font-medium ${fileTypeInfo.bgColor} ${fileTypeInfo.color}`}>
            {fileTypeInfo.label}
          </span>
        </div>
        
        {/* Metadata */}
        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
          <span className="flex items-center gap-1">
            <HardDrive className="h-3 w-3" />
            {formatFileSize(file.size)}
          </span>
          {uploadedDate && (
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {uploadedDate}
            </span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex-shrink-0 flex items-center gap-2">
        <Button
          onClick={handleViewClick}
          size="sm"
          className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium h-8 px-4"
        >
          <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
          View
        </Button>
        {onDelete && (
          <Button
            onClick={() => onDelete(id)}
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  )
}
