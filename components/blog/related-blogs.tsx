"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { Clock, Calendar, ArrowRight } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { ScrollAnimation } from "@/components/ui/scroll-animation"

interface RelatedPost {
  _id: string
  title: string
  slug: string
  excerpt: string
  thumbnail: string
  tags: string[]
  readTime: number
  publishedAt?: string
  createdAt: string
}

interface RelatedBlogsProps {
  currentPostId: string
  currentPostTags: string[]
}

function formatBlogDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

export function RelatedBlogs({ currentPostId, currentPostTags }: RelatedBlogsProps) {
  const [relatedPosts, setRelatedPosts] = useState<RelatedPost[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchRelatedPosts() {
      try {
        // Fetch all published posts
        const res = await fetch("/api/blog?limit=20")
        const data = await res.json()
        
        if (data.ok && data.posts) {
          // Filter and sort by relevance (matching tags)
          const posts = data.posts
            .filter((post: any) => post._id !== currentPostId)
            .map((post: any) => ({
              ...post,
              matchingTags: post.tags?.filter((tag: string) => 
                currentPostTags.some(t => t.toLowerCase() === tag.toLowerCase())
              ).length || 0
            }))
            .sort((a: any, b: any) => b.matchingTags - a.matchingTags)
            .slice(0, 3) // Get top 3 related posts

          setRelatedPosts(posts)
        }
      } catch (error) {
        console.error("Error fetching related posts:", error)
      } finally {
        setIsLoading(false)
      }
    }

    if (currentPostTags.length > 0) {
      fetchRelatedPosts()
    } else {
      setIsLoading(false)
    }
  }, [currentPostId, currentPostTags])

  if (isLoading) {
    return (
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="mb-8">
              <Skeleton className="h-8 w-64 mb-2" />
              <Skeleton className="h-5 w-96" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="overflow-hidden">
                  <Skeleton className="h-48 w-full" />
                  <CardContent className="p-5">
                    <Skeleton className="h-4 w-20 mb-3" />
                    <Skeleton className="h-6 w-full mb-2" />
                    <Skeleton className="h-4 w-full mb-4" />
                    <Skeleton className="h-4 w-32" />
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
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <ScrollAnimation>
            <div className="mb-10">
              <div className="inline-block px-3 py-1 bg-background border border-border text-sm font-medium rounded-full mb-4">
                RELATED ARTICLES
              </div>
              <h2 className="text-2xl md:text-3xl font-bold mb-2">
                You Might Also <span className="text-primary">Like</span>
              </h2>
              <p className="text-muted-foreground">
                More articles on similar topics you might be interested in
              </p>
            </div>
          </ScrollAnimation>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {relatedPosts.map((post, index) => (
              <ScrollAnimation key={post._id} delay={index * 0.1}>
                <Link href={`/blog/${post.slug}`}>
                  <Card className="group overflow-hidden h-full hover:shadow-xl transition-all duration-300 border-border/50 hover:border-primary/30">
                    {/* Thumbnail */}
                    <div className="relative h-48 overflow-hidden bg-muted">
                      <Image
                        src={post.thumbnail || "/data-protection-cybersecurity-cloud.jpg"}
                        alt={post.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                      
                      {/* Tags overlay */}
                      {post.tags && post.tags.length > 0 && (
                        <div className="absolute bottom-3 left-3 flex gap-2">
                          {post.tags.slice(0, 2).map((tag) => (
                            <span
                              key={tag}
                              className="px-2 py-1 text-xs font-medium rounded-full bg-white/90 text-gray-800 backdrop-blur-sm"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <CardContent className="p-5">
                      {/* Title */}
                      <h3 className="font-semibold text-lg mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                        {post.title}
                      </h3>

                      {/* Excerpt */}
                      {post.excerpt && (
                        <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                          {post.excerpt}
                        </p>
                      )}

                      {/* Meta info */}
                      <div className="flex items-center justify-between text-xs text-muted-foreground pt-4 border-t">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          {formatBlogDate(post.publishedAt || post.createdAt)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          {post.readTime || 5} min read
                        </span>
                      </div>

                      {/* Read more indicator */}
                      <div className="mt-4 flex items-center text-primary text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                        Read Article
                        <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </ScrollAnimation>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
