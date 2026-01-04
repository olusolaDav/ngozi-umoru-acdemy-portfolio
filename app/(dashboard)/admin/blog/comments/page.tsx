"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Search, FileText, MessageSquare, Plus, X, Loader2, Trash2 } from "lucide-react"
import { BlogCommentCard } from "@/components/dashboard/blog/blog-comment-card"
import { BulkActionBar } from "@/components/dashboard/blog/bulk-action-bar"
import { EmptyState } from "@/components/dashboard/blog/empty-state"
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
import { cn } from "@/lib/utils"

interface BlogComment {
  _id: string
  postId: string
  postSlug?: string
  postTitle: string
  author: {
    _id: string
    name: string
    avatar?: string
  }
  content: string
  status: "published" | "unpublished" | "pending"
  createdAt: string
  updatedAt: string
}

export default function AdminBlogCommentsPage() {
  const router = useRouter()
  const [search, setSearch] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [comments, setComments] = useState<BlogComment[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [selectMode, setSelectMode] = useState(false)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [commentToDelete, setCommentToDelete] = useState<string | null>(null)
  const [isBulkDelete, setIsBulkDelete] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const itemsPerPage = 6

  const fetchComments = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch("/api/admin/blog/comments")
      const data = await res.json()
      if (data.ok && data.comments) {
        setComments(data.comments.map((c: any) => ({
          ...c,
          postTitle: c.postTitle || "Unknown Post",
          author: {
            _id: c.authorId || "anonymous",
            name: c.authorName || "Anonymous",
            avatar: c.authorAvatar || "/placeholder-user.jpg",
          },
        })))
      }
    } catch (error) {
      console.error("Error fetching comments:", error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchComments()
  }, [fetchComments])

  const filteredComments = useMemo(() => {
    if (!search) return comments
    const searchLower = search.toLowerCase()
    return comments.filter(
      (c) =>
        c.author.name.toLowerCase().includes(searchLower) ||
        c.postTitle.toLowerCase().includes(searchLower) ||
        c.content.toLowerCase().includes(searchLower),
    )
  }, [comments, search])

  const totalPages = Math.ceil(filteredComments.length / itemsPerPage)
  const paginatedComments = filteredComments.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(paginatedComments.map((c) => c._id))
    } else {
      setSelectedIds([])
    }
  }

  const handleSelect = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds((prev) => [...prev, id])
      setSelectMode(true)
    } else {
      setSelectedIds((prev) => prev.filter((i) => i !== id))
    }
  }

  const handlePublish = async (id: string) => {
    try {
      const res = await fetch("/api/admin/blog/comments", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action: "publish" }),
      })
      if (res.ok) {
        fetchComments()
      }
    } catch (error) {
      console.error("Error publishing comment:", error)
    }
  }

  const handleUnpublish = async (id: string) => {
    try {
      const res = await fetch("/api/admin/blog/comments", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action: "unpublish" }),
      })
      if (res.ok) {
        fetchComments()
      }
    } catch (error) {
      console.error("Error unpublishing comment:", error)
    }
  }

  const handleDelete = async (id: string) => {
    setCommentToDelete(id)
    setIsBulkDelete(false)
    setDeleteConfirmOpen(true)
  }

  const handleDeleteAll = async () => {
    setIsBulkDelete(true)
    setDeleteConfirmOpen(true)
  }

  const confirmDelete = async () => {
    setIsDeleting(true)
    try {
      if (isBulkDelete) {
        // Bulk delete
        const res = await fetch("/api/admin/blog/comments", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ids: selectedIds, action: "delete-bulk" }),
        })
        if (res.ok) {
          setSelectedIds([])
          setSelectMode(false)
          setDeleteConfirmOpen(false)
          fetchComments()
        }
      } else if (commentToDelete) {
        // Single delete
        const res = await fetch("/api/admin/blog/comments", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: commentToDelete, action: "delete" }),
        })
        if (res.ok) {
          setSelectedIds((prev) => prev.filter((i) => i !== commentToDelete))
          setDeleteConfirmOpen(false)
          setCommentToDelete(null)
          fetchComments()
        }
      }
    } catch (error) {
      console.error("Error deleting comment:", error)
    } finally {
      setIsDeleting(false)
    }
  }

  const handleClearSelection = () => {
    setSelectedIds([])
    setSelectMode(false)
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold">Blog Comments</h1>
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by name"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-64 pl-9"
            />
          </div>
          <Button variant="outline" onClick={() => router.push("/admin/blog")} className="gap-2">
            <FileText className="h-4 w-4" />
            Posts
          </Button>
          <Button variant="outline" className="gap-2 bg-transparent">
            <MessageSquare className="h-4 w-4" />
            Comments
          </Button>
          <Button
            onClick={() => router.push("/admin/blog/new")}
            className="gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:from-cyan-600 hover:to-blue-700"
          >
            <Plus className="h-4 w-4" />
            New Post
          </Button>
        </div>
      </div>

      {comments.length === 0 ? (
        <EmptyState
          icon="comments"
          title="There are no comments here yet."
          description="When your audience makes a comment, you will see them here."
        />
      ) : (
        <>
          <div className="flex items-center justify-between border-b border-border pb-4">
            <div className="flex items-center gap-3">
              <Checkbox
                checked={selectedIds.length === paginatedComments.length && paginatedComments.length > 0}
                onCheckedChange={handleSelectAll}
                className={cn(
                  "h-5 w-5 rounded border-2",
                  selectedIds.length > 0
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-muted-foreground/30",
                )}
              />
              <span className="text-sm font-medium">Select All</span>
            </div>
            {selectMode && (
              <button onClick={handleClearSelection} className="text-muted-foreground hover:text-foreground">
                <X className="h-5 w-5" />
              </button>
            )}
          </div>

          <div>
            {paginatedComments.map((comment) => (
              <BlogCommentCard
                key={comment._id}
                comment={comment}
                isSelected={selectedIds.includes(comment._id)}
                onSelect={(checked) => handleSelect(comment._id, checked)}
                showCheckbox={selectMode || selectedIds.length > 0}
                onPublish={() => handlePublish(comment._id)}
                onUnpublish={() => handleUnpublish(comment._id)}
                onDelete={() => handleDelete(comment._id)}
              />
            ))}
          </div>

          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Showing {paginatedComments.length} comment(s) of {filteredComments.length}
            </p>
            {totalPages > 1 && (
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  Back
                </Button>
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((page) => (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setCurrentPage(page)}
                    className={cn("h-8 w-8 p-0", currentPage === page && "bg-primary text-primary-foreground")}
                  >
                    {page}
                  </Button>
                ))}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            )}
          </div>
        </>
      )}

      <BulkActionBar
        selectedCount={selectedIds.length}
        onClearSelection={handleClearSelection}
        onDeleteAll={handleDeleteAll}
        itemType="comment"
      />

      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Comment{isBulkDelete && 's'}</AlertDialogTitle>
            <AlertDialogDescription>
              {isBulkDelete 
                ? `Are you sure you want to delete ${selectedIds.length} comment(s)? This action cannot be undone.`
                : "Are you sure you want to delete this comment? This action cannot be undone."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
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
