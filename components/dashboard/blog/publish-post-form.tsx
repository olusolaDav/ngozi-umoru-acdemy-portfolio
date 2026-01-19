"use client"

import { useState, useEffect, useMemo } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { X, ImageIcon, AlertCircle } from "lucide-react"
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

// Decode HTML entities
function decodeHtmlEntities(text: string): string {
  const entities: Record<string, string> = {
    '&nbsp;': ' ',
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#39;': "'",
    '&apos;': "'",
    '&mdash;': '\u2014',
    '&ndash;': '\u2013',
    '&hellip;': '\u2026',
    '&rsquo;': '\u2019',
    '&lsquo;': '\u2018',
    '&rdquo;': '\u201D',
    '&ldquo;': '\u201C',
  }
  
  let decoded = text
  Object.entries(entities).forEach(([entity, char]) => {
    decoded = decoded.replace(new RegExp(entity, 'gi'), char)
  })
  
  // Handle numeric entities like &#160;
  decoded = decoded.replace(/&#(\d+);/g, (_, code) => String.fromCharCode(parseInt(code, 10)))
  
  // Clean up multiple spaces
  decoded = decoded.replace(/\s+/g, ' ').trim()
  
  return decoded
}

// Extract first paragraph text from HTML content
function extractFirstParagraph(htmlContent: string): string {
  if (!htmlContent) return ""
  
  // Remove images and other non-text elements first
  const cleanedContent = htmlContent
    .replace(/<img[^>]*>/gi, "")
    .replace(/<video[^>]*>.*?<\/video>/gi, "")
    .replace(/<iframe[^>]*>.*?<\/iframe>/gi, "")
  
  // Try to find the first paragraph
  const paragraphMatch = cleanedContent.match(/<p[^>]*>(.*?)<\/p>/i)
  if (paragraphMatch) {
    // Remove HTML tags from paragraph content and decode entities
    const text = decodeHtmlEntities(paragraphMatch[1].replace(/<[^>]+>/g, "")).trim()
    if (text) return text
  }
  
  // Fallback: strip all HTML and get first meaningful text
  const plainText = decodeHtmlEntities(cleanedContent.replace(/<[^>]+>/g, "")).trim()
  // Get first 160 characters
  return plainText.substring(0, 160)
}

// Extract first image from HTML content
function extractFirstImage(content: string): string | null {
  if (!content) return null
  const imgMatch = content.match(/<img[^>]+src="([^"]+)"/)
  return imgMatch ? imgMatch[1] : null
}

export function PublishPostForm({ post, onPublishNow, onClose }: PublishPostFormProps) {
  const router = useRouter()
  const maxDescriptionLength = 160

  // Extract auto-values from content
  const autoMetaDescription = useMemo(() => {
    return post?.content ? extractFirstParagraph(post.content) : ""
  }, [post?.content])

  const thumbnailUrl = useMemo(() => {
    return post?.thumbnail || (post?.content ? extractFirstImage(post.content) : null) || null
  }, [post?.thumbnail, post?.content])

  // Form state - initialize meta description from excerpt or auto-extracted first paragraph
  const [title, setTitle] = useState(post?.title || "")
  const [metaDescription, setMetaDescription] = useState(() => {
    if (post?.excerpt) return post.excerpt
    return autoMetaDescription.substring(0, maxDescriptionLength)
  })
  const [selectedSectors, setSelectedSectors] = useState<string[]>(post?.tags || [])

  // Auto-fill meta description when content changes and field is empty
  useEffect(() => {
    if (!metaDescription && autoMetaDescription) {
      setMetaDescription(autoMetaDescription.substring(0, maxDescriptionLength))
    }
  }, [autoMetaDescription])

  // Check if content has any text (not just HTML tags/empty paragraphs)
  const hasContent = useMemo(() => {
    if (!post?.content) return false
    const textContent = post.content.replace(/<[^>]+>/g, "").trim()
    return textContent.length > 0
  }, [post?.content])

  // Validation errors
  const validationErrors = useMemo(() => {
    const errors: string[] = []
    
    if (!title.trim()) {
      errors.push("Title is required")
    }
    
    if (!metaDescription.trim()) {
      errors.push("Meta description is required")
    }
    
    if (!thumbnailUrl) {
      errors.push("Include at least one image in your content for the thumbnail")
    }
    
    if (!hasContent) {
      errors.push("Blog content cannot be empty")
    }
    
    return errors
  }, [title, metaDescription, thumbnailUrl, hasContent])

  const canPublish = validationErrors.length === 0

  const handlePublishNow = () => {
    if (!canPublish) return
    
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

            {/* Validation Errors */}
            {validationErrors.length > 0 && (
              <div className="rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 p-4">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-red-800 dark:text-red-300 mb-1">
                      Please fix the following before publishing:
                    </p>
                    <ul className="text-sm text-red-700 dark:text-red-400 list-disc list-inside space-y-1">
                      {validationErrors.map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col gap-3 pt-4">
              <Button
                onClick={handlePublishNow}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!canPublish}
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
