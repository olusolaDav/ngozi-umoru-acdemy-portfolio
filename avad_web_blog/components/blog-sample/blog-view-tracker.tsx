"use client"

import { useEffect } from "react"

interface BlogViewTrackerProps {
  postId: string
  slug: string
}

export function BlogViewTracker({ postId, slug }: BlogViewTrackerProps) {
  useEffect(() => {
    // Track view only once per session/user using localStorage
    const viewedKey = `blog_viewed_${postId}`
    const hasViewed = localStorage.getItem(viewedKey)
    
    if (!hasViewed) {
      // Mark as viewed in localStorage
      localStorage.setItem(viewedKey, Date.now().toString())
      
      // Call API to increment view count
      fetch(`/api/blog/${slug}/view`, { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      }).catch(err => {
        console.error('Error tracking view:', err)
      })
    }
  }, [postId, slug])

  // This component doesn't render anything
  return null
}
