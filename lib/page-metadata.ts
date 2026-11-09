import type { Metadata } from "next"
import { getSiteMetadata, generateMetadata, defaultMetadataFallback } from "@/lib/metadata-service"

// Contact page metadata
export async function generateContactMetadata(): Promise<Metadata> {
  const siteMetadata = await getSiteMetadata()
  
  if (siteMetadata) {
    return generateMetadata(siteMetadata, "contact")
  }
  
  // Fallback metadata for contact
  return {
    ...defaultMetadataFallback,
    title: "Contact | Dr. Ngozi Blessing Umoru | Academic Collaboration & Enquiries",
    description: "Get in touch with Dr. Ngozi Blessing Umoru for academic collaboration, tutoring enquiries, research partnerships, or speaking engagements in the UK.",
  }
}

// Resources page metadata  
export async function generateResourcesMetadata(): Promise<Metadata> {
  const siteMetadata = await getSiteMetadata()
  
  if (siteMetadata) {
    return generateMetadata(siteMetadata, "resources")
  }
  
  // Fallback metadata for resources
  return {
    ...defaultMetadataFallback,
    title: "Resources | Dr. Ngozi Blessing Umoru | Academic Materials & Downloads",
    description: "Access free academic resources, teaching materials, research papers, and educational downloads from Dr. Ngozi Blessing Umoru - Academic English Tutor & PhD Researcher.",
  }
}

// Blog page metadata
export async function generateBlogMetadata(): Promise<Metadata> {
  const siteMetadata = await getSiteMetadata()
  
  if (siteMetadata) {
    return generateMetadata(siteMetadata, "blog")
  }
  
  // Fallback metadata for blog
  return {
    ...defaultMetadataFallback,
    title: "Blog | Academic Insights & Education Research | Dr. Ngozi Blessing Umoru",
    description: "Explore academic insights, education research, teaching methodologies, and scholarly perspectives from Dr. Ngozi Blessing Umoru - PhD researcher and Academic English Tutor.",
  }
}