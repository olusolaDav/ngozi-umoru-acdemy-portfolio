import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { BlogDetailHero } from "@/components/blog/blog-detail-hero"
import { BlogDetailContent } from "@/components/blog/blog-detail-content"
import { BlogComments } from "@/components/blog/blog-comments"
import { RelatedBlogs } from "@/components/blog/related-blogs"
import { ArticleSchema, BreadcrumbListSchema } from "@/components/structured-data"

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
    title: `${post.title} | Ngozi Blessing Umoru (PhD)- Academic Blog UK`,
    description: post.excerpt || `Expert insights on ${post.title} from Ngozi Blessing Umoru (PhD), Award-winning Academic English Lecturer and PhD researcher in the UK. Read evidence-based teaching strategies and scholarly research.`,
    keywords: post.tags || ["academic english", "eap teaching", "higher education uk", "pedagogy research", "teaching methodologies"],
    authors: [{ name: post.authorName || "Ngozi Blessing Umoru (PhD)", url: "https://ngoziumoru.info" }],
    creator: post.authorName || "Ngozi Blessing Umoru (PhD)",
    publisher: "Ngozi Blessing Umoru (PhD)",
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
      siteName: "Ngozi Blessing Umoru (PhD)- Academic Portfolio",
      title: post.title,
      description: post.excerpt || `Expert insights on ${post.title} from an award-winning UK-based Academic English Lecturer and PhD researcher.`,
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
      authors: [post.authorName || "Ngozi Blessing Umoru (PhD)"],
      tags: post.tags || [],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt || `Expert insights on ${post.title} from Ngozi Blessing Umoru (PhD).`,
      images: [thumbnailUrl],
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
      {/* Structured Data for SEO */}
      <ArticleSchema
        headline={formattedPost.title}
        description={formattedPost.excerpt}
        url={`${siteUrl}/blog/${formattedPost.slug}`}
        imageUrl={formattedPost.thumbnail}
        datePublished={new Date(formattedPost.publishedAt || formattedPost.createdAt).toISOString()}
        dateModified={new Date(formattedPost.updatedAt || formattedPost.createdAt).toISOString()}
        authorName={formattedPost.author.name}
        authorUrl={siteUrl}
        tags={formattedPost.tags}
      />
      <BreadcrumbListSchema
        items={[
          { name: "Home", url: siteUrl },
          { name: "Blog", url: `${siteUrl}/blog` },
          { name: formattedPost.title, url: `${siteUrl}/blog/${formattedPost.slug}` },
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
