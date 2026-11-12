"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { ScrollAnimation } from "@/components/ui/scroll-animation"
import { Calendar, Clock, ArrowRight } from "lucide-react"

interface RelatedPost {
  _id: string
  title: string
  slug: string
  excerpt: string
  thumbnail?: string
  publishedAt?: string
  createdAt: string
  readTime?: number
  tags?: string[]
}

interface RelatedPostsProps {
  currentPostId: string
  currentPostTags?: string[]
}

function formatBlogDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })
}

export function RelatedPosts({ currentPostId, currentPostTags = [] }: RelatedPostsProps) {
  const [relatedPosts, setRelatedPosts] = useState<RelatedPost[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchRelatedPosts() {
      try {
        const response = await fetch(`/api/blog/related?postId=${currentPostId}&tags=${currentPostTags.join(',')}`, {
          cache: 'no-store'
        })
        
        if (response.ok) {
          const posts = await response.json()
          setRelatedPosts(posts.slice(0, 3)) // Limit to 3 posts
        }
      } catch (error) {
        console.error('Error fetching related posts:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchRelatedPosts()
  }, [currentPostId, currentPostTags])

  if (isLoading) {
    return (
      <section className="py-12 bg-background border-t">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold mb-8">Related Articles</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse">
                  <div className="aspect-video bg-muted rounded-t-lg" />
                  <CardContent className="p-4">
                    <div className="h-4 bg-muted rounded mb-2" />
                    <div className="h-4 bg-muted rounded w-3/4 mb-3" />
                    <div className="h-3 bg-muted rounded w-1/2" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>
    )
  }

  if (relatedPosts.length === 0) {
    return null
  }

  return (
    <section className="py-12 bg-muted/20 border-t">
      <div className="container mx-auto px-4 md:px-6">
        <div className="max-w-4xl mx-auto">
          <ScrollAnimation>
            <h3 className="text-2xl font-bold mb-8 text-foreground">You Might Also Like</h3>
          </ScrollAnimation>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {relatedPosts.map((post, index) => (
              <ScrollAnimation key={post._id} delay={index * 0.1}>
                <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                  <div className="relative aspect-video overflow-hidden rounded-t-lg">
                    <Image
                      src={post.thumbnail || "/images/blog-placeholder.jpg"}
                      alt={post.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>{formatBlogDate(post.publishedAt || post.createdAt)}</span>
                      </div>
                      {post.readTime && (
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{post.readTime} min</span>
                        </div>
                      )}
                    </div>
                    
                    <Link href={`/blog/${post.slug}`} className="block group">
                      <h4 className="font-bold text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-2">
                        {post.title}
                      </h4>
                      <p className="text-sm text-muted-foreground line-clamp-3 mb-3">
                        {post.excerpt}
                      </p>
                      <div className="flex items-center text-primary text-sm font-medium group-hover:gap-2 transition-all">
                        Read More
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </Link>
                  </CardContent>
                </Card>
              </ScrollAnimation>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}