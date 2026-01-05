"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Mail, MailOpen, Reply, Trash2, Eye, RefreshCw } from "lucide-react"
import { AdminDashboardHeader } from "@/components/dashboard/admin-dashboard-header"
import { toast } from "sonner"
import { ContactViewModal } from "@/components/dashboard/contact-view-modal"
import { ReplyComposer } from "@/components/dashboard/reply-composer"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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

export type ContactSubmission = {
  _id: string
  fullName: string
  email: string
  purpose: string
  phone?: string
  message: string
  status: "unread" | "read" | "replied"
  submittedAt: string
  createdAt: string
  readAt?: string
  repliedAt?: string
}

interface ContactsResponse {
  submissions: ContactSubmission[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
  stats: {
    total: number
    unread: number
    read: number
    replied: number
  }
}

const purposeLabels: Record<string, string> = {
  "general": "General Inquiry",
  "collaboration": "Collaboration Opportunity",
  "research": "Research Query",
  "teaching": "Teaching Inquiry",
  "speaking": "Speaking Engagement",
}

const statusColors: Record<string, string> = {
  unread: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  read: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400",
  replied: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
}

const purposeColors: Record<string, string> = {
  "general": "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  "collaboration": "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  "research": "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400",
  "teaching": "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  "speaking": "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400",
}

export default function AdminContactsPage() {
  const [search, setSearch] = useState("")
  const [sort, setSort] = useState("newest")
  const [statusFilter, setStatusFilter] = useState("all")
  const [purposeFilter, setPurposeFilter] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [submissions, setSubmissions] = useState<ContactSubmission[]>([])
  const [pagination, setPagination] = useState({ page: 1, limit: 12, total: 0, pages: 0 })
  const [stats, setStats] = useState({ total: 0, unread: 0, read: 0, replied: 0 })
  const [loading, setLoading] = useState(true)
  const [selectedContact, setSelectedContact] = useState<ContactSubmission | null>(null)
  const [replyContact, setReplyContact] = useState<ContactSubmission | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; id: string | null; name: string }>({ open: false, id: null, name: "" })
  const itemsPerPage = 12

