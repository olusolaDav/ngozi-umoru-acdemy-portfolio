"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { 
  FileText, 
  Mail, 
  BookOpen, 
  Settings, 
  TrendingUp, 
  Users, 
  Eye,
  MessageSquare,
  ArrowUpRight,
  ArrowRight,
  Clock,
  BarChart3,
  Loader2,
  FolderOpen,
  Plus,
  Calendar,
  Bell
} from "lucide-react"
import { AdminDashboardHeader } from "@/components/dashboard/admin-dashboard-header"
import { formatDistanceToNow } from "date-fns"

interface Stats {
  totalResources: number
  totalContacts: number
  unreadContacts: number
  totalBlogPosts: number
  publishedPosts: number
  draftPosts: number
  totalViews: number
  totalComments: number
  unreadNotifications: number
}

interface RecentActivity {
  id: string
  type: "contact" | "blog" | "resource" | "comment" | "notification"
  title: string
  description: string
  timestamp: string
  status?: string
}

interface RecentBlogPost {
  _id: string
  title: string
  slug: string
  status: string
  views: number
  createdAt: string
}

interface RecentContact {
  _id: string
  name: string
  email: string
  subject: string
  status: string
  createdAt: string
}

interface RecentNotification {
  id: string
  type: string
  title: string
  message: string
  read: boolean
  createdAt: string
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats>({
    totalResources: 0,
    totalContacts: 0,
    unreadContacts: 0,
    totalBlogPosts: 0,
    publishedPosts: 0,
    draftPosts: 0,
    totalViews: 0,
    totalComments: 0,
    unreadNotifications: 0,
  })
  const [recentPosts, setRecentPosts] = useState<RecentBlogPost[]>([])
  const [recentContacts, setRecentContacts] = useState<RecentContact[]>([])
  const [recentNotifications, setRecentNotifications] = useState<RecentNotification[]>([])
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true)
      try {
        // Fetch all dashboard data in a single API call
        const response = await fetch("/api/admin/dashboard")
        const data = await response.json()
        
        if (response.ok) {
          setStats(data.stats)
          setRecentPosts(data.recentPosts || [])
          setRecentContacts(data.recentContacts || [])
          setRecentNotifications(data.recentNotifications || [])
          setRecentActivity(data.recentActivity || [])
        } else {
          console.error("Error fetching dashboard data:", data.error)
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  const statCards = [
    {
      title: "Total Blog Posts",
      value: stats.totalBlogPosts,
      subValue: `${stats.publishedPosts} published`,
      icon: BookOpen,
      color: "bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400",
      href: "/admin/blog",
    },
    {
      title: "Total Views",
      value: stats.totalViews.toLocaleString(),
      subValue: "Across all posts",
      icon: Eye,
      color: "bg-green-50 dark:bg-green-950/30 text-green-600 dark:text-green-400",
      href: "/admin/blog",
    },
    {
      title: "Contact Messages",
      value: stats.totalContacts,
      subValue: `${stats.unreadContacts} unread`,
      icon: Mail,
      color: "bg-purple-50 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400",
      href: "/admin/contacts",
    },
    {
      title: "Resources",
      value: stats.totalResources,
      subValue: "Files uploaded",
      icon: FileText,
      color: "bg-orange-50 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400",
      href: "/admin/resources",
    },
  ]

  const quickActions = [
    {
      title: "New Blog Post",
      description: "Create a new blog post",
      icon: Plus,
      href: "/admin/blog/new",
      color: "bg-blue-600 hover:bg-blue-700 text-white",
    },
    {
      title: "Upload Resource",
      description: "Add new files or documents",
      icon: FolderOpen,
      href: "/admin/resources",
      color: "bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-50",
    },
    {
      title: "View Messages",
      description: "Check contact submissions",
      icon: Mail,
      href: "/admin/contacts",
      color: "bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-50",
    },
    {
      title: "Settings",
      description: "Manage your preferences",
      icon: Settings,
      href: "/admin/settings",
      color: "bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-50",
    },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "published":
        return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
      case "draft":
        return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
      case "new":
      case "unread":
        return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
      case "read":
        return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400"
      case "replied":
        return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400"
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50/50 dark:bg-gray-950/50">
        <AdminDashboardHeader
          title="Overview"
          description="Your dashboard at a glance"
        />
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-950/50">
      <AdminDashboardHeader
        title="Overview"
        description="Your dashboard at a glance"
      />

      <div className="px-6 py-6 space-y-6">
        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {statCards.map((card) => {
            const Icon = card.icon
            return (
              <Link key={card.title} href={card.href}>
                <Card className="hover:shadow-md transition-all cursor-pointer border border-gray-200/50 dark:border-gray-700/50">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          {card.title}
                        </p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-gray-50 mt-1">
                          {card.value}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {card.subValue}
                        </p>
                      </div>
                      <div className={`w-12 h-12 rounded-lg ${card.color} flex items-center justify-center`}>
                        <Icon className="w-6 h-6" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Recent Blog Posts */}
          <Card className="lg:col-span-2 border border-gray-200/50 dark:border-gray-700/50">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg">Recent Blog Posts</CardTitle>
                <CardDescription>Your latest published and draft posts</CardDescription>
              </div>
              <Link href="/admin/blog">
                <Button variant="outline" size="sm" className="gap-2">
                  View All <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {recentPosts.length === 0 ? (
                <div className="text-center py-8">
                  <BookOpen className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-500 dark:text-gray-400 mb-4">No blog posts yet</p>
                  <Link href="/admin/blog/new">
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                      Create Your First Post
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentPosts.map((post) => (
                    <div
                      key={post._id}
                      className="flex items-center justify-between p-4 rounded-lg border border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <Link href={`/admin/blog/edit/${post.slug}`}>
                          <h4 className="font-medium text-gray-900 dark:text-gray-50 truncate hover:text-blue-600 dark:hover:text-blue-400">
                            {post.title}
                          </h4>
                        </Link>
                        <div className="flex items-center gap-3 mt-1">
                          <Badge className={`text-xs ${getStatusColor(post.status)}`}>
                            {post.status}
                          </Badge>
                          <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            {post.views || 0} views
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                          </span>
                        </div>
                      </div>
                      <Link href={`/admin/blog/edit/${post.slug}`}>
                        <Button variant="ghost" size="sm">
                          <ArrowUpRight className="h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="border border-gray-200/50 dark:border-gray-700/50">
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
              <CardDescription>Common tasks and shortcuts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {quickActions.map((action) => {
                const Icon = action.icon
                return (
                  <Link key={action.title} href={action.href}>
                    <div className={`flex items-center gap-3 p-3 rounded-lg ${action.color} transition-colors cursor-pointer`}>
                      <Icon className="h-5 w-5 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm">{action.title}</p>
                        <p className="text-xs opacity-75">{action.description}</p>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </CardContent>
          </Card>
        </div>

        {/* Recent Contacts */}
        <Card className="border border-gray-200/50 dark:border-gray-700/50">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg">Recent Contact Messages</CardTitle>
              <CardDescription>Latest submissions from your contact form</CardDescription>
            </div>
            <Link href="/admin/contacts">
              <Button variant="outline" size="sm" className="gap-2">
                View All <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {recentContacts.length === 0 ? (
              <div className="text-center py-8">
                <Mail className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                <p className="text-gray-500 dark:text-gray-400">No contact messages yet</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100 dark:border-gray-800">
                      <th className="text-left py-3 px-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Name</th>
                      <th className="text-left py-3 px-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Email</th>
                      <th className="text-left py-3 px-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Subject</th>
                      <th className="text-left py-3 px-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Status</th>
                      <th className="text-left py-3 px-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentContacts.map((contact) => (
                      <tr key={contact._id} className="border-b border-gray-50 dark:border-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                        <td className="py-3 px-2 font-medium text-gray-900 dark:text-gray-50">{contact.name}</td>
                        <td className="py-3 px-2 text-gray-600 dark:text-gray-400">{contact.email}</td>
                        <td className="py-3 px-2 text-gray-600 dark:text-gray-400 max-w-xs truncate">{contact.subject}</td>
                        <td className="py-3 px-2">
                          <Badge className={`text-xs ${getStatusColor(contact.status)}`}>
                            {contact.status}
                          </Badge>
                        </td>
                        <td className="py-3 px-2 text-gray-500 dark:text-gray-400 text-sm">
                          {formatDistanceToNow(new Date(contact.createdAt), { addSuffix: true })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Footer Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="border border-gray-200/50 dark:border-gray-700/50">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-blue-50 dark:bg-blue-950/30 flex items-center justify-center">
                <BarChart3 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Comments</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-50">{stats.totalComments}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border border-gray-200/50 dark:border-gray-700/50">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-green-50 dark:bg-green-950/30 flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Published Posts</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-50">{stats.publishedPosts}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border border-gray-200/50 dark:border-gray-700/50">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-yellow-50 dark:bg-yellow-950/30 flex items-center justify-center">
                <FileText className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Draft Posts</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-50">{stats.draftPosts}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
