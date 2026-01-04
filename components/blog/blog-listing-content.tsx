"use client"

import { useState, useMemo, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { Clock, Calendar, Heart, Share2, ChevronLeft, ChevronRight, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { ScrollAnimation } from "@/components/ui/scroll-animation"

interface BlogPost {
  _id: string
  title: string
  slug: string
  content: string
  excerpt: string
  thumbnail: string
  author?: {
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

const categories = [
  { name: "Law", count: 0 },
  { name: "Health", count: 0 },
  { name: "Education", count: 0 },
  { name: "Technology", count: 0 },
  { name: "Finance", count: 0 },
  { name: "Oil and Gas", count: 0 },
  { name: "Healthcare", count: 0 },
  { name: "Telecommunications", count: 0 },
  { name: "Retail", count: 0 },
  { name: "Manufacturing", count: 0 },
  { name: "Automotive", count: 0 },
  { name: "Pharmaceuticals", count: 0 },
  { name: "Other", count: 0 },
]

const tags = ["Law", "Health", "Education", "Technology", "Finance", "Oil and Gas", "Healthcare", "Telecommunications", "Retail", "Manufacturing", "Automotive", "Pharmaceuticals", "Other"]

function formatBlogDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })
}

export function BlogListingContent() {
  const [search, setSearch] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const postsPerPage = 5

  useEffect(() => {
    async function fetchPosts() {
      try {
        const res = await fetch("/api/blog")
        const data = await res.json()
        if (data.ok && data.posts) {
          setPosts(data.posts.map((p: any) => ({
            _id: p._id || "",
            title: p.title || "Untitled",
            slug: p.slug || "",
            content: p.content || "",
            excerpt: p.excerpt || "",
            thumbnail: p.thumbnail || "/data-protection-cybersecurity-cloud.jpg",
            author: p.author || {
              _id: p.authorId || "admin",
              name: p.authorName || "Admin",
              avatar: p.authorAvatar || "/professional-man-avatar.png",
            },
            status: p.status || "draft",
            tags: p.tags || [],
            views: p.views || 0,
            commentsCount: p.commentsCount || 0,
            likes: p.likes || 0,
            shares: p.shares || 0,
            readTime: p.readTime || 5,
            createdAt: p.createdAt || new Date().toISOString(),
            publishedAt: p.publishedAt,
            updatedAt: p.updatedAt || new Date().toISOString(),
          })))
        }
      } catch (error) {
        console.error("Error fetching posts:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchPosts()
  }, [])

  const filteredPosts = useMemo(() => {
    let result = [...posts]

    if (search) {
      const searchLower = search.toLowerCase()
      result = result.filter(
        (p) => p.title.toLowerCase().includes(searchLower) || p.excerpt.toLowerCase().includes(searchLower),
      )
    }

    if (selectedCategory) {
      result = result.filter((p) => p.tags.some((tag) => tag.toLowerCase() === selectedCategory.toLowerCase()))
    }

    if (selectedTag) {
      result = result.filter((p) => p.tags.some((tag) => tag.toLowerCase() === selectedTag.toLowerCase()))
    }

    return result
  }, [posts, search, selectedCategory, selectedTag])

  // Calculate category counts dynamically based on published posts
  const calculatedCategories = useMemo(() => {
    const countMap: Record<string, number> = {}
    
    // Initialize all sector counts to 0
    tags.forEach(tag => {
      countMap[tag] = 0
    })
    
    // Count posts for each sector
    posts.forEach(post => {
      post.tags?.forEach(tag => {
        if (countMap.hasOwnProperty(tag)) {
          countMap[tag] += 1
        }
      })
    })

    // Return only sectors that have posts
    return categories
      .map(cat => ({ ...cat, count: countMap[cat.name] || 0 }))
      .filter(cat => cat.count > 0)
  }, [posts])

  const totalPages = Math.ceil(filteredPosts.length / postsPerPage)
  const paginatedPosts = filteredPosts.slice((currentPage - 1) * postsPerPage, currentPage * postsPerPage)

  const popularPosts = [...posts].sort((a, b) => b.views - a.views).slice(0, 3)

  if (loading) {
    return (
      <section className="py-8 bg-background">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-8 bg-background">
      <div className="container mx-auto px-4 lg:px-8">
        <ScrollAnimation className="mb-10 max-w-2xl mx-auto">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Input
                type="text"
                placeholder="Search for..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value)
                  setCurrentPage(1)
                }}
                className="pl-4 pr-4 py-6 rounded-full border-border bg-background"
              />
            </div>
            <Button className="px-8 py-6 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground">
              Search
            </Button>
          </div>
        </ScrollAnimation>

        <div className="grid lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-8">
            {paginatedPosts.length === 0 ? (
              <div className="flex h-64 flex-col items-center justify-center text-center">
                <p className="text-muted-foreground">No blog posts found.</p>
              </div>
            ) : (
              paginatedPosts.map((post, index) => (
                <ScrollAnimation key={post._id} delay={index * 0.1}>
                  <BlogPostCard post={post} />
                </ScrollAnimation>
              ))
            )}

            {totalPages > 1 && (
              <ScrollAnimation>
                <div className="flex items-center justify-start gap-2 pt-8">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="w-10 h-10 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  {Array.from({ length: Math.min(totalPages, 3) }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center font-medium transition-colors",
                        currentPage === page
                          ? "bg-primary text-primary-foreground"
                          : "border border-border text-muted-foreground hover:text-foreground hover:border-primary",
                      )}
                    >
                      {page}
                    </button>
                  ))}

                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="w-10 h-10 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </ScrollAnimation>
            )}
          </div>

          <div className="space-y-8">
            <ScrollAnimation>
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-foreground">Popular Posts</h3>
                <div className="space-y-4">
                  {popularPosts.map((post) => (
                    <PopularPostCard key={post._id} post={post} />
                  ))}
                </div>
              </div>
            </ScrollAnimation>

            <ScrollAnimation delay={0.1}>
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-foreground">Categories</h3>
                <div className="space-y-3">
                  {calculatedCategories.length > 0 ? (
                    calculatedCategories.map((category) => (
                      <button
                        key={category.name}
                        onClick={() => {
                          setSelectedCategory(selectedCategory === category.name ? null : category.name)
                          setCurrentPage(1)
                        }}
                        className={cn(
                          "flex items-center justify-between w-full py-2 text-left transition-colors",
                          selectedCategory === category.name
                            ? "text-primary font-medium"
                            : "text-muted-foreground hover:text-foreground",
                        )}
                      >
                        <span>{category.name}</span>
                        <span className="text-muted-foreground">({String(category.count).padStart(2, "0")})</span>
                      </button>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">No categories available</p>
                  )}
                </div>
              </div>
            </ScrollAnimation>

            <ScrollAnimation delay={0.1}>
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-foreground">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => {
                        setSelectedTag(selectedTag === tag ? null : tag)
                        setCurrentPage(1)
                      }}
                      className={cn(
                        "px-4 py-2 rounded-full text-sm font-medium transition-colors",
                        selectedTag === tag
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground",
                      )}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            </ScrollAnimation>
          </div>
        </div>
      </div>
    </section>
  )
}

