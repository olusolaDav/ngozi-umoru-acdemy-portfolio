"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import Link from "next/link"
import Image from "next/image"
import { Calendar, Clock, Eye } from "lucide-react"
import { formatDistanceToNow, format } from "date-fns"

interface BlogPost {
  _id: string
  title: string
  slug: string
  excerpt?: string
  thumbnail?: string
  author?: string
  views?: number
  readTime?: number
  createdAt: string
  publishedAt?: string
}

export function BlogPreviewSection() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await fetch("/api/blog?limit=3")
        const data = await res.json()
        if (data.ok && data.posts) {
          setPosts(data.posts)
        }
      } catch (error) {
        console.error("Error fetching blog posts:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchPosts()
  }, [])

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMM d, yyyy")
    } catch {
      return ""
    }
  }

  if (isLoading) {
    return (
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="flex items-center justify-between mb-12">
            <div>
              <div className="inline-block px-3 py-1 bg-background border border-border text-sm font-medium rounded-full mb-4">
                BLOG
              </div>
              <h2 className="text-3xl md:text-4xl font-bold">
                Check Our <span className="text-primary">Blog Posts</span>
              </h2>
            </div>
            <Link href="/blog">
              <Button size="lg" className="hidden md:inline-flex">
                View All
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="overflow-hidden">
                <Skeleton className="w-full h-48" />
                <CardContent className="pt-6">
                  <Skeleton className="h-6 w-full mb-2" />
                  <Skeleton className="h-4 w-3/4 mb-4" />
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    )
  }

  // If no posts, show a placeholder message
  if (posts.length === 0) {
    return (
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="flex items-center justify-between mb-12">
            <div>
              <div className="inline-block px-3 py-1 bg-background border border-border text-sm font-medium rounded-full mb-4">
                BLOG
              </div>
              <h2 className="text-3xl md:text-4xl font-bold">
                Check Our <span className="text-primary">Blog Posts</span>
              </h2>
            </div>
          </div>

          <div className="text-center py-16">
            <p className="text-muted-foreground text-lg mb-4">No blog posts published yet.</p>
            <p className="text-muted-foreground">Check back soon for new content!</p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-20 px-4 bg-muted/30">
      <div className="container mx-auto max-w-6xl">
        <div className="flex items-center justify-between mb-12">
          <div>
            <div className="inline-block px-3 py-1 bg-background border border-border text-sm font-medium rounded-full mb-4">
              BLOG
            </div>
            <h2 className="text-3xl md:text-4xl font-bold">
              Check Our <span className="text-primary">Blog Posts</span>
            </h2>
          </div>
          <Link href="/blog">
            <Button size="lg" className="hidden md:inline-flex">
              View All
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {posts.map((post) => (
            <Link key={post._id} href={`/blog/${post.slug}`}>
              <Card className="overflow-hidden hover:shadow-lg transition-shadow h-full group">
                <div className="relative w-full h-48 bg-muted">
                  {post.thumbnail ? (
                    <Image
                      src={post.thumbnail}
                      alt={post.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-muted">
                      <span className="text-muted-foreground text-sm">No image</span>
                    </div>
                  )}
                </div>
                <CardContent className="pt-6">
                  <h3 className="font-semibold text-lg mb-3 leading-tight line-clamp-2 group-hover:text-primary transition-colors">
                    {post.title}
                  </h3>
                  {post.excerpt && (
                    <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                      {post.excerpt}
                    </p>
                  )}
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>{formatDate(post.publishedAt || post.createdAt)}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      {post.readTime && (
                        <div className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          <span>{post.readTime} min</span>
                        </div>
                      )}
                      {post.views !== undefined && post.views > 0 && (
                        <div className="flex items-center gap-1">
                          <Eye className="h-3.5 w-3.5" />
                          <span>{post.views}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        <div className="text-center md:hidden">
          <Link href="/blog">
            <Button size="lg">View All</Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
