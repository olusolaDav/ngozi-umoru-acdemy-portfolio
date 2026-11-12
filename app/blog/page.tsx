import { Navigation} from "@/components/navigation"
import { Footer } from "@/components/footer-dynamic"
import { BlogListingHero } from "@/components/blog/blog-listing-hero"
import { BlogListingContent } from "@/components/blog/blog-listing-content"
import { listPublishedBlogs } from "@/lib/blog"

import type { Metadata } from "next"

// Optimized metadata for blog listing page
export const metadata: Metadata = {
  title: "Academic Blog | Education Research & Teaching Insights UK | Dr. Ngozi Blessing Umoru",
  description: "Explore expert insights on Academic English, EAP teaching methodologies, higher education pedagogy, and scholarly research from Dr. Ngozi Blessing Umoru, Award-winning PhD researcher and Academic English Lecturer in the UK. Stay updated with evidence-based teaching practices and academic development strategies.",
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
  authors: [{ name: "Dr. Ngozi Blessing Umoru", url: "https://www.ngoziumoru.info" }],
  creator: "Dr. Ngozi Blessing Umoru",
  publisher: "Dr. Ngozi Blessing Umoru",
  alternates: {
    canonical: "https://www.ngoziumoru.info/blog",
  },
  openGraph: {
    title: "Academic Blog | Education Research & Teaching Insights UK",
    description: "Expert insights on Academic English, EAP teaching, higher education pedagogy, and scholarly research from an award-winning UK-based Academic English Lecturer and PhD researcher.",
    url: "https://www.ngoziumoru.info/blog",
    siteName: "Dr. Ngozi Blessing Umoru - Academic Portfolio",
    type: "website",
    locale: "en_GB",
    images: [
      {
          url: "/academic-portrait.png",
          width: 1024,
          height: 680,
        alt: "Academic Blog by Dr. Ngozi Blessing Umoru",
          type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Academic Blog | Education Research & Teaching Insights UK", 
    description: "Expert insights on Academic English, EAP teaching, and higher education pedagogy from Dr. Ngozi Blessing Umoru.",
    images: ["/academic-portrait.png"],
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

export default async function BlogPage() {
  const publishedPosts = await listPublishedBlogs(100)
  const posts = publishedPosts.map((post) => ({
    _id: String(post._id),
    title: post.title || "Untitled",
    slug: post.slug,
    content: post.content || "",
    excerpt: post.excerpt || "",
    thumbnail: post.thumbnail || "/academic-portrait.png",
    author: {
      _id: post.authorId || "admin",
      name: post.authorName || "Dr. Ngozi Blessing Umoru",
      avatar: post.authorAvatar,
    },
    status: post.status,
    tags: post.tags || [],
    views: post.views || 0,
    commentsCount: post.commentsCount || 0,
    likes: post.likes || 0,
    shares: post.shares || 0,
    readTime: post.readTime || 1,
    createdAt: post.createdAt,
    publishedAt: post.publishedAt,
    updatedAt: post.updatedAt,
  }))

  return (
    <main className="min-h-screen bg-background">
      <Navigation />
      <BlogListingHero />
      <BlogListingContent initialPosts={posts} />
      <Footer />
    </main>
  )
}
