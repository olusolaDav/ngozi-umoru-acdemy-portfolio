// ============================================================================
// Default Site Content - Complete Site Configuration
// Combines all data sources for fallback/default values
// ============================================================================

import type { SiteContent } from "./site-types"
import { homeData } from "./home-data"
import { defaultProfile } from "./profile-data"
import { defaultFooter } from "./footer-data"
import { defaultMetadata } from "./metadata-data"

/**
 * Complete default site content
 * Used as fallback when database content is unavailable
 * This ensures the site always has content to display
 */
export const defaultSiteContent: SiteContent = {
  // Profile & Identity
  profile: defaultProfile,
  
  // SEO & Metadata
  metadata: defaultMetadata,
  
  // Footer
  footer: defaultFooter,
  
  // Home page sections from home-data.ts
  hero: homeData.hero,
  about: homeData.about,
  experience: homeData.experience,
  education: homeData.education,
  publications: homeData.publications,
}

/**
 * Get merged site content with defaults
 * Safely merges partial content from database with defaults
 */
export function getMergedSiteContent(partialContent?: Partial<SiteContent>): SiteContent {
  if (!partialContent) {
    return defaultSiteContent
  }
  
  return {
    profile: partialContent.profile || defaultSiteContent.profile,
    metadata: partialContent.metadata || defaultSiteContent.metadata,
    footer: partialContent.footer || defaultSiteContent.footer,
    hero: partialContent.hero || defaultSiteContent.hero,
    about: partialContent.about || defaultSiteContent.about,
    experience: partialContent.experience || defaultSiteContent.experience,
    education: partialContent.education || defaultSiteContent.education,
    publications: partialContent.publications || defaultSiteContent.publications,
  }
}

/**
 * Validate section data
 * Returns true if the section has valid required fields
 */
export function validateSection(section: string, data: unknown): boolean {
  if (!data || typeof data !== "object") return false
  
  switch (section) {
    case "hero":
      const hero = data as Record<string, unknown>
      return !!(hero.name && hero.description)
    case "about":
      const about = data as Record<string, unknown>
      return !!(about.title && Array.isArray(about.paragraphs))
    case "experience":
    case "education":
    case "publications":
      const sectionData = data as Record<string, unknown>
      return !!(sectionData.title && Array.isArray(sectionData.items))
    case "profile":
      const profile = data as Record<string, unknown>
      return !!(profile.fullName && profile.email)
    case "footer":
      const footer = data as Record<string, unknown>
      return !!(footer.about && footer.quickLinks)
    case "metadata":
      const metadata = data as Record<string, unknown>
      return !!(metadata.siteName && metadata.pages)
    default:
      return true
  }
}
