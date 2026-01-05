// ============================================================================
// Site Data Types
// Comprehensive TypeScript types for site content management
// Optimized for UK academic portfolio and recruitment visibility
// ============================================================================

// =========================
// Social Media Types
// =========================
export interface SocialLink {
  id: string
  platform: "linkedin" | "facebook" | "twitter" | "instagram" | "researchgate" | "googlescholar" | "orcid" | "github" | "youtube" | "tiktok" | "whatsapp" | "telegram" | "pinterest" | "threads" | "other"
  url: string
  label: string
  icon: string // Lucide icon name
  enabled: boolean
}

// =========================
// Profile Types
// =========================
export interface SiteProfile {
  // Core identity
  fullName: string
  displayName: string
  credentials: string // e.g., "B.Ed, MA, MA Edu, PhD"
  title: string // e.g., "Academic English Tutor & Lecturer"
  
  // Contact
  email: string
  phone?: string
  location: string // e.g., "United Kingdom"
  
  // Professional
  institution?: string
  department?: string
  orcidId?: string
  
  // Biography
  shortBio: string // Brief tagline/bio
  
  // Images
  profileImage: string
  coverImage?: string
  
  // Social links
  socialLinks: SocialLink[]
}

// =========================
// SEO Metadata Types
// =========================
export interface PageMetadata {
  title: string
  description: string
  keywords: string[]
  ogTitle?: string
  ogDescription?: string
  ogImage?: string
  canonicalUrl?: string
  structuredData?: Record<string, unknown>
}

export interface SiteMetadata {
  siteName: string
  siteDescription: string
  siteUrl: string
  locale: string
  twitterHandle?: string
  
  // Page-specific metadata
  pages: {
    home: PageMetadata
    blog: PageMetadata
    contact: PageMetadata
    resources: PageMetadata
  }
  
  // Schema.org structured data for academics
  schemaOrg: {
    type: "Person"
    name: string
    jobTitle: string
    worksFor?: {
      type: "Organization"
      name: string
    }
    alumniOf: {
      type: "EducationalOrganization"
      name: string
    }[]
    sameAs: string[] // Social profile URLs
  }
}

// =========================
// Footer Types
// =========================
export interface FooterLink {
  label: string
  href: string
  external?: boolean
}

export interface FooterSection {
  title: string
  links: FooterLink[]
}

export interface FooterContent {
  // About column
  about: {
    name: string
    description: string
    profileImage?: string
  }
  
  // Quick links
  quickLinks: FooterSection
  
  // Research links
  researchLinks: FooterSection
  
  // Social media
  socialLinks: SocialLink[]
  
  // Contact info
  contact: {
    email: string
    phone?: string
    location?: string
  }
  
  // Copyright
  copyright: {
    text: string
    year: number
  }
}

// =========================
// Home Page Section Types
// =========================
export interface HeroSection {
  badge: string
  name: string
  credentials: string
  description: string
  profileImage: string
  ctaButtons?: {
    primary: { label: string; href: string }
    secondary: { label: string; href: string }
  }
}

export interface Highlight {
  icon: string
  title: string
  description: string
}

export interface AboutSection {
  section: string
  title: string
  paragraphs: string[]
  highlights: Highlight[]
}

export interface ExperienceItem {
  position: string
  institution: string
  period: string
  responsibilities: string[]
}

export interface ExperienceSection {
  section: string
  title: string
  items: ExperienceItem[]
}

export interface EducationItem {
  degree: string
  institution: string
  year: string
}

export interface EducationSection {
  section: string
  title: string
  items: EducationItem[]
}

export interface PublicationItem {
  type: string
  date: string
  citations?: string
  title: string
  authors: string
  journal: string
  url: string
}

export interface ProfileLink {
  label: string
  url: string
}

export interface PublicationsSection {
  section: string
  title: string
  profiles: ProfileLink[]
  items: PublicationItem[]
}

// =========================
// Complete Site Content Type
// =========================
export interface SiteContent {
  // Profile & Identity
  profile: SiteProfile
  
  // SEO & Metadata
  metadata: SiteMetadata
  
  // Footer
  footer: FooterContent
  
  // Home page sections
  hero: HeroSection
  about: AboutSection
  experience: ExperienceSection
  education: EducationSection
  publications: PublicationsSection
  
  // Timestamps
  updatedAt?: Date
  updatedBy?: string
}

// =========================
// Social Platform Config
// =========================
export const SOCIAL_PLATFORMS = [
  { id: "linkedin", label: "LinkedIn", icon: "Linkedin", placeholder: "https://linkedin.com/in/username" },
  { id: "facebook", label: "Facebook", icon: "Facebook", placeholder: "https://facebook.com/username" },
  { id: "twitter", label: "Twitter/X", icon: "Twitter", placeholder: "https://twitter.com/username" },
  { id: "instagram", label: "Instagram", icon: "Instagram", placeholder: "https://instagram.com/username" },
  { id: "youtube", label: "YouTube", icon: "Youtube", placeholder: "https://youtube.com/@channel" },
  { id: "tiktok", label: "TikTok", icon: "Music", placeholder: "https://tiktok.com/@username" },
  { id: "researchgate", label: "ResearchGate", icon: "FileText", placeholder: "https://researchgate.net/profile/..." },
  { id: "googlescholar", label: "Google Scholar", icon: "GraduationCap", placeholder: "https://scholar.google.com/citations?user=..." },
  { id: "orcid", label: "ORCID", icon: "CircleUser", placeholder: "https://orcid.org/0000-0000-0000-0000" },
  { id: "github", label: "GitHub", icon: "Github", placeholder: "https://github.com/username" },
  { id: "whatsapp", label: "WhatsApp", icon: "MessageCircle", placeholder: "https://wa.me/1234567890" },
  { id: "telegram", label: "Telegram", icon: "Send", placeholder: "https://t.me/username" },
  { id: "pinterest", label: "Pinterest", icon: "Pin", placeholder: "https://pinterest.com/username" },
  { id: "threads", label: "Threads", icon: "AtSign", placeholder: "https://threads.net/@username" },
  { id: "other", label: "Other", icon: "Link2", placeholder: "https://..." },
] as const

// =========================
// Icon Options for Highlights
// =========================
export const HIGHLIGHT_ICONS = [
  { value: "BookOpen", label: "Book Open" },
  { value: "GraduationCap", label: "Graduation Cap" },
  { value: "Award", label: "Award" },
  { value: "Briefcase", label: "Briefcase" },
  { value: "Globe", label: "Globe" },
  { value: "Lightbulb", label: "Lightbulb" },
  { value: "Target", label: "Target" },
  { value: "Users", label: "Users" },
  { value: "PenTool", label: "Pen Tool" },
  { value: "FileText", label: "File Text" },
] as const
