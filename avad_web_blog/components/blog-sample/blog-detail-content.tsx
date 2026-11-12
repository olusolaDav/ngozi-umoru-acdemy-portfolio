"use client"

import { ScrollAnimation } from "@/components/ui/scroll-animation"
import { Heart, Share2, Eye } from "lucide-react"
import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { UserAvatar } from "@/components/dashboard/user-avatar"
import { useTheme } from "next-themes"
import Image from "next/image"
import { BlogEngagementButtons } from "./blog-engagement-buttons"

// Helper function to convert video URLs into embedded iframes AND clean up ALL editor formatting
function processVideoContent(html: string): string {
  if (!html) return html
  
  // Replace non-breaking spaces from Quill editor with regular spaces
  // This prevents the browser from treating entire paragraphs as single unbreakable words
  html = html.replace(/&nbsp;/g, ' ')
  html = html.replace(/\u00a0/g, ' ')
  
  // AGGRESSIVELY clean up ALL problematic formatting
  // Remove ALL inline styles
  html = html.replace(/\s*style\s*=\s*["'][^"']*["']/gi, '')
  // Remove ALL class attributes (including ql-editor, prose, etc.)
  html = html.replace(/\s*class\s*=\s*["'][^"']*["']/gi, '')
  // Remove ALL id attributes
  html = html.replace(/\s*id\s*=\s*["'][^"']*["']/gi, '')
  // Remove data attributes
  html = html.replace(/\s*data-[a-z-]+\s*=\s*["'][^"']*["']/gi, '')
  // Remove contenteditable
  html = html.replace(/\s*contenteditable\s*=\s*["']?[^\s"'>]*["']?/gi, '')
  // Remove spellcheck
  html = html.replace(/\s*spellcheck\s*=\s*["']?[^\s"'>]*["']?/gi, '')
  // Strip width and height attributes from iframes — these hardcoded values (e.g. height="314")
  // override all CSS sizing including the responsive wrapper approach
  html = html.replace(/<iframe([^>]*)>/gi, (_match, attrs) => {
    const cleanAttrs = attrs
      .replace(/\s*width\s*=\s*["']?[^\s"'>]*["']?/gi, '')
      .replace(/\s*height\s*=\s*["']?[^\s"'>]*["']?/gi, '')
    return `<iframe${cleanAttrs}>`
  })
  // Clean up any double spaces in tags
  html = html.replace(/<([a-z][a-z0-9]*)\s+>/gi, '<$1>')
  
  // Convert YouTube URLs (various formats) to embeds
  // Matches: youtube.com/watch?v=ID, youtu.be/ID, youtube.com/embed/ID
  const youtubeRegex = /<a[^>]*href=["'](?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]+)[^"']*["'][^>]*>(?:[^<]*)<\/a>/gi
  
  html = html.replace(youtubeRegex, (match, videoId) => {
    return `<iframe class="ql-video" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`
  })
  
  // Also handle plain YouTube URLs that are just text (not in anchor tags)
  const plainYoutubeRegex = /(?<!["'=])(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]+)(?:[?&][^<\s]*)?(?![^<]*>)(?=\s|<|$)/gi
  
  html = html.replace(plainYoutubeRegex, (match, videoId) => {
    return `<iframe class="ql-video" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`
  })
  
  // Convert Vimeo URLs to embeds
  const vimeoRegex = /<a[^>]*href=["'](?:https?:\/\/)?(?:www\.)?vimeo\.com\/(\d+)[^"']*["'][^>]*>(?:[^<]*)<\/a>/gi
  
  html = html.replace(vimeoRegex, (match, videoId) => {
    return `<iframe class="ql-video" src="https://player.vimeo.com/video/${videoId}" frameborder="0" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe>`
  })
  
  // Ensure existing iframes have proper class
  html = html.replace(/<iframe([^>]*?)(?:class=["'][^"']*["'])?([^>]*)>/gi, (match, before, after) => {
    if (match.includes('class=')) {
      // Add ql-video to existing class if not present
      return match.replace(/class=["']([^"']*)["']/i, (classMatch, existingClasses) => {
        if (!existingClasses.includes('ql-video')) {
          return `class="${existingClasses} ql-video"`
        }
        return classMatch
      })
    }
    return `<iframe${before} class="ql-video"${after}>`
  })

  return html
}

interface BlogPost {
  _id: string
  title: string
  slug: string
  content: string
  description?: string
  excerpt: string
  thumbnail: string
  author: {
    _id: string
    name: string
    avatar?: string
    role?: string // 'admin' or 'blogger'
  }
  updatedBy?: {
    _id: string
    name: string
    avatar?: string
  }
  status: "published" | "draft" | "scheduled"
  tags: string[]
  views: number
  commentsCount: number
  likes: number
  shares: number
  readTime: number
  createdAt: string
  publishedAt?: string
  updatedAt: string
}

interface BlogDetailContentProps {
  post: BlogPost
}

// Component for displaying author avatar - shows ALOT logo for admin posts
function AuthorAvatar({ author, size = "xl" }: { author: BlogPost["author"]; size?: "sm" | "xl" }) {
  const { theme } = useTheme()
  const isAdmin = author.role === "admin"
  
  const sizeClasses = size === "xl" ? "w-16 h-16" : "w-8 h-8"
  const imgSize = size === "xl" ? 64 : 32
  
  if (isAdmin) {
    return (
      <div className={`${sizeClasses} rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0`}>
        <Image
          src={theme === "dark" ? "/alot-yellow.svg" : "/alot-blue.svg"}
          alt="Alot Digital Agency"
          width={imgSize * 0.6}
          height={imgSize * 0.6}
          className="object-contain"
        />
      </div>
    )
  }
  
  return (
    <UserAvatar 
      name={author.name} 
      image={author.avatar} 
      size={size}
      className="flex-shrink-0"
    />
  )
}

export function BlogDetailContent({ post }: BlogDetailContentProps) {
  // Process content to convert video URLs to embeds
  const processedContent = useMemo(() => processVideoContent(post.content), [post.content])
  
  return (
    <section className="py-12 bg-background">
      <div className="container mx-auto px-4 md:px-6">
        <div className="max-w-4xl mx-auto">
          {/* Optional Description */}
          {post.description && (
            <ScrollAnimation delay={0.1}>
              <p 
                className="text-lg text-muted-foreground mb-8 italic border-l-4 border-primary pl-4"
              >
                {post.description}
              </p>
            </ScrollAnimation>
          )}
          
          <ScrollAnimation delay={0.15}>
            <div 
              className="prose prose-lg prose-slate max-w-none dark:prose-invert"
              dangerouslySetInnerHTML={{ __html: processedContent }}
            />
          </ScrollAnimation>

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <ScrollAnimation delay={0.2}>
              <div className="mt-12 pt-8 border-t border-border">
                <h4 className="text-sm font-semibold text-muted-foreground mb-4">Related Topics</h4>
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag) => (
                    <span 
                      key={tag}
                      className="px-4 py-2 rounded-full bg-muted text-sm font-medium text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors cursor-pointer"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </ScrollAnimation>
          )}

          {/* Author Card */}
          <ScrollAnimation delay={0.25}>
            <div className="mt-12 p-6 bg-muted/40 rounded-2xl">
              <div className="flex items-start gap-4">
                <AuthorAvatar author={post.author} size="xl" />
                <div className="flex-1">
                  <h4 className="font-bold text-foreground mb-1">
                    Written by {post.author.role === "admin" ? "Alot Digital Agency" : post.author.name}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {post.author.role === "admin" 
                      ? "Your trusted partner for digital solutions. We help businesses grow with expert web development, design, and marketing services."
                      : "Thanks for reading! If you found this article helpful, feel free to share it with others."
                    }
                  </p>
                  {post.updatedBy && post.updatedBy._id !== post.author._id && (
                    <div className="mt-3 pt-3 border-t border-border/50 flex items-center gap-2">
                      <UserAvatar 
                        name={post.updatedBy.name} 
                        image={post.updatedBy.avatar} 
                        size="sm"
                      />
                      <span className="text-xs text-muted-foreground">
                        Last updated by {post.updatedBy.name}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </ScrollAnimation>

          {/* Footer Engagement Buttons */}
          <ScrollAnimation delay={0.3}>
            <div className="mt-12 pt-8 border-t border-border text-center">
              <p className="text-lg font-semibold text-foreground mb-6">
                Enjoyed this article?
              </p>
              <BlogEngagementButtons 
                postId={post._id}
                postSlug={post.slug}
                postTitle={post.title}
                initialLikes={post.likes}
                initialShares={post.shares}
                variant="footer"
                className="mb-4"
              />
              <p className="text-sm text-muted-foreground mt-4">
                Share with your network and help others discover great content!
              </p>
            </div>
          </ScrollAnimation>
        </div>
      </div>
    </section>
  )
}
