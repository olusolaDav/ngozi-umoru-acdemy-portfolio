import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { BlogDetailHero } from "@/components/blog/blog-detail-hero"
import { BlogDetailContent } from "@/components/blog/blog-detail-content"
import { BlogComments } from "@/components/blog/blog-comments"
import { RelatedBlogs } from "@/components/blog/related-blogs"

import { getBlogBySlug, listPublishedCommentsByPost, incrementBlogViews, type BlogRecord } from "@/lib/blog"
import { notFound } from "next/navigation"
import type { Metadata } from "next"

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://ngoziumoru.info"

interface BlogDetailPageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: BlogDetailPageProps): Promise<Metadata> {
  const { slug } = await params
  const post = await getBlogBySlug(slug) as BlogRecord | null

  if (!post) {
    return { 
      title: "Post Not Found |Ngozi Umoru Blog",
      description: "The requested blog post could not be found.",
    }
  }

  const postUrl = `${siteUrl}/blog/${post.slug}`
  const thumbnailUrl = post.thumbnail?.startsWith('http') 
    ? post.thumbnail 
    : `${siteUrl}${post.thumbnail || '/images/blog-default-og.jpg'}`
  const publishedTime = post.publishedAt || post.createdAt
  const modifiedTime = post.updatedAt || post.createdAt

  return {
    title: `${post.title} | Ngozi Umori Blog`,
    description: post.excerpt || `Read about ${post.title} on Academic Portfolio Blog.`,
    keywords: post.tags || ["data protection", "compliance", "AI governance"],
    authors: [{ name: post.authorName || "Academic Portfolio" }],
    creator: post.authorName || "Academic Portfolio",
    publisher: "Academic Portfolio",
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
      locale: "en_US",
      url: postUrl,
      siteName: "Academic Portfolio",
      title: post.title,
      description: post.excerpt || `Read about ${post.title} on Academic Portfolio Blog.`,
      images: [
        {
          url: thumbnailUrl,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
      publishedTime: new Date(publishedTime).toISOString(),
      modifiedTime: new Date(modifiedTime).toISOString(),
      authors: [post.authorName || "Academic Portfolio"],
      tags: post.tags || [],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt || `Read about ${post.title} on Academic Portfolio Blog.`,
      images: [thumbnailUrl],
      creator: "@accuvice",
      site: "@accuvice",
    },
    alternates: {
      canonical: postUrl,
    },
    other: {
      "article:published_time": new Date(publishedTime).toISOString(),
      "article:modified_time": new Date(modifiedTime).toISOString(),
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

  await incrementBlogViews(post._id as string)

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
      <Navigation />
      <BlogDetailHero post={formattedPost} />
      <BlogDetailContent post={formattedPost} />
      <BlogComments comments={formattedComments} postId={post._id as string} postSlug={post.slug} />
      <RelatedBlogs currentPostId={post._id as string} currentPostTags={post.tags || []} />
      <Footer />
    </main>
  )
}
