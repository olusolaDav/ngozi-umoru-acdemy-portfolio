import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { BlogDetailHero } from "@/components/blog/blog-detail-hero"
import { BlogDetailContent } from "@/components/blog/blog-detail-content"
import { BlogComments } from "@/components/blog/blog-comments"
import { RelatedBlogs } from "@/components/blog/related-blogs"
import { ArticleSchema, BreadcrumbListSchema } from "@/components/structured-data"

import { getBlogBySlug, listPublishedCommentsByPost, type BlogRecord } from "@/lib/blog"
import { absoluteSiteUrl, getSiteUrl, socialImageMetadata } from "@/lib/seo"
import { notFound } from "next/navigation"
import type { Metadata } from "next"

const siteUrl = getSiteUrl()

function safeIsoDate(value?: string) {
  const date = value ? new Date(value) : new Date()
  return Number.isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString()
}

interface BlogDetailPageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: BlogDetailPageProps): Promise<Metadata> {
  const { slug } = await params
  const post = await getBlogBySlug(slug) as BlogRecord | null

  if (!post) {
    return { 
      title: "Post Not Found | Dr. Ngozi Blessing Umoru Blog",
      description: "The requested blog post could not be found.",
    }
  }

  const postUrl = absoluteSiteUrl(`/blog/${encodeURIComponent(post.slug)}`)
  const socialImage = socialImageMetadata(post.thumbnail, post.title)
  const publishedTime = safeIsoDate(post.publishedAt || post.createdAt)
  const modifiedTime = safeIsoDate(post.updatedAt || post.createdAt)

  return {
    title: `${post.title} | Dr. Ngozi Blessing Umoru`,
    description: post.excerpt || `Expert insights on ${post.title} from Dr. Ngozi Blessing Umoru, Award-winning Academic English Lecturer and PhD researcher in the UK. Read evidence-based teaching strategies and scholarly research.`,
    keywords: post.tags || ["academic english", "eap teaching", "higher education uk", "pedagogy research", "teaching methodologies"],
    authors: [{ name: post.authorName || "Dr. Ngozi Blessing Umoru", url: "https://ngoziumoru.info" }],
    creator: post.authorName || "Dr. Ngozi Blessing Umoru",
    publisher: "Dr. Ngozi Blessing Umoru",
    alternates: {
      canonical: postUrl,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    openGraph: {
      type: "article",
      locale: "en_GB",
      url: postUrl,
      siteName: "Dr. Ngozi Blessing Umoru - Academic Portfolio",
      title: post.title,
      description: post.excerpt || `Expert insights on ${post.title} from an award-winning UK-based Academic English Lecturer and PhD researcher.`,
      images: [socialImage],
      publishedTime,
      modifiedTime,
      authors: [post.authorName || "Dr. Ngozi Blessing Umoru"],
      tags: post.tags || [],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt || `Expert insights on ${post.title} from Dr. Ngozi Blessing Umoru.`,
      images: [socialImage.url],
    },
    other: {
      "article:published_time": publishedTime,
      "article:modified_time": modifiedTime,
      "article:author": post.authorName || "Academic Portfolio",
      "article:section": post.tags?.[0] || "General",
    },
  }
}

export default async function BlogDetailPage({ params }: BlogDetailPageProps) {
  const { slug } = await params
  const post = await getBlogBySlug(slug) as BlogRecord | null

  if (!post) {
    notFound()
  }

  const commentsData = await listPublishedCommentsByPost(post._id as string)
  
  const formattedPost = {
    _id: post._id as string,
    title: post.title,
    slug: post.slug,
    content: post.content,
    excerpt: post.excerpt || "",
    thumbnail: post.thumbnail || "/data-protection-cybersecurity-cloud.jpg",
    author: {
      _id: post.authorId || "admin",
      name: post.authorName || "Admin",
      avatar: post.authorAvatar || "/professional-man-avatar.png",
    },
    status: post.status as "published" | "draft" | "scheduled",
    tags: post.tags || [],
    views: post.views || 0,
    commentsCount: post.commentsCount || 0,
    likes: post.likes || 0,
    shares: post.shares || 0,
    readTime: post.readTime || 5,
    createdAt: post.createdAt,
    publishedAt: post.publishedAt,
    updatedAt: post.updatedAt,
  }

  const postUrl = absoluteSiteUrl(`/blog/${encodeURIComponent(formattedPost.slug)}`)
  const articleImage = socialImageMetadata(post.thumbnail, formattedPost.title).url

  const formattedComments = commentsData.map((c: any) => ({
    _id: c._id,
    postId: c.postId,
    postTitle: c.postTitle || post.title,
    author: {
      _id: c.authorId || "anonymous",
      name: c.authorName || "Anonymous",
      avatar: c.authorAvatar || "/placeholder-user.jpg",
    },
    content: c.content,
    status: c.status as "published" | "unpublished" | "pending",
    likes: c.likes || 0,
    createdAt: c.createdAt,
    updatedAt: c.updatedAt,
  }))

  return (
    <main className="min-h-screen  mx-auto bg-background">
      {/* Structured Data for SEO */}
      <ArticleSchema
        headline={formattedPost.title}
        description={formattedPost.excerpt}
        url={postUrl}
        imageUrl={articleImage}
        datePublished={safeIsoDate(formattedPost.publishedAt || formattedPost.createdAt)}
        dateModified={safeIsoDate(formattedPost.updatedAt || formattedPost.createdAt)}
        authorName={formattedPost.author.name}
        authorUrl={siteUrl}
        tags={formattedPost.tags}
      />
      <BreadcrumbListSchema
        items={[
          { name: "Home", url: siteUrl },
          { name: "Blog", url: absoluteSiteUrl("/blog") },
          { name: formattedPost.title, url: postUrl },
        ]}
      />
      
      <Navigation />
      <BlogDetailHero post={formattedPost} />
      <BlogDetailContent post={formattedPost} />
      <BlogComments comments={formattedComments} postId={post._id as string} postSlug={post.slug} />
      <RelatedBlogs currentPostId={post._id as string} currentPostTags={post.tags || []} />
      <Footer />
    </main>
  )
}
