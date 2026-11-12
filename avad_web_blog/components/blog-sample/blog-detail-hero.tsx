"use client"

import { motion } from "framer-motion"
import { MessageSquare, Clock, Calendar, Eye } from "lucide-react"
import { ScrollAnimation } from "@/components/ui/scroll-animation"
import { cn } from "@/lib/utils"
import { BlogEngagementButtons } from "./blog-engagement-buttons"



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

interface BlogDetailHeroProps {
  post: BlogPost
}

function formatBlogDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })
}

export function BlogDetailHero({ post }: BlogDetailHeroProps) {
  const categoryColors: Record<string, string> = {
    Law: "bg-primary text-primary-foreground",
    Health: "bg-accent text-accent-foreground",
    Healthcare: "bg-accent text-accent-foreground",
    Education: "bg-accent text-accent-foreground",
    Technology: "bg-primary text-primary-foreground",
    Finance: "bg-primary text-primary-foreground",
    "Oil and Gas": "bg-orange-500 text-white",
    Telecommunications: "bg-blue-500 text-white",
    Retail: "bg-green-500 text-white",
    Manufacturing: "bg-indigo-500 text-white",
    Automotive: "bg-red-500 text-white",
    Pharmaceuticals: "bg-purple-500 text-white",
    Other: "bg-gray-500 text-white",
  }
  const primaryTag = post.tags[0] || "General"
  const tagColor = categoryColors[primaryTag] || "bg-primary text-primary-foreground"

  return (
    <section className="pt-32 pb-8 bg-background">
      <div className="container mx-auto px-4 md:px-6">
        <div className="max-w-4xl mx-auto text-center">
          <ScrollAnimation>
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/20 bg-primary/5 text-sm font-medium text-primary mb-6"
            >
              <MessageSquare className="w-4 h-4" />
              OUR BLOG
            </motion.span>
          </ScrollAnimation>

          <ScrollAnimation delay={0.1}>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6 text-balance leading-tight">
              {post.title}
            </h1>
          </ScrollAnimation>


          <ScrollAnimation delay={0.2}>
            <div className="flex flex-wrap items-center justify-center gap-4 text-sm">
              <span className={cn("px-4 py-1.5 rounded-full text-sm font-medium", tagColor)}>{primaryTag}</span>
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span>{post.readTime} Min</span>
              </div>
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Calendar className="w-4 h-4" />
                <span>{formatBlogDate(post.publishedAt || post.createdAt)}</span>
              </div>
              <BlogEngagementButtons
                postId={post._id}
                postSlug={post.slug}
                postTitle={post.title}
                initialLikes={post.likes}
                initialShares={post.shares}
                variant="header"
              />
              <div className="flex items-center gap-2 rounded-full border px-3 py-1">
                <Eye className="h-4 w-4" />
                <span>{post.views || 0}</span>
              </div>
            </div>
          </ScrollAnimation>
        </div>
      </div>
    </section>
  )
}
