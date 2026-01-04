import type { Metadata } from "next"

// Static metadata for homepage  
export const metadata: Metadata = {
  title: "Dr. Ngozi Blessing Umoru | Academic English Tutor & Lecturer | UK",
  description: "Dynamic and student-centred Lecturer and Academic English Tutor with extensive experience teaching Academic English, EAP/ESL, Humanities, and Foundation-level courses across UK FE/HE settings. PhD in Education & Pedagogy.",
  keywords: "academic english tutor uk, eap tutor united kingdom, esl lecturer uk, higher education lecturer, education phd researcher, ngozi umoru",
  authors: [{ name: "Dr. Ngozi Blessing Umoru" }],
  creator: "Dr. Ngozi Blessing Umoru",
  openGraph: {
    title: "Dr. Ngozi Blessing Umoru | Academic English Tutor & Lecturer",
    description: "PhD researcher and Academic English Tutor with extensive UK FE/HE teaching experience. Specialising in EAP/ESL, Academic Writing, and Humanities instruction.",
    type: "website",
    locale: "en_GB",
  },
  twitter: {
    card: "summary_large_image",
    title: "Dr. Ngozi Blessing Umoru | Academic English Tutor & Lecturer",
    description: "PhD researcher and Academic English Tutor with extensive UK FE/HE teaching experience.",
  },
}
import { Footer } from "@/components/footer-dynamic"
import { HeroSection } from "@/components/home/hero-section"
import { AboutSection } from "@/components/home/about-section"
import { ExperienceSection } from "@/components/home/experience-section"
import { EducationSection } from "@/components/home/education-section"
import { PublicationsSection } from "@/components/home/publications-section"
import { ResourcesPreviewSection } from "@/components/home/resources-preview-section"
import { BlogPreviewSection } from "@/components/home/blog-preview-section"

import { Navigation } from "@/components/navigation"

// Check if we're in build/static generation mode
const isBuildTime = process.env.NODE_ENV === 'production' && !process.env.VERCEL_URL && typeof window === 'undefined'

async function getSiteContent() {
  // Skip fetching during build time to avoid static generation errors
  if (isBuildTime) {
    return null
  }
  
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:4000')
    const res = await fetch(`${baseUrl}/api/admin/site`, {
      cache: 'no-store' // Ensure we get latest content
    })
    if (!res.ok) throw new Error('Failed to fetch')
    const data = await res.json()
    return data.content
  } catch (error) {
    console.error('Error fetching site content:', error)
    // Fallback to default content from API
    return null
  }
}

export default async function Home() {
  const siteContent = await getSiteContent()

  // If API fails, the components will use their own fallback data
  return (
    <div className="min-h-screen">
      <Navigation />

      {/* Hero Section */}
      <HeroSection {...(siteContent?.hero || {})} />

      {/* About Section */}
      <AboutSection {...(siteContent?.about || {})} />

      {/* Experience Section */}
      <ExperienceSection {...(siteContent?.experience || {})} />

      {/* Education Section */}
      <EducationSection {...(siteContent?.education || {})} />

      {/* Publications Section */}
      <PublicationsSection {...(siteContent?.publications || {})} />

      {/* Resources Preview Section */}
      <ResourcesPreviewSection />

      {/* Blog Preview Section */}
      <BlogPreviewSection />

      <Footer />
    </div>
  )
}
