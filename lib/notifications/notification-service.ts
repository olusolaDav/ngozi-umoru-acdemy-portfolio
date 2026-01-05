// ============================================================================
// Notification Service for Academic Portfolio
// Handles creating in-app notifications and sending email notifications
// ============================================================================

import { nanoid } from "nanoid"
import { getDb } from "@/lib/mongodb"
import { sendEmail } from "@/lib/email"
import {
  NOTIFICATIONS_COLLECTION,
  ADMIN_SETTINGS_COLLECTION,
  PortfolioNotification,
  PortfolioNotificationType,
  NotificationPriority,
  AdminNotificationSettings,
  DEFAULT_NOTIFICATION_SETTINGS,
  ContactMessageData,
  BlogCommentData,
  LoginData,
} from "./notification-types"

// ============================================================================
// NOTIFICATION CRUD OPERATIONS
// ============================================================================

/**
 * Create a new notification
 */
export async function createNotification(params: {
  type: PortfolioNotificationType
  title: string
  message: string
  priority?: NotificationPriority
  relatedId?: string
  relatedType?: "contact" | "blog_post" | "comment"
  relatedTitle?: string
  relatedUrl?: string
  senderName?: string
  senderEmail?: string
  recipientId: string
  recipientEmail?: string
}): Promise<PortfolioNotification> {
  const db = await getDb()

  const notification: PortfolioNotification = {
    notificationId: nanoid(12),
    type: params.type,
    title: params.title,
    message: params.message,
    priority: params.priority || "normal",
    relatedId: params.relatedId,
    relatedType: params.relatedType,
    relatedTitle: params.relatedTitle,
    relatedUrl: params.relatedUrl,
    senderName: params.senderName,
    senderEmail: params.senderEmail,
    recipientId: params.recipientId,
    recipientEmail: params.recipientEmail,
    isRead: false,
    isEmailSent: false,
    isArchived: false,
    createdAt: new Date(),
  }

  const result = await db.collection(NOTIFICATIONS_COLLECTION).insertOne(notification)
  return { ...notification, _id: result.insertedId }
}

/**
 * Get notifications for a user
 */
export async function getNotifications(
  userId: string,
  options?: {
    unreadOnly?: boolean
    limit?: number
    skip?: number
    type?: PortfolioNotificationType
  }
): Promise<PortfolioNotification[]> {
  const db = await getDb()

  const query: Record<string, any> = { recipientId: userId, isArchived: false }
  if (options?.unreadOnly) query.isRead = false
  if (options?.type) query.type = options.type

  const notifications = await db
    .collection(NOTIFICATIONS_COLLECTION)
    .find(query)
    .sort({ createdAt: -1 })
    .skip(options?.skip || 0)
    .limit(options?.limit || 50)
    .toArray()

  return notifications as unknown as PortfolioNotification[]
}

/**
 * Get unread notification count
 */
export async function getUnreadNotificationCount(userId: string): Promise<number> {
  const db = await getDb()
  return await db
    .collection(NOTIFICATIONS_COLLECTION)
    .countDocuments({ recipientId: userId, isRead: false, isArchived: false })
}

/**
 * Mark a notification as read
 */
export async function markNotificationAsRead(notificationId: string): Promise<boolean> {
  const db = await getDb()
  const result = await db
    .collection(NOTIFICATIONS_COLLECTION)
    .updateOne({ notificationId }, { $set: { isRead: true, readAt: new Date() } })
  return result.modifiedCount > 0
}

/**
 * Mark all notifications as read for a user
 */
export async function markAllNotificationsAsRead(userId: string): Promise<number> {
  const db = await getDb()
  const result = await db
    .collection(NOTIFICATIONS_COLLECTION)
    .updateMany(
      { recipientId: userId, isRead: false },
      { $set: { isRead: true, readAt: new Date() } }
    )
  return result.modifiedCount
}

/**
 * Archive a notification
 */
export async function archiveNotification(notificationId: string): Promise<boolean> {
  const db = await getDb()
  const result = await db
    .collection(NOTIFICATIONS_COLLECTION)
    .updateOne({ notificationId }, { $set: { isArchived: true } })
  return result.modifiedCount > 0
}

/**
 * Delete a notification
 */
