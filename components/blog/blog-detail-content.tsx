"use client"

import { blogContentText, normalizeBlogHtmlForRender } from "@/lib/blog-content"

interface BlogPost {
  _id: string
  title: string
  slug: string
  content: string
  excerpt: string
  thumbnail: string
  author: {
    _id: string
    name: string
    avatar?: string
  }
  status: "published" | "draft" | "scheduled"
  tags: string[]
  views: number
  commentsCount: number
  likes: number
  shares: number
  readTime: number
  createdAt: string
  publishedAt?: string
  updatedAt: string
}

interface BlogDetailContentProps {
  post: BlogPost
}

export function BlogDetailContent({ post }: BlogDetailContentProps) {
  const content = normalizeBlogHtmlForRender(post.content)
  const hasContent = Boolean(blogContentText(content))

 
  return (
    <section className="py-8 bg-background">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="max-w-4xl mx-auto">
        

        

          {hasContent ? (
            <div className="blog-article-content" dangerouslySetInnerHTML={{ __html: content }} />
          ) : (
            <p className="rounded-xl border border-border bg-muted/30 p-5 text-muted-foreground">
              This article is being updated. Please check back soon.
            </p>
          )}
        </div>
      </div>
    </section>
  )
}
