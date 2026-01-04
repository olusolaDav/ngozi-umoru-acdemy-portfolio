"use client"

import { useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { X, ImageIcon } from "lucide-react"
import { SectorDropdown } from "./sector-dropdown"
import type { BlogPost } from "@/lib/blog-data"

interface PublishPostFormProps {
  post?: BlogPost
  onPublishNow?: (data: PublishData) => void
  onClose?: () => void
}

interface PublishData {
  title: string
  metaDescription: string
  tags: string[]
}

export function PublishPostForm({ post, onPublishNow, onClose }: PublishPostFormProps) {
  const router = useRouter()
  const [title, setTitle] = useState(post?.title || "")
  const [metaDescription, setMetaDescription] = useState(post?.excerpt || "")
  const [selectedSectors, setSelectedSectors] = useState<string[]>(post?.tags || [])
  const maxDescriptionLength = 160

  // Extract first image from content for thumbnail
  const getFirstImage = (content: string): string | null => {
    const imgMatch = content?.match(/<img[^>]+src="([^"]+)"/)
    return imgMatch ? imgMatch[1] : null
  }

  // Get thumbnail - prioritize post.thumbnail, then extract from content
  const thumbnailUrl = post?.thumbnail || (post?.content ? getFirstImage(post.content) : null) || null

  const handlePublishNow = () => {
    onPublishNow?.({
      title,
      metaDescription,
      tags: selectedSectors,
    })
  }

  return (
    <div className="flex h-full flex-col bg-white dark:bg-gray-950">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 px-6 py-4">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-50">Publish Post</h1>
        <button 
          onClick={onClose || (() => router.back())} 
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        <div className="mx-auto grid max-w-4xl gap-8 lg:grid-cols-2">
          {/* Left Column - Post Details */}
          <div className="space-y-6">
            {/* Thumbnail Preview */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Thumbnail Preview
              </label>
              <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                {thumbnailUrl ? (
                  <Image 
                    src={thumbnailUrl} 
                    alt="Post thumbnail" 
                    fill 
                    className="object-cover" 
                  />
                ) : (
                  <div className="flex h-full flex-col items-center justify-center text-gray-400 dark:text-gray-500">
                    <ImageIcon className="h-12 w-12 mb-2" />
                    <p className="text-sm text-center px-4">
                      Include a high-quality image in your story to make it more inviting to readers.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Title
              </label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter post title"
                className="bg-white dark:bg-gray-900"
              />
            </div>

            {/* Meta Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Meta Description
              </label>
              <Textarea
                value={metaDescription}
                onChange={(e) => setMetaDescription(e.target.value.slice(0, maxDescriptionLength))}
                placeholder="Brief description for search engines and social media"
                className="min-h-[100px] resize-none bg-white dark:bg-gray-900"
              />
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                {metaDescription.length}/{maxDescriptionLength} characters
              </p>
            </div>
          </div>

          {/* Right Column - Tags & Actions */}
          <div className="space-y-6">
            {/* Sectors/Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Categories
              </label>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                Select up to 3 categories to help readers find your post
              </p>
              <SectorDropdown
                value={selectedSectors}
                onChange={setSelectedSectors}
                maxSelections={3}
              />
            </div>

            {/* Info Note */}
            <div className="rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/50 p-4">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                <span className="font-medium">Note:</span> Changes here will affect how your story appears in public places like your blog homepage and search results - not the contents of the story itself.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-3 pt-4">
              <Button
                onClick={handlePublishNow}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                disabled={!title.trim()}
              >
                Publish Now
              </Button>
              <Button
                variant="outline"
                onClick={onClose || (() => router.back())}
                className="w-full"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