function BlogPostCard({ post }: { post: BlogPost }) {
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

  const primaryTag = post.tags?.[0] || "General"
  const tagColor = categoryColors[primaryTag] || "bg-primary text-primary-foreground"
  const postUrl = post.slug ? `/blog/${post.slug}` : "#"

  return (
    <motion.article
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="group"
    >
      <Link href={postUrl}>
        <div className="relative aspect-[16/10] rounded-2xl overflow-hidden mb-4 bg-gradient-to-br from-orange-100 to-pink-100">
          <Image
            src={post.thumbnail || "/data-protection-cybersecurity-cloud.jpg"}
            alt={post.title || "Blog post"}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
      </Link>

      <div className="flex flex-wrap items-center gap-3 mb-3 text-sm">
        <span className={cn("px-3 py-1 rounded-full text-xs font-medium", tagColor)}>{primaryTag}</span>
        <div className="flex items-center gap-1 text-muted-foreground">
          <Clock className="w-4 h-4" />
          <span>{post.readTime} Min</span>
        </div>
        <div className="flex items-center gap-1 text-muted-foreground">
          <Calendar className="w-4 h-4" />
          <span>{formatBlogDate(post.publishedAt || post.createdAt)}</span>
        </div>
        <div className="flex items-center gap-1 text-muted-foreground">
          <Heart className="w-4 h-4" />
          <span>{post.likes} Likes</span>
        </div>
        <div className="flex items-center gap-1 text-muted-foreground">
          <Share2 className="w-4 h-4" />
          <span>{post.shares} Shares</span>
        </div>
      </div>

      <Link href={postUrl}>
        <h2 className="text-xl font-bold text-foreground mb-3 line-clamp-2 group-hover:text-primary transition-colors">
          {post.title}
        </h2>
      </Link>

      <p className="text-muted-foreground mb-4 line-clamp-3 leading-relaxed">{post.excerpt}</p>

      <Link href={postUrl} className="text-primary font-medium hover:underline">
        Read More
      </Link>
    </motion.article>
  )
}

function PopularPostCard({ post }: { post: BlogPost }) {
  const postUrl = post.slug ? `/blog/${post.slug}` : "#"
  
  return (
    <Link href={postUrl} className="group flex gap-4">
      <div className="relative w-24 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-gradient-to-br from-orange-100 to-pink-100">
        <Image
          src={post.thumbnail || "/data-protection-cybersecurity-cloud.jpg"}
          alt={post.title || "Blog post"}
          fill
          className="object-cover"
        />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-foreground line-clamp-2 text-sm group-hover:text-primary transition-colors mb-1">
          {post.title}
        </h4>
        <p className="text-xs text-muted-foreground">{formatBlogDate(post.publishedAt || post.createdAt)}</p>
      </div>
    </Link>
  )
}
