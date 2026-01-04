"use client"

import Image from "next/image"
import { ScrollAnimation } from "@/components/ui/scroll-animation"
import { Heart, Share2, Eye } from "lucide-react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

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
 

 
  return (
    <section className="py-8 bg-background">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="max-w-4xl mx-auto">
        

        

          <ScrollAnimation delay={0.15}>
            <div 
              className="prose prose-lg max-w-full break-words dark:prose-invert"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
          </ScrollAnimation>
        </div>
      </div>
    </section>
  )
}