  // Fetch submissions from API
  const fetchSubmissions = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        search,
        status: statusFilter,
        purpose: purposeFilter,
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
        sort
      })

      const response = await fetch(`/api/admin/contacts?${params}`)
      if (!response.ok) throw new Error("Failed to fetch submissions")
      
      const data: ContactsResponse = await response.json()
      setSubmissions(data.submissions)
      setPagination(data.pagination)
      setStats(data.stats)
    } catch (error) {
      console.error("Error fetching submissions:", error)
      toast.error("Failed to load contact submissions")
    } finally {
      setLoading(false)
    }
  }

  // Fetch submissions on mount and when filters change
  useEffect(() => {
    fetchSubmissions()
  }, [search, sort, statusFilter, purposeFilter, currentPage])

  // Mark as read when viewing
  const handleViewContact = async (contact: ContactSubmission) => {
    setSelectedContact(contact)
    
    // Mark as read if unread
    if (contact.status === "unread") {
      try {
        const response = await fetch(`/api/admin/contacts/${contact._id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "read" }),
        })
        
        if (response.ok) {
          // Update local state
          setSubmissions(prev => 
            prev.map(s => s._id === contact._id ? { ...s, status: "read" } : s)
          )
          setStats(prev => ({
            ...prev,
            unread: Math.max(0, prev.unread - 1),
            read: prev.read + 1,
          }))
        }
      } catch (error) {
        console.error("Failed to mark as read:", error)
      }
    }
  }

  // Update status
  const handleUpdateStatus = async (id: string, status: "unread" | "read" | "replied") => {
    try {
      const response = await fetch(`/api/admin/contacts/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })

      if (!response.ok) throw new Error("Failed to update status")

      toast.success(`Marked as ${status}`)
      fetchSubmissions()
    } catch (error) {
      console.error("Error updating status:", error)
      toast.error("Failed to update status")
    }
  }

  // Delete submission
  const handleDeleteClick = (submission: ContactSubmission) => {
    setDeleteConfirm({ open: true, id: submission._id, name: submission.fullName })
  }

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm.id) return

    try {
      const response = await fetch(`/api/admin/contacts/${deleteConfirm.id}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Failed to delete")

      toast.success("Submission deleted successfully")
      fetchSubmissions()
    } catch (error) {
      console.error("Error deleting submission:", error)
      toast.error("Failed to delete submission")
    } finally {
      setDeleteConfirm({ open: false, id: null, name: "" })
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-950/50">
      {/* Header */}
      <AdminDashboardHeader
        title="Contact Submissions"
        description="Manage and respond to contact form submissions"
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Contacts" },
        ]}
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={fetchSubmissions}
            className="gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        }
      />

      <div className="px-6 py-8 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-900/50">
                <Mail className="h-5 w-5 text-slate-600 dark:text-slate-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-50">{stats.total}</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Total Messages</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-950/30">
                <Mail className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-50">{stats.unread}</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Unread</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800">
                <MailOpen className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-50">{stats.read}</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Read</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100 dark:bg-green-950/30">
                <Reply className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-50">{stats.replied}</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Replied</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search by name, email or message..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700"
            />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[140px] bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="unread">Unread</SelectItem>
            <SelectItem value="read">Read</SelectItem>
            <SelectItem value="replied">Replied</SelectItem>
          </SelectContent>
        </Select>
        <Select value={purposeFilter} onValueChange={setPurposeFilter}>
          <SelectTrigger className="w-[180px] bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
            <SelectValue placeholder="Purpose" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Purposes</SelectItem>
            <SelectItem value="general">General Inquiry</SelectItem>
            <SelectItem value="collaboration">Collaboration Opportunity</SelectItem>
            <SelectItem value="research">Research Query</SelectItem>
            <SelectItem value="teaching">Teaching Inquiry</SelectItem>
            <SelectItem value="speaking">Speaking Engagement</SelectItem>
          </SelectContent>
        </Select>
      </div>

        {/* Submissions List */}
        <div className="space-y-2">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Loading submissions...</p>
              </div>
            </div>
          ) : submissions.length === 0 ? (
            <div className="flex justify-center py-8">
              <div className="text-center">
                <Mail className="h-12 w-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">No submissions found</p>
              </div>
            </div>
          ) : (
            submissions.map((submission) => (
              <div
                key={submission._id}
                className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4 cursor-pointer hover:shadow-md transition-all"
                onClick={() => handleViewContact(submission)}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-gray-900 dark:text-gray-50 truncate">{submission.fullName}</h3>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[submission.status]}`}>
                        {submission.status}
                      </span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${purposeColors[submission.purpose]}`}>
                        {purposeLabels[submission.purpose] || submission.purpose}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 truncate">{submission.email}</p>
                    <p className="text-sm text-gray-700 dark:text-gray-300 mt-2 line-clamp-2">{submission.message}</p>
                  </div>
                  <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleViewContact(submission)}
                      title="View"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-950/30"
                      onClick={() => handleDeleteClick(submission)}
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Contact View Modal */}
      <ContactViewModal
        contact={selectedContact}
        onClose={() => setSelectedContact(null)}
        onUpdateStatus={handleUpdateStatus}
        onOpenReplyComposer={(contact) => {
          setSelectedContact(null)
          setReplyContact(contact)
        }}
      />

      {/* Reply Composer */}
      {replyContact && (
        <ReplyComposer
          contact={replyContact}
          onClose={() => setReplyContact(null)}
          onSent={() => {
            fetchSubmissions()
            setReplyContact(null)
          }}
        />
      )}

      {/* Delete Confirmation Modal */}
      <AlertDialog open={deleteConfirm.open} onOpenChange={(open) => !open && setDeleteConfirm({ open: false, id: null, name: "" })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Submission</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the submission from <span className="font-semibold text-foreground">{deleteConfirm.name}</span>? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
