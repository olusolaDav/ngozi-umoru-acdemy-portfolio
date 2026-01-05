"use client"

import { useEffect, useState, useCallback } from "react"
import { Footer } from "@/components/footer-dynamic"
import { HeroSection } from "@/components/home/hero-section"
import { AboutSection } from "@/components/home/about-section"
import { ExperienceSection } from "@/components/home/experience-section"
import { EducationSection } from "@/components/home/education-section"
import { PublicationsSection } from "@/components/home/publications-section"
import { ResourcesPreviewSection } from "@/components/home/resources-preview-section"
import { BlogPreviewSection } from "@/components/home/blog-preview-section"
import { Navigation } from "@/components/navigation"
import { HomeLoadingSpinner } from "@/components/home/home-loading-spinner"

interface SiteContent {
  hero?: {
    badge?: string
    name?: string
    credentials?: string
    description?: string
    profileImage?: string
  }
  about?: {
    section?: string
    title?: string
    paragraphs?: string[]
    highlights?: Array<{
      icon: string
      title: string
      description: string
    }>
  }
  experience?: {
    section?: string
    title?: string
    items?: Array<{
      position: string
      institution: string
      period: string
      responsibilities: string[]
    }>
  }
  education?: {
    section?: string
    title?: string
    items?: Array<{
      degree: string
      institution: string
      year: string
    }>
  }
  publications?: {
    section?: string
    title?: string
    profiles?: Array<{
      label: string
      url: string
    }>
    items?: Array<{
      type: string
      date: string
      citations?: string
      title: string
      authors: string
      journal: string
      url: string
    }>
  }
}

const CACHE_KEY = "site_content_cache"
const CACHE_TIMESTAMP_KEY = "site_content_cache_timestamp"
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

function getCachedContent(): SiteContent | null {
  if (typeof window === "undefined") return null
  
  try {
    const cached = localStorage.getItem(CACHE_KEY)
    const timestamp = localStorage.getItem(CACHE_TIMESTAMP_KEY)
    
    if (cached && timestamp) {
      const age = Date.now() - parseInt(timestamp, 10)
      // Return cache if it's still valid (even if expired, we'll refresh in background)
      if (cached) {
        return JSON.parse(cached)
      }
    }
  } catch {
    // Ignore cache errors
  }
  return null
}

function setCachedContent(content: SiteContent): void {
  if (typeof window === "undefined") return
  
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(content))
    localStorage.setItem(CACHE_TIMESTAMP_KEY, Date.now().toString())
  } catch {
    // Ignore cache errors
  }
}

function isCacheStale(): boolean {
  if (typeof window === "undefined") return true
  
  try {
    const timestamp = localStorage.getItem(CACHE_TIMESTAMP_KEY)
    if (timestamp) {
      const age = Date.now() - parseInt(timestamp, 10)
      return age > CACHE_DURATION
    }
  } catch {
    // Ignore errors
  }
  return true
}

export function HomeContent() {
  const [siteContent, setSiteContent] = useState<SiteContent | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [hasInitialLoad, setHasInitialLoad] = useState(false)

  const fetchSiteContent = useCallback(async (showLoading = true) => {
    try {
      const res = await fetch("/api/admin/site", {
        cache: "no-store",
      })
      
      if (!res.ok) throw new Error("Failed to fetch")
      
      const data = await res.json()
      
      if (data.ok && data.content) {
        setSiteContent(data.content)
        setCachedContent(data.content)
      }
    } catch (error) {
      console.error("Error fetching site content:", error)
      // Don't clear existing content on error - keep showing cached/current data
    } finally {
      if (showLoading) {
        setIsLoading(false)
      }
    }
  }, [])

  useEffect(() => {
    // Check for cached content first
    const cached = getCachedContent()
    
    if (cached) {
      // Use cached content immediately
      setSiteContent(cached)
      setIsLoading(false)
      setHasInitialLoad(true)
      
      // If cache is stale, refresh in background
      if (isCacheStale()) {
        fetchSiteContent(false)
      }
    } else {
      // No cache, fetch fresh data
      fetchSiteContent(true)
      setHasInitialLoad(true)
    }
  }, [fetchSiteContent])

  // Show loading spinner only on initial load without cache
  if (isLoading && !siteContent) {
    return <HomeLoadingSpinner />
  }

  // Don't render until we have content
  if (!siteContent) {
    return <HomeLoadingSpinner />
  }

  return (
    <div className="min-h-screen">
      <Navigation />

      {/* Hero Section */}
      <HeroSection {...(siteContent.hero || {})} />

      {/* About Section */}
      <AboutSection {...(siteContent.about || {})} />

      {/* Experience Section */}
      <ExperienceSection {...(siteContent.experience || {})} />

      {/* Education Section */}
      <EducationSection {...(siteContent.education || {})} />

      {/* Publications Section */}
      <PublicationsSection {...(siteContent.publications || {})} />

      {/* Resources Preview Section */}
      <ResourcesPreviewSection />

      {/* Blog Preview Section */}
      <BlogPreviewSection />

      <Footer />
    </div>
  )
}
