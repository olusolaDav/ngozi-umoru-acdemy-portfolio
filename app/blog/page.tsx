import { Navigation} from "@/components/navigation"
import { Footer } from "@/components/footer-dynamic"
import { BlogListingHero } from "@/components/blog/blog-listing-hero"
import { BlogListingContent } from "@/components/blog/blog-listing-content"

import type { Metadata } from "next"

// Static metadata for blog page
export const metadata: Metadata = {
  title: "Blog | Academic Insights & Education Research | Dr. Ngozi Blessing Umoru",
  description: "Explore academic insights, education research, teaching methodologies, and scholarly perspectives from Dr. Ngozi Blessing Umoru - PhD researcher and Academic English Tutor.",
  keywords: "academic blog, education research, teaching insights, eap teaching, academic writing, higher education, pedagogy research",
  authors: [{ name: "Dr. Ngozi Blessing Umoru" }],
  creator: "Dr. Ngozi Blessing Umoru",
  openGraph: {
    title: "Blog | Dr. Ngozi Blessing Umoru",
    description: "Academic insights, education research, and teaching perspectives from a PhD researcher and Academic English Tutor.",
    type: "website",
    locale: "en_GB",
  },
  twitter: {
    card: "summary_large_image",
    title: "Blog | Dr. Ngozi Blessing Umoru", 
    description: "Academic insights, education research, and teaching perspectives.",
  },
}

export default function BlogPage() {
  return (
    <main className="min-h-screen bg-background">
      <Navigation />
      <BlogListingHero />
      <BlogListingContent />
      <Footer />
    </main>
  )
}
