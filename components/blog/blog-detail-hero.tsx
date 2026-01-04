"use client"

import { motion } from "framer-motion"
import { MessageSquare, Clock, Calendar, Heart, Share2, Eye, Link2, Instagram, ArrowLeft } from "lucide-react"
import { ScrollAnimation } from "@/components/ui/scroll-animation"
import { cn } from "@/lib/utils"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import Link from "next/link"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"



interface BlogPost {
  _id: string
  title: string
  slug: string
  content: string
  excerpt: string
  thumbnail: string
  author: {
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

interface BlogDetailHeroProps {
  post: BlogPost
}

function formatBlogDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })
}

export function BlogDetailHero({ post }: BlogDetailHeroProps) {
  const categoryColors: Record<string, string> = {
    Law: "bg-primary text-primary-foreground",
    Health: "bg-accent text-accent-foreground",
    Healthcare: "bg-accent text-accent-foreground",
    Education: "bg-accent text-accent-foreground",
    Technology: "bg-primary text-primary-foreground",
    Finance: "bg-primary text-primary-foreground",
    "Oil and Gas": "bg-orange-500 text-white",
    Telecommunications: "bg-blue-500 text-white",
    Retail: "bg-green-500 text-white",
    Manufacturing: "bg-indigo-500 text-white",
    Automotive: "bg-red-500 text-white",
    Pharmaceuticals: "bg-purple-500 text-white",
    Other: "bg-gray-500 text-white",
  }
    const router = useRouter()
  
   const [likes, setLikes] = useState(post.likes || 0)
    const [shares, setShares] = useState(post.shares || 0)
    const [isLiked, setIsLiked] = useState(false)

     useEffect(() => {
        const key = `blog_like_${post._id}`
        const liked = typeof window !== 'undefined' ? localStorage.getItem(key) === '1' : false
        setIsLiked(liked)
      }, [post._id])

    async function toggleLike() {
    const key = `blog_like_${post._id}`
    const currentlyLiked = isLiked
    const newLikedStatus = !currentlyLiked

    // Optimistic UI update
    setIsLiked(newLikedStatus)
    setLikes(likes + (newLikedStatus ? 1 : -1))

    try {
      const res = await fetch(`/api/blog/${post.slug}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: newLikedStatus ? 'like' : 'unlike' })
      })

      if (res.ok) {
        if (newLikedStatus) {
          localStorage.setItem(key, '1')
        } else {
          localStorage.removeItem(key)
        }
        // Re-fetch data in the background to ensure consistency
        router.refresh()
      } else {
        // Revert optimistic update on failure
        setIsLiked(currentlyLiked)
        setLikes(likes)
      }
    } catch (err) {
      console.error('Error toggling like:', err)
      // Revert optimistic update on failure
      setIsLiked(currentlyLiked)
      setLikes(likes)
    }
  }
const getShareUrl = () => typeof window !== 'undefined' ? window.location.href : ''

  async function copyLink() {
    const shareUrl = getShareUrl()
    try {
      await navigator.clipboard.writeText(shareUrl)
      toast.success('Link copied to clipboard!')
      // Update share count
      setShares(s => s + 1)
      await fetch(`/api/blog/${post.slug}/share`, { method: 'POST' })
      router.refresh()
    } catch (err) {
      toast.error('Failed to copy link')
      console.error('Error copying link:', err)
    }
  }

  function shareOnX() {
    const shareUrl = getShareUrl()
    const text = encodeURIComponent(`${post.title}\n\n`)
    const url = encodeURIComponent(shareUrl)
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank', 'noopener,noreferrer,width=600,height=400')
    // Update share count
    setShares(s => s + 1)
    fetch(`/api/blog/${post.slug}/share`, { method: 'POST' })
  }

  function shareOnFacebook() {
    // Copy title + link to clipboard and open Facebook new post
    const shareUrl = getShareUrl()
    const textToCopy = `${post.title}\n\nRead more: ${shareUrl}`
    navigator.clipboard.writeText(textToCopy).then(() => {
      toast.success('Caption copied! Opening Facebook new post...')
      // Update share count
      setShares(s => s + 1)
      fetch(`/api/blog/${post.slug}/share`, { method: 'POST' })
      // Open Facebook's create post dialog
      setTimeout(() => {
        window.open('https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(shareUrl), '_blank', 'noopener,noreferrer,width=600,height=500')
      }, 1000)
    }).catch(() => {
      toast.error('Failed to copy. Opening Facebook...')
      window.open('https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(shareUrl), '_blank', 'noopener,noreferrer,width=600,height=500')
    })
  }

  function shareOnLinkedIn() {
    // Copy title + link to clipboard and open LinkedIn new post
    const shareUrl = getShareUrl()
    const textToCopy = `${post.title}\n\nRead more: ${shareUrl}`
    navigator.clipboard.writeText(textToCopy).then(() => {
      toast.success('Caption copied! Opening LinkedIn new post...')
      // Update share count
      setShares(s => s + 1)
      fetch(`/api/blog/${post.slug}/share`, { method: 'POST' })
      // Open LinkedIn's share box
      setTimeout(() => {
        window.open('https://www.linkedin.com/sharing/share-offsite/?url=' + encodeURIComponent(shareUrl), '_blank', 'noopener,noreferrer,width=600,height=600')
      }, 1000)
    }).catch(() => {
      toast.error('Failed to copy. Opening LinkedIn...')
      window.open('https://www.linkedin.com/sharing/share-offsite/?url=' + encodeURIComponent(shareUrl), '_blank', 'noopener,noreferrer,width=600,height=600')
    })
  }

  function shareOnInstagram() {
    // Instagram doesn't support web posting - must use mobile app
    // Copy title + link to clipboard and notify user
    const shareUrl = getShareUrl()
    const textToCopy = `${post.title}\n\nRead more: ${shareUrl}`
    navigator.clipboard.writeText(textToCopy).then(() => {
      toast.success('Caption copied! Open Instagram app to create a new post and paste.')
      // Update share count
      setShares(s => s + 1)
      fetch(`/api/blog/${post.slug}/share`, { method: 'POST' })
      // Open Instagram website - note: posting only works via mobile app
      setTimeout(() => {
        window.open('https://www.instagram.com/', '_blank', 'noopener,noreferrer')
      }, 1000)
    }).catch(() => {
      toast.error('Failed to copy. Opening Instagram...')
      window.open('https://www.instagram.com/', '_blank', 'noopener,noreferrer')
    })
  }
  const primaryTag = post.tags[0] || "General"
  const tagColor = categoryColors[primaryTag] || "bg-primary text-primary-foreground"

  return (
    <section className="pt-32 pb-8 bg-background">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Back Navigation */}
          <ScrollAnimation>
            <Link 
              href="/blog" 
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-8 group"
            >
              <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
              <span>Back to Blog</span>
            </Link>
          </ScrollAnimation>

          <div className="text-center">
            <ScrollAnimation>
              <motion.span
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/20 bg-primary/5 text-sm font-medium text-primary mb-6"
              >
                <MessageSquare className="w-4 h-4" />
                OUR BLOG
              </motion.span>
            </ScrollAnimation>

          <ScrollAnimation delay={0.1}>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6 text-balance leading-tight">
              {post.title}
            </h1>
          </ScrollAnimation>


          <ScrollAnimation delay={0.2}>
            <div className="flex flex-wrap items-center justify-center gap-4 text-sm">
              <span className={cn("px-4 py-1.5 rounded-full text-sm font-medium", tagColor)}>{primaryTag}</span>
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span>{post.readTime} Min</span>
              </div>
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Calendar className="w-4 h-4" />
                <span>{formatBlogDate(post.publishedAt || post.createdAt)}</span>
              </div>
           
              <button onClick={toggleLike} className="flex items-center gap-2 rounded-full border px-3 py-1 hover:bg-muted cursor-pointer">
                <Heart className={`h-4 w-4 ${isLiked ? 'text-red-500 fill-current' : ''}`} />
                <span>{likes}</span>
              </button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 rounded-full border px-3 py-1 hover:bg-muted cursor-pointer">
                    <Share2 className="h-4 w-4" />
                    <span>{shares}</span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="center" className="w-48">
                  <DropdownMenuItem onClick={copyLink} className="cursor-pointer gap-3">
                    <Link2 className="h-4 w-4" />
                    Copy link
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={shareOnX} className="cursor-pointer gap-3">
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                    Share on X
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={shareOnFacebook} className="cursor-pointer gap-3">
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                    Share on Facebook
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={shareOnLinkedIn} className="cursor-pointer gap-3">
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                    </svg>
                    Share on LinkedIn
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={shareOnInstagram} className="cursor-pointer gap-3">
                    <Instagram className="h-4 w-4" />
                    Share on Instagram
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <div className="flex items-center gap-2 rounded-full border px-3 py-1">
                <Eye className="h-4 w-4" />
                <span>{post.views || 0}</span>
              </div>
     

            </div>
          </ScrollAnimation>
        </div>
        </div>
      </div>
    </section>
  )
}
