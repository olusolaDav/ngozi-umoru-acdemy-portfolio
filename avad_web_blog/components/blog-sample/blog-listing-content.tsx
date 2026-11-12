"use client"

import { useState, useMemo, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { Clock, Calendar, Heart, Share2, ChevronLeft, ChevronRight, Loader2, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { ScrollAnimation } from "@/components/ui/scroll-animation"

// Decode HTML entities like &nbsp;, &amp;, etc.
function decodeHtmlEntities(text: string): string {
  if (!text) return ""
  // Handle common HTML entities
  return text
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&mdash;/g, '—')
    .replace(/&ndash;/g, '–')
    .replace(/&hellip;/g, '...')
    .replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(parseInt(dec)))
    .replace(/&#x([a-fA-F0-9]+);/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
}

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
  const [showAllCategories, setShowAllCategories] = useState(false)
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const postsPerPage = 5

  useEffect(() => {
    async function fetchPosts() {
      try {
        const res = await fetch("/api/blog")
        const data = await res.json()
        if (data.ok && data.posts) {
          setPosts(data.posts.map((p: any) => {
            // Determine if this is an admin post
            const isAdminPost = p.authorRole === "admin" || !p.authorId
            return {
              _id: p._id || "",
              title: p.title || "Untitled",
              slug: p.slug || "",
              content: p.content || "",
              excerpt: p.excerpt || "",
              thumbnail: p.thumbnail || "/data-protection-cybersecurity-cloud.jpg",
              author: p.author || {
                _id: p.authorId || "admin",
                name: isAdminPost ? "Alot Digital Agency" : (p.authorName || "Unknown"),
                avatar: p.authorAvatar || "/professional-man-avatar.png",
                role: isAdminPost ? "admin" : "blogger",
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
            }
          }))
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
  // This includes custom sectors that have been used in blog posts
  const calculatedCategories = useMemo(() => {
    const countMap: Record<string, number> = {}
    
    // Count posts for each sector/tag
    posts.forEach(post => {
      post.tags?.forEach(tag => {
        countMap[tag] = (countMap[tag] || 0) + 1
      })
    })

    // Convert to array and sort by count (descending)
    return Object.entries(countMap)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
  }, [posts])

  // Get all unique tags from posts (includes custom sectors)
  const allTags = useMemo(() => {
    const tagSet = new Set<string>()
    posts.forEach(post => {
      post.tags?.forEach(tag => tagSet.add(tag))
    })
    return Array.from(tagSet).sort()
  }, [posts])

  const totalPages = Math.ceil(filteredPosts.length / postsPerPage)
  const paginatedPosts = filteredPosts.slice((currentPage - 1) * postsPerPage, currentPage * postsPerPage)

  const popularPosts = [...posts].sort((a, b) => b.views - a.views).slice(0, 3)

  if (loading) {
    return (
      <section className="py-12 bg-background">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-12 bg-background">
      <div className="container mx-auto px-4 lg:px-8">
        <ScrollAnimation className="mb-12 max-w-3xl mx-auto">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Input
                type="text"
                placeholder="Search articles..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value)
                  setCurrentPage(1)
                }}
                className="pl-5 pr-4 py-6 rounded-full border-border bg-background shadow-sm"
              />
            </div>
            <Button className="px-8 py-6 rounded-full btn-gradient-primary font-semibold shadow-lg">
              Search
            </Button>
          </div>
        </ScrollAnimation>

        <div className="grid lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-10">
            {paginatedPosts.length === 0 ? (
              <div className="flex h-64 flex-col items-center justify-center text-center bg-muted/30 rounded-2xl">
                <p className="text-muted-foreground text-lg">No blog posts found.</p>
                <p className="text-sm text-muted-foreground mt-2">Try a different search term or category.</p>
              </div>
            ) : (
              <div className="space-y-10">
                {paginatedPosts.map((post, index) => (
                  <ScrollAnimation key={post._id} delay={index * 0.1}>
                    <BlogPostCard post={post} />
                  </ScrollAnimation>
                ))}
              </div>
            )}

            {totalPages > 1 && (
              <ScrollAnimation>
                <div className="flex items-center justify-center gap-2 pt-10">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="w-11 h-11 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary hover:bg-primary/5 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>

                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={cn(
                        "w-11 h-11 rounded-full flex items-center justify-center font-semibold transition-all",
                        currentPage === page
                          ? "bg-gradient-brand text-white shadow-lg"
                          : "border border-border text-muted-foreground hover:text-foreground hover:border-primary hover:bg-primary/5",
                      )}
                    >
                      {page}
                    </button>
                  ))}

                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="w-11 h-11 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary hover:bg-primary/5 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </ScrollAnimation>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-8 lg:sticky lg:top-24 lg:self-start">
            <ScrollAnimation>
              <div className="bg-muted/30 rounded-2xl p-6 space-y-5">
                <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
                  <span className="w-1 h-6 bg-primary rounded-full"></span>
                  Popular Posts
                </h3>
                <div className="space-y-4">
                  {popularPosts.length > 0 ? (
                    popularPosts.map((post) => (
                      <PopularPostCard key={post._id} post={post} />
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">No popular posts yet</p>
                  )}
                </div>
              </div>
            </ScrollAnimation>

            <ScrollAnimation delay={0.1}>
              <div className="bg-muted/30 rounded-2xl p-6 space-y-5">
                <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
                  <span className="w-1 h-6 bg-primary rounded-full"></span>
                  Categories
                </h3>
                <div className="space-y-2">
                  {calculatedCategories.length > 0 ? (
                    <>
                      {(showAllCategories ? calculatedCategories : calculatedCategories.slice(0, 6)).map((category) => (
                        <button
                          key={category.name}
                          onClick={() => {
                            setSelectedCategory(selectedCategory === category.name ? null : category.name)
                            setCurrentPage(1)
                          }}
                          className={cn(
                            "flex items-center justify-between w-full py-2.5 px-3 rounded-lg text-left transition-all",
                            selectedCategory === category.name
                              ? "bg-primary/10 text-primary font-semibold"
                              : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
                          )}
                        >
                          <span>{category.name}</span>
                          <span className={cn(
                            "text-xs font-medium px-2 py-0.5 rounded-full",
                            selectedCategory === category.name
                              ? "bg-primary text-white"
                              : "bg-muted text-muted-foreground"
                          )}>
                            {category.count}
                          </span>
                        </button>
                      ))}
                      {calculatedCategories.length > 6 && (
                        <button
                          onClick={() => setShowAllCategories((v) => !v)}
                          className="w-full text-center text-sm text-primary hover:underline pt-1 transition-colors"
                        >
                          {showAllCategories ? "Show less" : `+${calculatedCategories.length - 6} more`}
                        </button>
                      )}
                    </>
                  ) : (
                    <p className="text-sm text-muted-foreground">No categories available</p>
                  )}
                </div>
              </div>
            </ScrollAnimation>

            <ScrollAnimation delay={0.1}>
              <div className="bg-muted/30 rounded-2xl p-6 space-y-5">
                <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
                  <span className="w-1 h-6 bg-primary rounded-full"></span>
                  Tags
                </h3>
                <div className="flex flex-wrap gap-2">
                  {allTags.length > 0 ? (
                    allTags.map((tag) => (
                      <button
                        key={tag}
                        onClick={() => {
                          setSelectedTag(selectedTag === tag ? null : tag)
                          setCurrentPage(1)
                        }}
                        className={cn(
                          "px-4 py-2 rounded-full text-sm font-medium transition-all",
                          selectedTag === tag
                            ? "bg-gradient-brand text-white shadow-md"
                            : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground",
                        )}
                      >
                        {tag}
                      </button>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">No tags available</p>
                  )}
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
    Law: "bg-blue-600 text-white",
    Health: "bg-emerald-600 text-white",
    Healthcare: "bg-emerald-600 text-white",
    Education: "bg-violet-600 text-white",
    Technology: "bg-cyan-600 text-white",
    Finance: "bg-amber-600 text-white",
    "Oil and Gas": "bg-orange-600 text-white",
    Telecommunications: "bg-sky-600 text-white",
    Retail: "bg-pink-600 text-white",
    Manufacturing: "bg-slate-600 text-white",
    Automotive: "bg-red-600 text-white",
    Pharmaceuticals: "bg-purple-600 text-white",
    Other: "bg-gray-600 text-white",
  }

  const primaryTag = post.tags?.[0] || "General"
  const tagColor = categoryColors[primaryTag] || "bg-primary text-white"
  const postUrl = post.slug ? `/blog/${post.slug}` : "#"

  return (
    <motion.article
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="group bg-card rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-border/50"
    >
      <Link href={postUrl}>
        <div className="relative aspect-[16/9] overflow-hidden bg-muted">
          <Image
            src={post.thumbnail || "/data-protection-cybersecurity-cloud.jpg"}
            alt={post.title || "Blog post"}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </Link>

      <div className="p-6">
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <span className={cn("px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm", tagColor)}>{primaryTag}</span>
          <div className="flex items-center gap-1.5 text-muted-foreground text-sm">
            <Clock className="w-4 h-4" />
            <span>{post.readTime} min read</span>
          </div>
          <div className="flex items-center gap-1.5 text-muted-foreground text-sm">
            <Calendar className="w-4 h-4" />
            <span>{formatBlogDate(post.publishedAt || post.createdAt)}</span>
          </div>
        </div>

        <Link href={postUrl}>
          <h2 className="text-xl md:text-2xl font-bold text-foreground mb-3 line-clamp-2 group-hover:text-primary transition-colors">
            {post.title}
          </h2>
        </Link>

        <p className="text-muted-foreground mb-5 line-clamp-3 leading-relaxed">{decodeHtmlEntities(post.excerpt)}</p>

        <div className="flex items-center justify-between pt-4 border-t border-border/50">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Eye className="w-4 h-4" />
              <span>{post.views}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Heart className="w-4 h-4" />
              <span>{post.likes}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Share2 className="w-4 h-4" />
              <span>{post.shares}</span>
            </div>
          </div>
          <Link 
            href={postUrl} 
            className="inline-flex items-center gap-2 text-primary font-semibold hover:gap-3 transition-all"
          >
            Read More
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </motion.article>
  )
}

function PopularPostCard({ post }: { post: BlogPost }) {
  const postUrl = post.slug ? `/blog/${post.slug}` : "#"
  
  return (
    <Link href={postUrl} className="group flex gap-4 p-2 rounded-xl hover:bg-muted/50 transition-colors">
      <div className="relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-muted">
        <Image
          src={post.thumbnail || "/data-protection-cybersecurity-cloud.jpg"}
          alt={post.title || "Blog post"}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>
      <div className="flex-1 min-w-0 py-1">
        <h4 className="font-semibold text-foreground line-clamp-2 text-sm group-hover:text-primary transition-colors mb-1.5">
          {post.title}
        </h4>
        <p className="text-xs text-muted-foreground flex items-center gap-1">
          <Calendar className="w-3 h-3" />
          {formatBlogDate(post.publishedAt || post.createdAt)}
        </p>
      </div>
    </Link>
  )
}
