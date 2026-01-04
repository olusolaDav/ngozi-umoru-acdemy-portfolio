"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Search, 
  Plus, 
  Loader2, 
  Eye, 
  Edit3, 
  Trash2, 
  MessageSquare, 
  MoreVertical,
  FileText,
  TrendingUp,
  Clock
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { AdminDashboardHeader } from "@/components/dashboard/admin-dashboard-header"
import { cn } from "@/lib/utils"
import Image from "next/image"

interface BlogPost {
  _id: string
  title: string
  slug: string
  content: string
  excerpt: string
  thumbnail: string
  authorId?: string
  authorName?: string
  authorAvatar?: string
  status: "published" | "draft"
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

type BlogTab = "all" | "drafts" | "published"

export default function AdminBlogPage() {
  const router = useRouter()
  const [search, setSearch] = useState("")
  const [activeTab, setActiveTab] = useState<BlogTab>("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [postToDelete, setPostToDelete] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const itemsPerPage = 9

  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch("/api/admin/blog")
      const data = await res.json()
      if (data.ok && data.posts) {
        setPosts(data.posts.map((p: any) => ({
          _id: p._id || "",
          title: p.title || "Untitled",
          slug: p.slug || "",
          content: p.content || "",
          excerpt: p.excerpt || "",
          thumbnail: p.thumbnail || "/placeholder.svg",
          authorId: p.authorId || "admin",
          authorName: p.authorName || "Admin",
          authorAvatar: p.authorAvatar || "/professional-man-avatar.png",
          status: p.status === "published" ? "published" : "draft",
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
  }, [])

  useEffect(() => {
    fetchPosts()
  }, [fetchPosts])

  const filteredPosts = useMemo(() => {
    let result = [...posts]

    if (search) {
      const searchLower = search.toLowerCase()
      result = result.filter(
        (p) => p.title.toLowerCase().includes(searchLower) || p.excerpt?.toLowerCase().includes(searchLower),
      )
    }

    if (activeTab === "drafts") {
      result = result.filter((p) => p.status === "draft")
    } else if (activeTab === "published") {
      result = result.filter((p) => p.status === "published")
    }

    return result
  }, [posts, search, activeTab])

  const allCount = posts.length
  const draftsCount = posts.filter((p) => p.status === "draft").length
  const publishedCount = posts.filter((p) => p.status === "published").length

  const totalPages = Math.ceil(filteredPosts.length / itemsPerPage)
  const paginatedPosts = filteredPosts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })
  }

  const handleEdit = (post: BlogPost) => {
    router.push(`/admin/blog/edit/${post._id}`)
  }

  const handleView = (post: BlogPost) => {
    if (post.status === "published") {
      window.open(`/blog/${post.slug}`, "_blank")
    } else {
      router.push(`/admin/blog/preview/${post._id}`)
    }
  }

  const handlePublish = (post: BlogPost) => {
    router.push(`/admin/blog/publish/${post._id}`)
  }

  const handleUnpublish = async (postId: string) => {
    try {
      const res = await fetch(`/api/admin/blog/${postId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "unpublish" }),
      })
      if (res.ok) {
        fetchPosts()
      }
    } catch (error) {
      console.error("Error unpublishing post:", error)
    }
  }

  const handleDelete = async (postId: string) => {
    setPostToDelete(postId)
    setDeleteConfirmOpen(true)
  }

  const confirmDelete = async () => {
    if (!postToDelete) return
    
    setIsDeleting(true)
    try {
      const res = await fetch(`/api/admin/blog/${postToDelete}`, {
        method: "DELETE",
      })
      if (res.ok) {
        setDeleteConfirmOpen(false)
        setPostToDelete(null)
        fetchPosts()
      }
    } catch (error) {
      console.error("Error deleting post:", error)
    } finally {
      setIsDeleting(false)
    }
  }

  const statsCards = [
    {
      title: "Total Posts",
      value: allCount,
      icon: FileText,
      color: "bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400",
    },
    {
      title: "Published",
      value: publishedCount,
      icon: TrendingUp,
      color: "bg-green-50 dark:bg-green-950/30 text-green-600 dark:text-green-400",
    },
    {
      title: "Drafts",
      value: draftsCount,
      icon: Edit3,
      color: "bg-yellow-50 dark:bg-yellow-950/30 text-yellow-600 dark:text-yellow-400",
    },
    {
      title: "Total Views",
      value: posts.reduce((acc, p) => acc + p.views, 0),
      icon: Eye,
      color: "bg-purple-50 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400",
    },
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50/50 dark:bg-gray-950/50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-950/50">
      <AdminDashboardHeader
        title="Blog Management"
        description="Create, edit, and manage your blog posts"
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Blog" },
        ]}
        actions={
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              onClick={() => router.push("/admin/blog/comments")}
              className="gap-2"
            >
              <MessageSquare className="h-4 w-4" />
              Comments
            </Button>
            <Button
              onClick={() => router.push("/admin/blog/new")}
              className="gap-2 bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Plus className="h-4 w-4" />
              New Post
            </Button>
          </div>
        }
      />

      <div className="px-6 py-6 space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {statsCards.map((stat) => {
            const Icon = stat.icon
            return (
              <Card key={stat.title} className="border border-gray-200/50 dark:border-gray-700/50">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{stat.title}</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-gray-50 mt-1">{stat.value}</p>
                    </div>
                    <div className={`w-12 h-12 rounded-lg ${stat.color} flex items-center justify-center`}>
                      <Icon className="w-6 h-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-2 border-b border-gray-200 dark:border-gray-700">
            {[
              { key: "all", label: "All", count: allCount },
              { key: "published", label: "Published", count: publishedCount },
              { key: "drafts", label: "Drafts", count: draftsCount },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => {
                  setActiveTab(tab.key as BlogTab)
                  setCurrentPage(1)
                }}
                className={cn(
                  "px-4 py-2 text-sm font-medium border-b-2 transition-colors",
                  activeTab === tab.key
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400"
                )}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search posts..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-white dark:bg-gray-900"
            />
          </div>
        </div>

        {paginatedPosts.length === 0 ? (
          <Card className="border border-gray-200/50 dark:border-gray-700/50">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="w-16 h-16 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
                <FileText className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-50 mb-2">No posts found</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4 text-center max-w-sm">
                {search ? "Try a different search term" : "Create your first blog post to get started."}
              </p>
              {!search && (
                <Button
                  onClick={() => router.push("/admin/blog/new")}
                  className="gap-2 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Plus className="h-4 w-4" />
                  Create Post
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {paginatedPosts.map((post) => (
              <Card 
                key={post._id} 
                className="overflow-hidden border border-gray-200/50 dark:border-gray-700/50 hover:shadow-lg transition-all group"
              >
                <div className="relative h-48 overflow-hidden">
                  <Image
                    src={post.thumbnail || "/placeholder.svg"}
                    alt={post.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 left-3">
                    <Badge 
                      className={cn(
                        "text-xs font-medium",
                        post.status === "published" 
                          ? "bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-400"
                          : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-400"
                      )}
                    >
                      {post.status === "published" ? "Published" : "Draft"}
                    </Badge>
                  </div>
                  <div className="absolute top-3 right-3">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          className="h-8 w-8 bg-white/90 dark:bg-gray-900/90 hover:bg-white dark:hover:bg-gray-900"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEdit(post)}>
                          <Edit3 className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleView(post)}>
                          <Eye className="mr-2 h-4 w-4" />
                          {post.status === "published" ? "View" : "Preview"}
                        </DropdownMenuItem>
                        {post.status === "draft" ? (
                          <DropdownMenuItem onClick={() => handlePublish(post)}>
                            <TrendingUp className="mr-2 h-4 w-4" />
                            Publish
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem onClick={() => handleUnpublish(post._id)}>
                            <FileText className="mr-2 h-4 w-4" />
                            Unpublish
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => handleDelete(post._id)}
                          className="text-red-600 dark:text-red-400"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-50 mb-2 line-clamp-2">
                    {post.title}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-3">
                    {post.excerpt || "No description available"}
                  </p>
                  <div className="flex items-center justify-between text-xs text-gray-400 dark:text-gray-500">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <Eye className="h-3.5 w-3.5" />
                        {post.views}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageSquare className="h-3.5 w-3.5" />
                        {post.commentsCount}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {post.readTime}m
                      </span>
                    </div>
                    <span>{formatDate(post.createdAt)}</span>
                  </div>
                  {post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-3">
                      {post.tags.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Showing {paginatedPosts.length} of {filteredPosts.length} posts
            </p>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((page) => (
                <Button
                  key={page}
                  variant={currentPage === page ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentPage(page)}
                  className={cn(
                    "w-9",
                    currentPage === page && "bg-blue-600 hover:bg-blue-700"
                  )}
                >
                  {page}
                </Button>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Blog Post</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this blog post? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={isDeleting}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
