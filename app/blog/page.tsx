import { Navigation} from "@/components/navigation"
import { Footer } from "@/components/footer-dynamic"
import { BlogListingHero } from "@/components/blog/blog-listing-hero"
import { BlogListingContent } from "@/components/blog/blog-listing-content"

import type { Metadata } from "next"

// Optimized metadata for blog listing page
export const metadata: Metadata = {
  title: "Academic Blog | Education Research & Teaching Insights UK | Ngozi Blessing Umoru (PhD)",
  description: "Explore expert insights on Academic English, EAP teaching methodologies, higher education pedagogy, and scholarly research from Ngozi Blessing Umoru (PhD)- Award-winning PhD researcher and Academic English Lecturer in the UK. Stay updated with evidence-based teaching practices and academic development strategies.",
  keywords: [
    // Primary blog keywords
    "academic blog uk",
    "education research blog",
    "eap teaching blog",
    "academic english insights",
    "higher education uk blog",
    // Teaching methodologies
    "pedagogy blog",
    "teaching strategies uk",
    "academic writing tips",
    "student-centred learning",
    "curriculum development insights",
    // Specific topics
    "esl teaching methods",
    "international student support",
    "foundation year teaching",
    "fe he education blog",
    // Author branding
    "ngozi umoru blog",
    "education phd insights"
  ].join(", "),
  authors: [{ name: "Ngozi Blessing Umoru (PhD)", url: "https://ngoziumoru.info" }],
  creator: "Ngozi Blessing Umoru (PhD)",
  publisher: "Ngozi Blessing Umoru (PhD)",
  alternates: {
    canonical: "https://ngoziumoru.info/blog",
  },
  openGraph: {
    title: "Academic Blog | Education Research & Teaching Insights UK",
    description: "Expert insights on Academic English, EAP teaching, higher education pedagogy, and scholarly research from an award-winning UK-based Academic English Lecturer and PhD researcher.",
    url: "https://ngoziumoru.info/blog",
    siteName: "Ngozi Blessing Umoru (PhD)- Academic Portfolio",
    type: "website",
    locale: "en_GB",
    images: [
      {
        url: "https://ngoziumoru.info/og-image-blog.jpg",
        width: 1200,
        height: 630,
        alt: "Academic Blog by Ngozi Blessing Umoru (PhD)",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Academic Blog | Education Research & Teaching Insights UK", 
    description: "Expert insights on Academic English, EAP teaching, and higher education pedagogy from Ngozi Blessing Umoru (PhD).",
    images: ["https://ngoziumoru.info/og-image-blog.jpg"],
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
