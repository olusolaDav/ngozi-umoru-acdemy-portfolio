// ============================================================================
// Notification Types for Academic Portfolio
// Handles contact form, blog comments, replies, and login notifications
// ============================================================================

import { ObjectId } from "mongodb"

// Collection name for notifications
export const NOTIFICATIONS_COLLECTION = "notifications"
export const ADMIN_SETTINGS_COLLECTION = "admin_settings"

// Notification types specific to academic portfolio
export type PortfolioNotificationType =
  | "contact_message"      // New contact form submission
  | "blog_comment"         // New comment on blog post
  | "comment_reply"        // Reply to a comment
  | "login_alert"          // Login notification
  | "weekly_digest"        // Weekly summary

// Notification priority
export type NotificationPriority = "low" | "normal" | "high"

// Notification interface
export interface PortfolioNotification {
  _id?: ObjectId
  notificationId: string
  
  // Type and content
  type: PortfolioNotificationType
  title: string
  message: string
  priority: NotificationPriority
  
  // Related entity info
  relatedId?: string        // ID of contact/comment/etc
  relatedType?: "contact" | "blog_post" | "comment"
  relatedTitle?: string     // Post title, contact subject, etc
  relatedUrl?: string       // URL to navigate to
  
  // Sender info (for contacts/comments)
  senderName?: string
  senderEmail?: string
  senderAvatar?: string
  
  // Recipient (usually admin)
  recipientId: string
  recipientEmail?: string
  
  // Status
  isRead: boolean
  isEmailSent: boolean
  isArchived: boolean
  
  // Timestamps
  createdAt: Date
  readAt?: Date
  emailSentAt?: Date
}

// Admin notification settings
export interface AdminNotificationSettings {
  userId: string
  notifications: {
    emailNotifications: boolean      // Master switch for email notifications
    contactFormAlerts: boolean       // Email for new contact messages
    blogCommentAlerts: boolean       // Email for new blog comments
    commentReplyAlerts: boolean      // Email for comment replies
    loginAlerts: boolean             // Email for new login
    weeklyDigest: boolean            // Weekly summary email
  }
  security: {
    twoFactorEnabled: boolean
    sessionTimeout: number
    loginAlerts: boolean
  }
  updatedAt: Date
}

// Default notification settings
export const DEFAULT_NOTIFICATION_SETTINGS: Omit<AdminNotificationSettings, "userId"> = {
  notifications: {
    emailNotifications: true,
    contactFormAlerts: true,
    blogCommentAlerts: true,
    commentReplyAlerts: true,
    loginAlerts: true,
    weeklyDigest: false,
  },
  security: {
    twoFactorEnabled: false,
    sessionTimeout: 30,
    loginAlerts: true,
  },
  updatedAt: new Date(),
}

// Contact message for notification
export interface ContactMessageData {
  id: string
  fullName: string
  email: string
  phone?: string
  purpose: string
  subject?: string
  message: string
  submittedAt: Date
}

// Blog comment data for notification
export interface BlogCommentData {
  id: string
  postId: string
  postTitle: string
  postSlug: string
  authorName: string
  authorEmail: string
  content: string
  parentCommentId?: string
  parentAuthorName?: string
  createdAt: Date
}

// Login data for notification
export interface LoginData {
  userId: string
  email: string
  name: string
  ipAddress?: string
  userAgent?: string
  loginAt: Date
}

// Dashboard stats interface
export interface DashboardStats {
  totalResources: number
  totalContacts: number
  unreadContacts: number
  totalBlogPosts: number
  publishedPosts: number
  draftPosts: number
  totalViews: number
  totalComments: number
  pendingComments: number
  unreadNotifications: number
}

// Recent activity item
export interface RecentActivityItem {
  id: string
  type: "contact" | "blog" | "resource" | "comment" | "login"
  title: string
  description: string
  timestamp: Date
  status?: string
  url?: string
}
