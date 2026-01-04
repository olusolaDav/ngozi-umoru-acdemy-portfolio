// ============================================================================
// Metadata Service
// Provides dynamic SEO metadata optimized for UK academic recruitment
// ============================================================================

import type { Metadata } from "next"
import type { SiteMetadata } from "./site-types"

// Fetch site metadata from API
export async function getSiteMetadata(): Promise<SiteMetadata | null> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:4000'}/api/admin/site`, {
      cache: 'no-store'
    })
    if (!res.ok) throw new Error('Failed to fetch metadata')
    const data = await res.json()
    return data.content?.metadata || null
  } catch (error) {
    console.error('Error fetching site metadata:', error)
    return null
  }
}

// Generate Next.js metadata from site metadata
export function generateMetadata(siteMetadata: SiteMetadata, page: keyof SiteMetadata["pages"] = "home"): Metadata {
  const pageData = siteMetadata.pages[page]
  
  return {
    title: pageData.title || siteMetadata.siteName,
    description: pageData.description || siteMetadata.siteDescription,
    keywords: pageData.keywords.join(", "),
    authors: [{ name: siteMetadata.schemaOrg.name }],
    creator: siteMetadata.schemaOrg.name,
    publisher: siteMetadata.schemaOrg.name,
    
    // Open Graph
    openGraph: {
      title: pageData.ogTitle || pageData.title,
      description: pageData.ogDescription || pageData.description,
      url: pageData.canonicalUrl || `${siteMetadata.siteUrl}`,
      siteName: siteMetadata.siteName,
      images: pageData.ogImage ? [
        {
          url: pageData.ogImage,
          width: 1200,
          height: 630,
          alt: siteMetadata.schemaOrg.name
        }
      ] : [],
      locale: siteMetadata.locale,
      type: "website",
    },
    
    // Twitter
    twitter: {
      card: "summary_large_image",
      title: pageData.ogTitle || pageData.title,
      description: pageData.ogDescription || pageData.description,
      creator: siteMetadata.twitterHandle,
      images: pageData.ogImage ? [pageData.ogImage] : [],
    },
    
    // Canonical URL
    alternates: {
      canonical: pageData.canonicalUrl || `${siteMetadata.siteUrl}`,
    },
    
    // Robots
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    
    // Verification (can be added later)
    verification: {
      google: undefined, // Add Google Search Console verification
      yandex: undefined,
      yahoo: undefined,
    },
    
    // Category for academic sites
    category: "Education",
  }
}

// Generate JSON-LD structured data for academics
export function generateStructuredData(siteMetadata: SiteMetadata) {
  const person = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: siteMetadata.schemaOrg.name,
    jobTitle: siteMetadata.schemaOrg.jobTitle,
    url: siteMetadata.siteUrl,
    sameAs: siteMetadata.schemaOrg.sameAs,
    alumniOf: siteMetadata.schemaOrg.alumniOf,
    worksFor: siteMetadata.schemaOrg.worksFor,
  }

  const website = {
    "@context": "https://schema.org",
    "@type": "Website",
    name: siteMetadata.siteName,
    description: siteMetadata.siteDescription,
    url: siteMetadata.siteUrl,
    author: {
      "@type": "Person",
      name: siteMetadata.schemaOrg.name,
    },
  }

  return {
    person,
    website,
  }
}

// Default metadata fallback
export const defaultMetadataFallback: Metadata = {
  title: "Dr. Ngozi Blessing Umoru | Academic Portfolio",
  description: "Dynamic and student-centred Lecturer and Academic English Tutor with extensive experience teaching Academic English, EAP/ESL, Humanities, and Foundation-level courses across UK FE/HE settings.",
  keywords: "academic english tutor uk, eap tutor, higher education lecturer, ngozi umoru",
  authors: [{ name: "Dr. Ngozi Blessing Umoru" }],
  creator: "Dr. Ngozi Blessing Umoru",
  publisher: "Dr. Ngozi Blessing Umoru",
  
  openGraph: {
    title: "Dr. Ngozi Blessing Umoru | Academic English Tutor & Lecturer",
    description: "PhD researcher and Academic English Tutor with extensive UK FE/HE teaching experience.",
    url: "https://ngoziumoru.com",
    siteName: "Dr. Ngozi Blessing Umoru | Academic Portfolio",
    locale: "en_GB",
    type: "website",
  },
  
  twitter: {
    card: "summary_large_image",
    title: "Dr. Ngozi Blessing Umoru | Academic English Tutor & Lecturer",
    description: "PhD researcher and Academic English Tutor with extensive UK FE/HE teaching experience.",
  },
  
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  
  category: "Education",
}