export async function deleteNotification(notificationId: string): Promise<boolean> {
  const db = await getDb()
  const result = await db.collection(NOTIFICATIONS_COLLECTION).deleteOne({ notificationId })
  return result.deletedCount > 0
}

// ============================================================================
// ADMIN SETTINGS
// ============================================================================

/**
 * Get admin notification settings
 */
export async function getAdminSettings(userId: string): Promise<AdminNotificationSettings> {
  const db = await getDb()
  const settings = await db.collection(ADMIN_SETTINGS_COLLECTION).findOne({ userId })

  if (!settings) {
    return { userId, ...DEFAULT_NOTIFICATION_SETTINGS }
  }

  return {
    userId,
    notifications: settings.notifications || DEFAULT_NOTIFICATION_SETTINGS.notifications,
    security: settings.security || DEFAULT_NOTIFICATION_SETTINGS.security,
    updatedAt: settings.updatedAt || new Date(),
  }
}

/**
 * Update admin notification settings
 */
export async function updateAdminSettings(
  userId: string,
  updates: Partial<Pick<AdminNotificationSettings, "notifications" | "security">>
): Promise<boolean> {
  const db = await getDb()

  const updateData: any = { updatedAt: new Date() }
  if (updates.notifications) updateData.notifications = updates.notifications
  if (updates.security) updateData.security = updates.security

  const result = await db.collection(ADMIN_SETTINGS_COLLECTION).updateOne(
    { userId },
    { $set: updateData },
    { upsert: true }
  )

  return result.modifiedCount > 0 || result.upsertedCount > 0
}

// ============================================================================
// GET ADMIN USER
// ============================================================================

/**
 * Get admin user for notifications (returns first admin found)
 * Falls back to ADMIN_EMAIL env variable if no admin user found in database
 */
export async function getAdminUser(): Promise<{ userId: string; email: string; name: string } | null> {
  const admins = await getAllAdminUsers()
  return admins.length > 0 ? admins[0] : null
}

/**
 * Get ALL admin users for notifications
 */
export async function getAllAdminUsers(): Promise<{ userId: string; email: string; name: string }[]> {
  const db = await getDb()
  
  // Find all admins by role
  const admins = await db.collection("users").find({ role: "admin" }).toArray()
  
  if (admins.length === 0) {
    // Fallback to ADMIN_EMAIL from environment
    const adminEmail = process.env.ADMIN_EMAIL
    if (adminEmail) {
      console.log("[getAllAdminUsers] Using ADMIN_EMAIL from environment:", adminEmail)
      return [{
        userId: "env-admin",
        email: adminEmail,
        name: "Admin",
      }]
    }
    console.error("[getAllAdminUsers] No admin users found in database and no ADMIN_EMAIL configured")
    return []
  }

  return admins.map(admin => ({
    userId: admin._id.toString(),
    email: admin.email,
    name: admin.name || admin.email,
  }))
}

// ============================================================================
// EMAIL TEMPLATES
// ============================================================================

