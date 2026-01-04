// Form Database Helper Functions
// Provides CRUD operations for form submissions, reviews, and notifications

import { ObjectId, Db } from "mongodb"
import { getDb } from "../mongodb"
import { nanoid } from "nanoid"
import {
  COLLECTIONS,
  FormDefinition,
  FormSubmissionData,
  FormReview,
  FormNotification,
  FormAssignment,
  SubmissionStatus,
  NotificationType,
  DEFAULT_FORM_DEFINITIONS,
  UploadedDocument,
  SectionScore,
} from "./form-models"

// ============================================================================
// DATABASE INITIALIZATION
// ============================================================================

/**
 * Initialize form definitions in the database
 * Run this once to seed the form definitions
 */
export async function initializeFormDefinitions() {
  const db = await getDb()
  const collection = db.collection(COLLECTIONS.FORM_DEFINITIONS)
  
  for (const formDef of DEFAULT_FORM_DEFINITIONS) {
    const existing = await collection.findOne({ id: formDef.id })
    if (!existing) {
      await collection.insertOne({
        ...formDef,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
    }
  }
  
  console.log("Form definitions initialized")
}

// ============================================================================
// FORM DEFINITIONS
// ============================================================================

export async function getFormDefinitions(): Promise<FormDefinition[]> {
  const db = await getDb()
  const forms = await db
    .collection(COLLECTIONS.FORM_DEFINITIONS)
    .find({ isActive: true })
    .toArray()
  return forms as unknown as FormDefinition[]
}

export async function getFormDefinition(formId: string): Promise<FormDefinition | null> {
  const db = await getDb()
  const form = await db
    .collection(COLLECTIONS.FORM_DEFINITIONS)
    .findOne({ id: formId, isActive: true })
  return form as unknown as FormDefinition | null
}

// ============================================================================
// FORM SUBMISSIONS - CREATE & UPDATE
// ============================================================================

export async function createFormSubmission(
  params: {
    formId: string
    clientId: string
    companyId: string
    companyName: string
    sector: string
    filledBy: {
      userId: string
      name: string
      email: string
      role: "client" | "collaborator"
    }
    data: Record<string, any>
    progress: number
    sectionProgress: Record<string, number>
    assignedAuditorId?: string
    assignedAuditorName?: string
  }
): Promise<FormSubmissionData> {
  const db = await getDb()
  
  const submission: FormSubmissionData = {
    submissionId: nanoid(12),
    formId: params.formId,
    formVersion: "1.0",
    clientId: params.clientId,
    companyId: params.companyId,
    companyName: params.companyName,
    sector: params.sector,
    filledBy: params.filledBy,
    assignedAuditorId: params.assignedAuditorId,
    assignedAuditorName: params.assignedAuditorName,
    data: params.data,
    status: "draft",
    progress: params.progress,
    sectionProgress: params.sectionProgress,
    flaggedFields: [],
    totalFlags: 0,
    clearedFlags: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  }
  
  const result = await db
    .collection(COLLECTIONS.FORM_SUBMISSIONS)
    .insertOne(submission)
  
  return { ...submission, _id: result.insertedId }
}

export async function updateFormSubmission(
  submissionId: string,
  updates: Partial<FormSubmissionData>
): Promise<boolean> {
  const db = await getDb()
  
  const result = await db
    .collection(COLLECTIONS.FORM_SUBMISSIONS)
    .updateOne(
      { submissionId },
      { $set: { ...updates, updatedAt: new Date() } }
    )
  
  return result.modifiedCount > 0
}

export async function submitForm(submissionId: string): Promise<boolean> {
  const db = await getDb()
  
  const result = await db
    .collection(COLLECTIONS.FORM_SUBMISSIONS)
    .updateOne(
      { submissionId },
      { 
        $set: { 
          status: "submitted" as SubmissionStatus,
          submittedAt: new Date(),
          updatedAt: new Date(),
        } 
      }
    )
  
  return result.modifiedCount > 0
}

export async function saveDraft(
  submissionId: string,
  data: Record<string, any>,
  progress: number,
  sectionProgress: Record<string, number>
): Promise<boolean> {
  const db = await getDb()
  
  const result = await db
    .collection(COLLECTIONS.FORM_SUBMISSIONS)
    .updateOne(
      { submissionId },
      { 
        $set: { 
          data,
          progress,
          sectionProgress,
          updatedAt: new Date(),
        } 
      }
    )
  
  return result.modifiedCount > 0
}

// ============================================================================
// FORM SUBMISSIONS - READ
// ============================================================================

export async function getFormSubmission(submissionId: string): Promise<FormSubmissionData | null> {
  const db = await getDb()
  
  const submission = await db
    .collection(COLLECTIONS.FORM_SUBMISSIONS)
    .findOne({ submissionId })
  
  return submission as unknown as FormSubmissionData | null
}

export async function getClientFormSubmissions(
  clientId: string,
  formId?: string
): Promise<FormSubmissionData[]> {
  const db = await getDb()
  
  const query: Record<string, any> = { clientId }
  if (formId) query.formId = formId
  
  const submissions = await db
    .collection(COLLECTIONS.FORM_SUBMISSIONS)
    .find(query)
    .sort({ updatedAt: -1 })
    .toArray()
  
  return submissions as unknown as FormSubmissionData[]
}

export async function getClientLatestSubmission(
  clientId: string,
  formId: string
): Promise<FormSubmissionData | null> {
  const db = await getDb()
  
  const submission = await db
    .collection(COLLECTIONS.FORM_SUBMISSIONS)
    .findOne(
      { clientId, formId },
      { sort: { createdAt: -1 } }
    )
  
  return submission as unknown as FormSubmissionData | null
}

export interface FormListParams {
  page?: number
  limit?: number
  status?: SubmissionStatus | "all" | "noReview"
  formId?: string
  search?: string
  sector?: string
  auditorId?: string
}

export interface FormListResult {
  submissions: FormSubmissionData[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  stats: {
    all: number
    noReview: number
    reviewed: number
    flagged: number
    cleared: number
  }
}

export async function getAdminFormSubmissions(
  params: FormListParams
): Promise<FormListResult> {
  const db = await getDb()
  const collection = db.collection(COLLECTIONS.FORM_SUBMISSIONS)
  
  const page = params.page || 1
  const limit = params.limit || 12
  const skip = (page - 1) * limit
  
  // Build query
  const query: Record<string, any> = {
    status: { $ne: "draft" } // Admin only sees submitted forms
  }
  
  if (params.status && params.status !== "all") {
    if (params.status === "noReview") {
      query.status = "submitted"
    } else {
      query.status = params.status
    }
  }
  
  if (params.formId) {
    query.formId = params.formId
  }
  
  if (params.sector) {
    query.sector = params.sector
  }
  
  if (params.search) {
    query.$or = [
      { companyName: { $regex: params.search, $options: "i" } },
      { submissionId: { $regex: params.search, $options: "i" } },
    ]
  }
  
  // Get submissions
  const submissions = await collection
    .find(query)
    .sort({ submittedAt: -1 })
    .skip(skip)
    .limit(limit)
    .toArray()
  
  const total = await collection.countDocuments(query)
  
  // Get stats
  const stats = await collection.aggregate([
    { $match: { status: { $ne: "draft" } } },
    {
      $group: {
        _id: null,
        all: { $sum: 1 },
        noReview: { $sum: { $cond: [{ $eq: ["$status", "submitted"] }, 1, 0] } },
        reviewed: { $sum: { $cond: [{ $eq: ["$status", "reviewed"] }, 1, 0] } },
        flagged: { $sum: { $cond: [{ $eq: ["$status", "flagged"] }, 1, 0] } },
        cleared: { $sum: { $cond: [{ $in: ["$status", ["cleared", "approved"]] }, 1, 0] } },
      }
    }
  ]).toArray()
  
  const defaultStats = { all: 0, noReview: 0, reviewed: 0, flagged: 0, cleared: 0 }
  return {
    submissions: submissions as unknown as FormSubmissionData[],
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
    stats: (stats[0] as typeof defaultStats) || defaultStats,
  }
}

export async function getAuditorFormSubmissions(
  auditorId: string,
  params: FormListParams
): Promise<FormListResult> {
  const db = await getDb()
  const collection = db.collection(COLLECTIONS.FORM_SUBMISSIONS)
  
  const page = params.page || 1
  const limit = params.limit || 12
  const skip = (page - 1) * limit
  
  // Auditor only sees assigned submissions
  const query: Record<string, any> = {
    assignedAuditorId: auditorId,
    status: { $ne: "draft" }
  }
  
  if (params.status && params.status !== "all") {
    if (params.status === "noReview") {
      query.status = "submitted"
    } else {
      query.status = params.status
    }
  }
  
  if (params.formId) {
    query.formId = params.formId
  }
  
  if (params.search) {
    query.$or = [
      { companyName: { $regex: params.search, $options: "i" } },
      { submissionId: { $regex: params.search, $options: "i" } },
    ]
  }
  
  const submissions = await collection
    .find(query)
    .sort({ submittedAt: -1 })
    .skip(skip)
    .limit(limit)
    .toArray()
  
  const total = await collection.countDocuments(query)
  
  // Get stats for this auditor
  const stats = await collection.aggregate([
    { $match: { assignedAuditorId: auditorId, status: { $ne: "draft" } } },
    {
      $group: {
        _id: null,
        all: { $sum: 1 },
        noReview: { $sum: { $cond: [{ $eq: ["$status", "submitted"] }, 1, 0] } },
        reviewed: { $sum: { $cond: [{ $eq: ["$status", "reviewed"] }, 1, 0] } },
        flagged: { $sum: { $cond: [{ $eq: ["$status", "flagged"] }, 1, 0] } },
        cleared: { $sum: { $cond: [{ $in: ["$status", ["cleared", "approved"]] }, 1, 0] } },
      }
    }
  ]).toArray()
  
  const defaultStats = { all: 0, noReview: 0, reviewed: 0, flagged: 0, cleared: 0 }
  return {
    submissions: submissions as unknown as FormSubmissionData[],
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
    stats: (stats[0] as typeof defaultStats) || defaultStats,
  }
}

// ============================================================================
// FORM REVIEWS
// ============================================================================

export async function addFormReview(
  params: {
    submissionId: string
    formId: string
    reviewerId: string
    reviewerName: string
    reviewerAvatar?: string
    reviewerRole: "admin" | "auditor"
    sectionId?: string
    fieldId?: string
    type: "comment" | "flag" | "clear" | "score"
    content: string
  }
): Promise<FormReview> {
  const db = await getDb()
  
  const review: FormReview = {
    reviewId: nanoid(12),
    submissionId: params.submissionId,
    formId: params.formId,
    reviewerId: params.reviewerId,
    reviewerName: params.reviewerName,
    reviewerAvatar: params.reviewerAvatar,
    reviewerRole: params.reviewerRole,
    sectionId: params.sectionId,
    fieldId: params.fieldId,
    type: params.type,
    content: params.content,
    isFlagged: params.type === "flag",
    isCleared: params.type === "clear",
    createdAt: new Date(),
    updatedAt: new Date(),
  }
  
  const result = await db
    .collection(COLLECTIONS.FORM_REVIEWS)
    .insertOne(review)
  
  // Update submission status based on review type
  if (params.type === "flag" && params.fieldId) {
    await db
      .collection(COLLECTIONS.FORM_SUBMISSIONS)
      .updateOne(
        { submissionId: params.submissionId },
        {
          $addToSet: { flaggedFields: params.fieldId },
          $inc: { totalFlags: 1 },
          $set: { 
            status: "flagged" as SubmissionStatus,
            lastReviewedAt: new Date(),
            updatedAt: new Date(),
          }
        }
      )
  } else if (params.type === "comment") {
    await db
      .collection(COLLECTIONS.FORM_SUBMISSIONS)
      .updateOne(
        { submissionId: params.submissionId },
        {
          $set: { 
            status: "under_review" as SubmissionStatus,
            lastReviewedAt: new Date(),
            updatedAt: new Date(),
          }
        }
      )
  }
  
  return { ...review, _id: result.insertedId }
}

export async function getFormReviews(submissionId: string): Promise<FormReview[]> {
  const db = await getDb()
  
  const reviews = await db
    .collection(COLLECTIONS.FORM_REVIEWS)
    .find({ submissionId })
    .sort({ createdAt: -1 })
    .toArray()
  
  return reviews as unknown as FormReview[]
}

export async function getFieldReviews(submissionId: string, fieldId: string): Promise<FormReview[]> {
  const db = await getDb()
  
  const reviews = await db
    .collection(COLLECTIONS.FORM_REVIEWS)
    .find({ submissionId, fieldId })
    .sort({ createdAt: -1 })
    .toArray()
  
  return reviews as unknown as FormReview[]
}

export async function clearFieldFlag(
  submissionId: string,
  fieldId: string,
  clearedBy: { userId: string; name: string }
): Promise<boolean> {
  const db = await getDb()
  
  // Update the flag review
  await db
    .collection(COLLECTIONS.FORM_REVIEWS)
    .updateMany(
      { submissionId, fieldId, type: "flag", isCleared: { $ne: true } },
      {
        $set: {
          isCleared: true,
          clearedBy,
          clearedAt: new Date(),
          updatedAt: new Date(),
        }
      }
    )
  
  // Update submission
  const result = await db
    .collection(COLLECTIONS.FORM_SUBMISSIONS)
    .updateOne(
      { submissionId },
      {
        $pull: { flaggedFields: fieldId } as any,
        $inc: { clearedFlags: 1 },
        $set: { updatedAt: new Date() }
      }
    )
  
  // Check if all flags are cleared
  const submission = await db
    .collection(COLLECTIONS.FORM_SUBMISSIONS)
    .findOne({ submissionId })
  
  if (submission && (submission as any).flaggedFields?.length === 0) {
    await db
      .collection(COLLECTIONS.FORM_SUBMISSIONS)
      .updateOne(
        { submissionId },
        { $set: { status: "cleared" as SubmissionStatus, clearedAt: new Date() } }
      )
  }
  
  return result.modifiedCount > 0
}

export async function clearSectionFlags(
  submissionId: string,
  sectionId: string,
  clearedBy: { userId: string; name: string }
): Promise<boolean> {
  const db = await getDb()
  
  // Get all field flags in this section
  const reviews = await db
    .collection(COLLECTIONS.FORM_REVIEWS)
    .find({ 
      submissionId, 
      sectionId, 
      type: "flag", 
      isCleared: { $ne: true } 
    })
    .toArray()
  
  const fieldIds = reviews.map((r: any) => r.fieldId).filter(Boolean)
  
  // Update all flag reviews in section
  await db
    .collection(COLLECTIONS.FORM_REVIEWS)
    .updateMany(
      { submissionId, sectionId, type: "flag", isCleared: { $ne: true } },
      {
        $set: {
          isCleared: true,
          clearedBy,
          clearedAt: new Date(),
          updatedAt: new Date(),
        }
      }
    )
  
  // Update submission
  if (fieldIds.length > 0) {
    await db
      .collection(COLLECTIONS.FORM_SUBMISSIONS)
      .updateOne(
        { submissionId },
        {
          $pull: { flaggedFields: { $in: fieldIds } } as any,
          $inc: { clearedFlags: fieldIds.length },
          $set: { updatedAt: new Date() }
        }
      )
  }
  
  // Check if all flags are cleared
  const submission = await db
    .collection(COLLECTIONS.FORM_SUBMISSIONS)
    .findOne({ submissionId })
  
  if (submission && (submission as any).flaggedFields?.length === 0) {
    await db
      .collection(COLLECTIONS.FORM_SUBMISSIONS)
      .updateOne(
        { submissionId },
        { $set: { status: "cleared" as SubmissionStatus, clearedAt: new Date() } }
      )
  }
  
  return true
}

export async function clearAllFlags(
  submissionId: string,
  clearedBy: { userId: string; name: string }
): Promise<boolean> {
  const db = await getDb()
  
  // Get current submission to count flags
  const submission = await db
    .collection(COLLECTIONS.FORM_SUBMISSIONS)
    .findOne({ submissionId })
  
  const flagCount = (submission as any)?.flaggedFields?.length || 0
  
  // Update all flag reviews
  await db
    .collection(COLLECTIONS.FORM_REVIEWS)
    .updateMany(
      { submissionId, type: "flag", isCleared: { $ne: true } },
      {
        $set: {
          isCleared: true,
          clearedBy,
          clearedAt: new Date(),
          updatedAt: new Date(),
        }
      }
    )
  
  // Update submission
  const result = await db
    .collection(COLLECTIONS.FORM_SUBMISSIONS)
    .updateOne(
      { submissionId },
      {
        $set: { 
          flaggedFields: [],
          clearedFlags: flagCount,
          status: "cleared" as SubmissionStatus,
          clearedAt: new Date(),
          updatedAt: new Date(),
        }
      }
    )
  
  return result.modifiedCount > 0
}

// ============================================================================
// FORM SCORES (DPO)
// ============================================================================

export async function updateSectionScore(
  submissionId: string,
  sectionId: string,
  score: number,
  comments: string,
  scoredBy: { userId: string; name: string }
): Promise<boolean> {
  const db = await getDb()
  
  // Get current scores
  const submission = await db
    .collection(COLLECTIONS.FORM_SUBMISSIONS)
    .findOne({ submissionId })
  
  if (!submission) return false
  
  const currentScores = (submission as any).scores || []
  const existingIndex = currentScores.findIndex((s: SectionScore) => s.sectionId === sectionId)
  
  const newScore: SectionScore = {
    sectionId,
    sectionTitle: sectionId, // Will be updated with actual title
    score,
    maxScore: 100,
    comments,
    scoredBy,
    scoredAt: new Date(),
  }
  
  if (existingIndex >= 0) {
    currentScores[existingIndex] = newScore
  } else {
    currentScores.push(newScore)
  }
  
  // Calculate total score
  const totalScore = currentScores.reduce((sum: number, s: SectionScore) => sum + s.score, 0) / 
    Math.max(currentScores.length, 1)
  
  const result = await db
    .collection(COLLECTIONS.FORM_SUBMISSIONS)
    .updateOne(
      { submissionId },
      {
        $set: {
          scores: currentScores,
          totalScore,
          updatedAt: new Date(),
        }
      }
    )
  
  return result.modifiedCount > 0
}

// ============================================================================
// REPORTS & CERTIFICATES (CAR)
// ============================================================================

export async function addReport(
  submissionId: string,
  document: UploadedDocument
): Promise<boolean> {
  const db = await getDb()
  
  const result = await db
    .collection(COLLECTIONS.FORM_SUBMISSIONS)
    .updateOne(
      { submissionId },
      {
        $push: { reports: document } as any,
        $set: { updatedAt: new Date() }
      }
    )
  
  return result.modifiedCount > 0
}

export async function removeReport(
  submissionId: string,
  documentId: string
): Promise<boolean> {
  const db = await getDb()
  
  const result = await db
    .collection(COLLECTIONS.FORM_SUBMISSIONS)
    .updateOne(
      { submissionId },
      {
        $pull: { reports: { id: documentId } } as any,
        $set: { updatedAt: new Date() }
      }
    )
  
  return result.modifiedCount > 0
}

export async function setCertificate(
  submissionId: string,
  certificate: UploadedDocument
): Promise<boolean> {
  const db = await getDb()
  
  const result = await db
    .collection(COLLECTIONS.FORM_SUBMISSIONS)
    .updateOne(
      { submissionId },
      {
        $set: { 
          certificate,
          status: "approved" as SubmissionStatus,
          approvedAt: new Date(),
          updatedAt: new Date(),
        }
      }
    )
  
  return result.modifiedCount > 0
}

// ============================================================================
// NOTIFICATIONS
// ============================================================================

export async function createNotification(
  params: {
    recipientId: string
    recipientRole: "client" | "collaborator" | "admin" | "auditor"
    type: NotificationType
    title: string
    message: string
    formId: string
    submissionId: string
    companyName: string
    sectionId?: string
    fieldId?: string
    senderId?: string
    senderName?: string
    senderRole?: string
  }
): Promise<FormNotification> {
  const db = await getDb()
  
  const notification: FormNotification = {
    notificationId: nanoid(12),
    recipientId: params.recipientId,
    recipientRole: params.recipientRole,
    type: params.type,
    title: params.title,
    message: params.message,
    formId: params.formId,
    submissionId: params.submissionId,
    companyName: params.companyName,
    sectionId: params.sectionId,
    fieldId: params.fieldId,
    senderId: params.senderId,
    senderName: params.senderName,
    senderRole: params.senderRole,
    isRead: false,
    isEmailSent: false,
    createdAt: new Date(),
  }
  
  const result = await db
    .collection(COLLECTIONS.FORM_NOTIFICATIONS)
    .insertOne(notification)
  
  return { ...notification, _id: result.insertedId }
}

export async function getUserNotifications(
  userId: string,
  params?: { unreadOnly?: boolean; limit?: number }
): Promise<FormNotification[]> {
  const db = await getDb()
  
  const query: Record<string, any> = { recipientId: userId }
  if (params?.unreadOnly) query.isRead = false
  
  const notifications = await db
    .collection(COLLECTIONS.FORM_NOTIFICATIONS)
    .find(query)
    .sort({ createdAt: -1 })
    .limit(params?.limit || 50)
    .toArray()
  
  return notifications as unknown as FormNotification[]
}

export async function markNotificationRead(notificationId: string): Promise<boolean> {
  const db = await getDb()
  
  const result = await db
    .collection(COLLECTIONS.FORM_NOTIFICATIONS)
    .updateOne(
      { notificationId },
      { $set: { isRead: true, readAt: new Date() } }
    )
  
  return result.modifiedCount > 0
}

export async function markAllNotificationsRead(userId: string): Promise<boolean> {
  const db = await getDb()
  
  const result = await db
    .collection(COLLECTIONS.FORM_NOTIFICATIONS)
    .updateMany(
      { recipientId: userId, isRead: false },
      { $set: { isRead: true, readAt: new Date() } }
    )
  
  return result.modifiedCount > 0
}

export async function getUnreadNotificationCount(userId: string): Promise<number> {
  const db = await getDb()
  
  return await db
    .collection(COLLECTIONS.FORM_NOTIFICATIONS)
    .countDocuments({ recipientId: userId, isRead: false })
}

// ============================================================================
// FORM ASSIGNMENTS
// ============================================================================

export async function assignFormToCollaborator(
  params: {
    collaboratorId: string
    collaboratorName: string
    collaboratorEmail: string
    formId: string
    formName: string
    assignedBy: {
      userId: string
      name: string
      role: "client"
    }
    clientId: string
    companyId: string
    companyName: string
  }
): Promise<FormAssignment> {
  const db = await getDb()
  
  // Check if already assigned
  const existing = await db
    .collection(COLLECTIONS.FORM_ASSIGNMENTS)
    .findOne({
      collaboratorId: params.collaboratorId,
      formId: params.formId,
      clientId: params.clientId,
      isActive: true,
    })
  
  if (existing) {
    return existing as unknown as FormAssignment
  }
  
  const assignment: FormAssignment = {
    assignmentId: nanoid(12),
    collaboratorId: params.collaboratorId,
    collaboratorName: params.collaboratorName,
    collaboratorEmail: params.collaboratorEmail,
    formId: params.formId,
    formName: params.formName,
    assignedBy: params.assignedBy,
    clientId: params.clientId,
    companyId: params.companyId,
    companyName: params.companyName,
    isActive: true,
    assignedAt: new Date(),
  }
  
  const result = await db
    .collection(COLLECTIONS.FORM_ASSIGNMENTS)
    .insertOne(assignment)
  
  return { ...assignment, _id: result.insertedId }
}

export async function revokeFormAssignment(assignmentId: string): Promise<boolean> {
  const db = await getDb()
  
  const result = await db
    .collection(COLLECTIONS.FORM_ASSIGNMENTS)
    .updateOne(
      { assignmentId },
      { $set: { isActive: false, revokedAt: new Date() } }
    )
  
  return result.modifiedCount > 0
}

export async function getCollaboratorAssignments(
  collaboratorId: string,
  clientId?: string
): Promise<FormAssignment[]> {
  const db = await getDb()
  
  const query: Record<string, any> = {
    collaboratorId,
    isActive: true,
  }
  
  if (clientId) query.clientId = clientId
  
  const assignments = await db
    .collection(COLLECTIONS.FORM_ASSIGNMENTS)
    .find(query)
    .sort({ assignedAt: -1 })
    .toArray()
  
  return assignments as unknown as FormAssignment[]
}

export async function getClientCollaboratorAssignments(
  clientId: string
): Promise<FormAssignment[]> {
  const db = await getDb()
  
  const assignments = await db
    .collection(COLLECTIONS.FORM_ASSIGNMENTS)
    .find({ clientId, isActive: true })
    .sort({ assignedAt: -1 })
    .toArray()
  
  return assignments as unknown as FormAssignment[]
}

export async function isFormAssignedToCollaborator(
  collaboratorId: string,
  formId: string,
  clientId: string
): Promise<boolean> {
  const db = await getDb()
  
  const assignment = await db
    .collection(COLLECTIONS.FORM_ASSIGNMENTS)
    .findOne({
      collaboratorId,
      formId,
      clientId,
      isActive: true,
    })
  
  return !!assignment
}
