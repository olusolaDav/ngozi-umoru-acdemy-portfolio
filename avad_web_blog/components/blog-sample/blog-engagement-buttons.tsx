"use client"

import { useState, useEffect } from "react"
import { Heart, Share2, Link2, Instagram } from "lucide-react"
import { toast } from "sonner"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"

interface BlogEngagementButtonsProps {
  postId: string
  postSlug: string
  postTitle: string
  initialLikes: number
  initialShares: number
  variant?: "header" | "footer"
  className?: string
}

export function BlogEngagementButtons({
  postId,
  postSlug,
  postTitle,
  initialLikes,
  initialShares,
  variant = "footer",
  className = ""
}: BlogEngagementButtonsProps) {
  const [likes, setLikes] = useState(initialLikes || 0)
  const [shares, setShares] = useState(initialShares || 0)
  const [isLiked, setIsLiked] = useState(false)

  // Fetch live counts on mount so stale static-page values are replaced
  useEffect(() => {
    const key = `blog_like_${postId}`
    const liked = typeof window !== 'undefined' ? localStorage.getItem(key) === '1' : false
    setIsLiked(liked)

    // Fetch fresh counts from the API
    fetch(`/api/blog/${postSlug}`, { cache: "no-store" })
      .then(r => r.json())
      .then(data => {
        if (data.ok && data.post) {
          setLikes(data.post.likes ?? initialLikes)
          setShares(data.post.shares ?? initialShares)
        }
      })
      .catch(() => {/* silently fall back to initial values */})
  }, [postId, postSlug, initialLikes, initialShares])

  async function toggleLike() {
    const key = `blog_like_${postId}`
    const currentlyLiked = isLiked
    const newLikedStatus = !currentlyLiked

    // Optimistic UI update
    setIsLiked(newLikedStatus)
    setLikes(likes + (newLikedStatus ? 1 : -1))

    try {
      const res = await fetch(`/api/blog/${postSlug}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: newLikedStatus ? 'like' : 'unlike' })
      })

      if (res.ok) {
        if (newLikedStatus) {
          localStorage.setItem(key, '1')
          if (variant === "footer") {
            toast.success('Thanks for liking this post! ❤️')
          }
        } else {
          localStorage.removeItem(key)
        }
      } else {
        // Revert optimistic update on failure
        setIsLiked(currentlyLiked)
        setLikes(likes)
        toast.error('Failed to update like status')
      }
    } catch (err) {
      console.error('Error toggling like:', err)
      // Revert optimistic update on failure
      setIsLiked(currentlyLiked)
      setLikes(likes)
      toast.error('Failed to update like status')
    }
  }

  const getShareUrl = () => typeof window !== 'undefined' ? window.location.href : ''

  async function copyLink() {
    const shareUrl = getShareUrl()
    try {
      await navigator.clipboard.writeText(shareUrl)
      toast.success('Link copied to clipboard!')
      setShares(s => s + 1)
      await fetch(`/api/blog/${postSlug}/share`, { method: 'POST' })
    } catch (err) {
      toast.error('Failed to copy link')
      console.error('Error copying link:', err)
    }
  }

  function shareOnX() {
    const shareUrl = getShareUrl()
    const text = encodeURIComponent(`${postTitle}\\n\\n`)
    const url = encodeURIComponent(shareUrl)
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank', 'noopener,noreferrer,width=600,height=400')
    setShares(s => s + 1)
    fetch(`/api/blog/${postSlug}/share`, { method: 'POST' })
  }

  function shareOnFacebook() {
    const shareUrl = getShareUrl()
    const textToCopy = `${postTitle}\\n\\nRead more: ${shareUrl}`
    
    navigator.clipboard.writeText(textToCopy).then(() => {
      toast.success('Text copied! Opening Facebook...')
      window.open('https://www.facebook.com/', '_blank', 'noopener,noreferrer')
      setShares(s => s + 1)
      fetch(`/api/blog/${postSlug}/share`, { method: 'POST' })
    }).catch(() => {
      toast.error('Failed to copy. Opening Facebook...')
      window.open('https://www.facebook.com/', '_blank', 'noopener,noreferrer')
    })
  }

  function shareOnLinkedIn() {
    const shareUrl = getShareUrl()
    const text = encodeURIComponent(postTitle)
    const url = encodeURIComponent(shareUrl)
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}&title=${text}`, '_blank', 'noopener,noreferrer,width=600,height=400')
    setShares(s => s + 1)
    fetch(`/api/blog/${postSlug}/share`, { method: 'POST' })
  }

  function shareOnInstagram() {
    const shareUrl = getShareUrl()
    const textToCopy = `${postTitle}\\n\\nRead the full article at: ${shareUrl}`
    
    navigator.clipboard.writeText(textToCopy).then(() => {
      toast.success('Text copied! Opening Instagram...')
      window.open('https://www.instagram.com/', '_blank', 'noopener,noreferrer')
      setShares(s => s + 1)
      fetch(`/api/blog/${postSlug}/share`, { method: 'POST' })
    }).catch(() => {
      toast.error('Failed to copy. Opening Instagram...')
      window.open('https://www.instagram.com/', '_blank', 'noopener,noreferrer')
    })
  }

  if (variant === "header") {
    return (
      <div className={`flex items-center gap-4 ${className}`}>
        <button 
          onClick={toggleLike} 
          className="flex items-center gap-2 rounded-full border px-3 py-1 hover:bg-muted cursor-pointer transition-colors"
        >
          <Heart className={`h-4 w-4 transition-colors ${isLiked ? 'text-red-500 fill-current' : ''}`} />
          <span>{likes}</span>
        </button>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 rounded-full border px-3 py-1 hover:bg-muted cursor-pointer transition-colors">
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
      </div>
    )
  }

  // Footer variant - larger buttons with text
  return (
    <div className={`flex flex-col sm:flex-row items-center justify-center gap-4 ${className}`}>
      <Button
        variant="outline"
        size="lg"
        onClick={toggleLike}
        className={`min-w-[120px] ${isLiked ? 'border-red-200 bg-red-50 text-red-600 hover:bg-red-100' : ''}`}
      >
        <Heart className={`h-5 w-5 mr-2 ${isLiked ? 'fill-current' : ''}`} />
        {isLiked ? 'Liked' : 'Like'} ({likes})
      </Button>
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="lg" className="min-w-[120px]">
            <Share2 className="h-5 w-5 mr-2" />
            Share ({shares})
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="center" className="w-52">
          <DropdownMenuItem onClick={copyLink} className="cursor-pointer gap-3">
            <Link2 className="h-4 w-4" />
            Copy link
          </DropdownMenuItem>
          <DropdownMenuItem onClick={shareOnX} className="cursor-pointer gap-3">
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
            Share on X (Twitter)
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
    </div>
  )
}