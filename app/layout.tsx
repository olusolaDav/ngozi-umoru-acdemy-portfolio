import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { Toaster } from "sonner"
import "./globals.css"
import { AuthProvider } from "@/lib/hooks/use-auth"
import { getSiteMetadata, generateMetadata as buildSiteMetadata, generateStructuredData, defaultMetadataFallback } from "@/lib/metadata-service"
import { GoogleAnalytics } from "@/components/analytics"
import { getSiteUrl } from "@/lib/seo"

// Force dynamic rendering for the entire app since we fetch site metadata
export const dynamic = 'force-dynamic'

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export async function generateMetadata(): Promise<Metadata> {
  const siteMetadata = await getSiteMetadata()
  const generated = siteMetadata ? buildSiteMetadata(siteMetadata) : defaultMetadataFallback

  return {
    ...generated,
    metadataBase: new URL(getSiteUrl()),
  }
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  // Get structured data for JSON-LD
  const siteMetadata = await getSiteMetadata()
  const structuredData = siteMetadata
    ? generateStructuredData({ ...siteMetadata, siteUrl: getSiteUrl() })
    : null

  return (
    <html lang="en-GB">
      <head>
        {/* Structured Data */}
        {structuredData && (
          <>
            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData.person) }}
            />
            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData.website) }}
            />
          </>
        )}
      </head>
      <body className={`font-sans antialiased`}>
        {/* Google Analytics */}
        {process.env.NEXT_PUBLIC_GA_ID && (
          <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID} />
        )}
        
        <AuthProvider>
          {children}
        </AuthProvider>
        <Toaster
          richColors
          position="top-right"
          closeButton
          theme="system"
        />
        <Analytics />
      </body>
    </html>
  )
}