function contactNotificationEmailTemplate(data: ContactMessageData) {
  const purposeLabels: Record<string, string> = {
    general: "General Inquiry",
    collaboration: "Collaboration Opportunity",
    research: "Research Query",
    teaching: "Teaching Inquiry",
    speaking: "Speaking Engagement",
  }
  const purposeLabel = purposeLabels[data.purpose] || data.purpose

  return {
    subject: `📬 New Contact: ${data.subject || purposeLabel}`,
    text: `
New Contact Form Submission

From: ${data.fullName}
Email: ${data.email}
Phone: ${data.phone || "Not provided"}
Purpose: ${purposeLabel}

Message:
${data.message}

Submitted: ${new Date(data.submittedAt).toLocaleString()}

View in Dashboard: ${process.env.NEXT_PUBLIC_BASE_URL || "https://ngoziumoru.info"}/admin/contacts
    `.trim(),
    html: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background: #f4f4f5; }
    .wrapper { max-width: 600px; margin: 0 auto; padding: 20px; }
    .container { background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
    .header { background: linear-gradient(135deg, #00afef 0%, #4169e1 100%); color: white; padding: 24px; }
    .header h1 { margin: 0; font-size: 20px; font-weight: 600; }
    .content { padding: 24px; }
    .field { margin-bottom: 16px; padding-bottom: 16px; border-bottom: 1px solid #f0f0f0; }
    .field:last-child { border-bottom: none; margin-bottom: 0; }
    .label { font-size: 12px; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; }
    .value { color: #111827; font-size: 15px; }
    .message-box { background: #f9fafb; padding: 16px; border-radius: 8px; border-left: 4px solid #00afef; margin-top: 8px; }
    .button { display: inline-block; background: #00afef; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 500; margin-top: 16px; }
    .footer { text-align: center; padding: 20px; font-size: 12px; color: #6b7280; }
    .badge { display: inline-block; background: #dbeafe; color: #1d4ed8; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 500; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <h1>📬 New Contact Form Submission</h1>
      </div>
      <div class="content">
        <div class="field">
          <div class="label">Purpose</div>
          <div class="value"><span class="badge">${purposeLabel}</span></div>
        </div>
        <div class="field">
          <div class="label">From</div>
          <div class="value"><strong>${data.fullName}</strong></div>
        </div>
        <div class="field">
          <div class="label">Email</div>
          <div class="value"><a href="mailto:${data.email}" style="color: #00afef;">${data.email}</a></div>
        </div>
        ${data.phone ? `<div class="field"><div class="label">Phone</div><div class="value">${data.phone}</div></div>` : ""}
        <div class="field">
          <div class="label">Message</div>
          <div class="message-box">${data.message.replace(/\n/g, "<br>")}</div>
        </div>
        <a href="${process.env.NEXT_PUBLIC_BASE_URL || "https://ngoziumoru.info"}/admin/contacts" class="button">View in Dashboard →</a>
      </div>
    </div>
    <div class="footer">
      <p>Academic Portfolio Notification System</p>
    </div>
  </div>
</body>
</html>
    `.trim(),
  }
}

function blogCommentNotificationEmailTemplate(data: BlogCommentData) {
  const isReply = !!data.parentCommentId

  return {
    subject: isReply
      ? `💬 New Reply on "${data.postTitle}"`
      : `💬 New Comment on "${data.postTitle}"`,
    text: `
${isReply ? "New Reply to Comment" : "New Blog Comment"}

Post: ${data.postTitle}
${isReply ? `Reply to: ${data.parentAuthorName}'s comment` : ""}
From: ${data.authorName} (${data.authorEmail})

Comment:
${data.content}

View: ${process.env.NEXT_PUBLIC_BASE_URL || "https://ngoziumoru.info"}/blog/${data.postSlug}
    `.trim(),
    html: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background: #f4f4f5; }
    .wrapper { max-width: 600px; margin: 0 auto; padding: 20px; }
    .container { background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
    .header { background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%); color: white; padding: 24px; }
    .header h1 { margin: 0; font-size: 20px; font-weight: 600; }
    .content { padding: 24px; }
    .field { margin-bottom: 16px; }
    .label { font-size: 12px; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; }
    .value { color: #111827; font-size: 15px; }
    .comment-box { background: #f9fafb; padding: 16px; border-radius: 8px; border-left: 4px solid #8b5cf6; margin-top: 8px; }
    .button { display: inline-block; background: #8b5cf6; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 500; margin-top: 16px; }
    .footer { text-align: center; padding: 20px; font-size: 12px; color: #6b7280; }
    .post-title { font-size: 18px; font-weight: 600; color: #111827; margin-bottom: 8px; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <h1>💬 ${isReply ? "New Reply" : "New Comment"}</h1>
      </div>
      <div class="content">
        <div class="post-title">"${data.postTitle}"</div>
        ${isReply ? `<p style="color: #6b7280; font-size: 14px;">Reply to ${data.parentAuthorName}'s comment</p>` : ""}
        <div class="field">
          <div class="label">From</div>
          <div class="value"><strong>${data.authorName}</strong> (${data.authorEmail})</div>
        </div>
        <div class="field">
          <div class="label">Comment</div>
          <div class="comment-box">${data.content.replace(/\n/g, "<br>")}</div>
        </div>
        <a href="${process.env.NEXT_PUBLIC_BASE_URL || "https://ngoziumoru.info"}/blog/${data.postSlug}" class="button">View Post →</a>
      </div>
    </div>
    <div class="footer">
      <p>Academic Portfolio Notification System</p>
    </div>
  </div>
</body>
</html>
    `.trim(),
  }
}

function loginAlertEmailTemplate(data: LoginData) {
  return {
    subject: `🔐 New Login to Your Account`,
    text: `
New Login Detected

A new login was detected on your account.

Email: ${data.email}
Time: ${new Date(data.loginAt).toLocaleString()}
${data.ipAddress ? `IP Address: ${data.ipAddress}` : ""}

If this wasn't you, please secure your account immediately.
    `.trim(),
    html: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background: #f4f4f5; }
    .wrapper { max-width: 600px; margin: 0 auto; padding: 20px; }
    .container { background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
    .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 24px; }
    .header h1 { margin: 0; font-size: 20px; font-weight: 600; }
    .content { padding: 24px; }
    .field { margin-bottom: 16px; padding-bottom: 16px; border-bottom: 1px solid #f0f0f0; }
    .label { font-size: 12px; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; }
    .value { color: #111827; font-size: 15px; }
    .warning { background: #fef3c7; border: 1px solid #f59e0b; padding: 12px 16px; border-radius: 8px; margin-top: 16px; font-size: 14px; color: #92400e; }
    .footer { text-align: center; padding: 20px; font-size: 12px; color: #6b7280; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <h1>🔐 New Login Detected</h1>
      </div>
      <div class="content">
        <p>A new login was detected on your account.</p>
        <div class="field">
          <div class="label">Account</div>
          <div class="value">${data.email}</div>
        </div>
        <div class="field">
          <div class="label">Time</div>
          <div class="value">${new Date(data.loginAt).toLocaleString()}</div>
        </div>
        ${data.ipAddress ? `<div class="field"><div class="label">IP Address</div><div class="value">${data.ipAddress}</div></div>` : ""}
        <div class="warning">
          ⚠️ If this wasn't you, please change your password immediately and contact support.
        </div>
      </div>
    </div>
    <div class="footer">
      <p>Academic Portfolio Security Alert</p>
    </div>
  </div>
</body>
</html>
    `.trim(),
  }
}

// ============================================================================
// NOTIFICATION TRIGGERS
// ============================================================================

/**
 * Notify ALL admins of new contact form submission
 */
export async function notifyNewContact(data: ContactMessageData): Promise<void> {
  console.log("[notifyNewContact] Starting notification for contact:", data.fullName)
  
  const admins = await getAllAdminUsers()
  if (admins.length === 0) {
    console.error("[notifyNewContact] No admin users found for notifications")
    return
  }

  console.log("[notifyNewContact] Found", admins.length, "admin(s):", admins.map(a => a.email).join(", "))

  // Create in-app notification and send email to ALL admins
  for (const admin of admins) {
    const settings = await getAdminSettings(admin.userId)
    
    // Create in-app notification for this admin
    try {
      const notification = await createNotification({
        type: "contact_message",
        title: "New Contact Message",
        message: `${data.fullName} sent a message: "${data.message.substring(0, 100)}${data.message.length > 100 ? "..." : ""}"`,
        priority: "high",
        relatedId: data.id,
        relatedType: "contact",
        relatedTitle: data.subject || data.purpose,
        relatedUrl: "/admin/contacts",
        senderName: data.fullName,
        senderEmail: data.email,
        recipientId: admin.userId,
        recipientEmail: admin.email,
      })
      console.log("[notifyNewContact] In-app notification created for", admin.email, ":", notification.notificationId)
    } catch (notifError) {
      console.error("[notifyNewContact] Failed to create in-app notification for", admin.email, ":", notifError)
    }

    // Send email if enabled for this admin
    if (settings.notifications.emailNotifications && settings.notifications.contactFormAlerts) {
      try {
        console.log("[notifyNewContact] Sending email notification to:", admin.email)
        const emailContent = contactNotificationEmailTemplate(data)
        await sendEmail({
          to: admin.email,
          ...emailContent,
        })
        console.log("[notifyNewContact] Email sent successfully to:", admin.email)
      } catch (error) {
        console.error("[notifyNewContact] Failed to send email to", admin.email, ":", error)
      }
    }
  }
}

/**
 * Notify ALL admins of new blog comment
 */
export async function notifyNewComment(data: BlogCommentData): Promise<void> {
  const admins = await getAllAdminUsers()
  if (admins.length === 0) {
    console.error("[notifyNewComment] No admin users found for notifications")
    return
  }

  const isReply = !!data.parentCommentId

  for (const admin of admins) {
    const settings = await getAdminSettings(admin.userId)

    // Create in-app notification for this admin
    try {
      await createNotification({
        type: isReply ? "comment_reply" : "blog_comment",
        title: isReply ? "New Comment Reply" : "New Blog Comment",
        message: `${data.authorName} ${isReply ? "replied to a comment" : "commented"} on "${data.postTitle}": "${data.content.substring(0, 80)}${data.content.length > 80 ? "..." : ""}"`,
        priority: "normal",
        relatedId: data.id,
        relatedType: "comment",
        relatedTitle: data.postTitle,
        relatedUrl: `/blog/${data.postSlug}`,
        senderName: data.authorName,
        senderEmail: data.authorEmail,
        recipientId: admin.userId,
        recipientEmail: admin.email,
      })
    } catch (error) {
      console.error("[notifyNewComment] Failed to create notification for", admin.email, ":", error)
    }

    // Send email if enabled for this admin
    const shouldSendEmail = settings.notifications.emailNotifications &&
      (isReply ? settings.notifications.commentReplyAlerts : settings.notifications.blogCommentAlerts)

    if (shouldSendEmail) {
      try {
        const emailContent = blogCommentNotificationEmailTemplate(data)
        await sendEmail({
          to: admin.email,
          ...emailContent,
        })
      } catch (error) {
        console.error("[notifyNewComment] Failed to send email to", admin.email, ":", error)
      }
    }
  }
}

/**
 * Notify admin of new login
 */
export async function notifyNewLogin(data: LoginData): Promise<void> {
  const settings = await getAdminSettings(data.userId)

  // Create in-app notification
  await createNotification({
    type: "login_alert",
    title: "New Login",
    message: `You logged in from a new session at ${new Date(data.loginAt).toLocaleString()}`,
    priority: "low",
    recipientId: data.userId,
    recipientEmail: data.email,
  })

  // Send email if enabled
  if (settings.notifications.emailNotifications && settings.notifications.loginAlerts) {
    try {
      const emailContent = loginAlertEmailTemplate(data)
      await sendEmail({
        to: data.email,
        ...emailContent,
      })
    } catch (error) {
      console.error("Failed to send login notification email:", error)
    }
  }
}

// ============================================================================
// DASHBOARD STATS
// ============================================================================

/**
 * Get dashboard statistics
 */
export async function getDashboardStats(userId: string): Promise<{
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
}> {
  const db = await getDb()

  // Get blog posts stats
  const blogPosts = await db.collection("blog_posts").find({}).toArray()
  const publishedPosts = blogPosts.filter(p => p.status === "published")
  const draftPosts = blogPosts.filter(p => p.status === "draft")
  const totalViews = blogPosts.reduce((sum, p) => sum + (p.views || 0), 0)

  // Get contacts stats
  const contacts = await db.collection("contacts").find({}).toArray()
  const unreadContacts = contacts.filter(c => c.status === "new" || c.status === "unread").length

  // Get resources stats
  const resources = await db.collection("resources").countDocuments({})

  // Get comments stats
  const comments = await db.collection("blog_comments").find({}).toArray()
  const pendingComments = comments.filter(c => c.status === "pending").length

  // Get unread notifications
  const unreadNotifications = await getUnreadNotificationCount(userId)

  return {
    totalResources: resources,
    totalContacts: contacts.length,
    unreadContacts,
    totalBlogPosts: blogPosts.length,
    publishedPosts: publishedPosts.length,
    draftPosts: draftPosts.length,
    totalViews,
    totalComments: comments.length,
    pendingComments,
    unreadNotifications,
  }
}

/**
 * Get unread contacts count
 */
export async function getUnreadContactsCount(): Promise<number> {
  const db = await getDb()
  return await db.collection("contacts").countDocuments({
    $or: [{ status: "new" }, { status: "unread" }],
  })
}
