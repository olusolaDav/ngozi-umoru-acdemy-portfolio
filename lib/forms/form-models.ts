// Form Models and Types for MongoDB
// This file defines the database schema for forms, submissions, reviews, and notifications

import { ObjectId } from "mongodb"

// ============================================================================
// FORM DEFINITION TYPES
// ============================================================================

export interface FormDefinition {
  _id?: ObjectId
  id: string // e.g., "car", "dpo", "lia", "dpia"
  name: string
  shortName: string
  description: string
  icon: string
  type: "compliance" | "assessment" | "audit"
  features: {
    hasReports: boolean // CAR has report uploads
    hasCertificate: boolean // CAR has certificate
    hasScoring: boolean // DPO has scoring
    hasPdfExport: boolean // LIA/DPIA can export as PDF
  }
  sections: string[] // Section IDs for this form
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

// ============================================================================
// FORM SUBMISSION TYPES
// ============================================================================

export type SubmissionStatus = 
  | "draft" 
  | "submitted" 
  | "under_review" 
  | "flagged" 
  | "reviewed" 
  | "cleared" 
  | "approved"

export interface FormSubmissionData {
  _id?: ObjectId
  submissionId: string // Unique submission ID
  formId: string // Which form type (car, dpo, lia, dpia)
  formVersion: string // Version of the form structure
  
  // Ownership
  clientId: string // ObjectId as string
  companyId: string // ObjectId as string
  companyName: string
  sector: string
  
  // Collaborator info (if filled by collaborator)
  filledBy: {
    userId: string
    name: string
    email: string
    role: "client" | "collaborator"
  }
  
  // Assigned auditor
  assignedAuditorId?: string
  assignedAuditorName?: string
  
  // Form data
  data: Record<string, any> // All form field values
  
  // Status tracking
  status: SubmissionStatus
  progress: number // 0-100
  sectionProgress: Record<string, number> // Progress per section
  
  // Flags and reviews
  flaggedFields: string[] // Field IDs that are flagged
  totalFlags: number
  clearedFlags: number
  
  // Reviews (populated from form_reviews collection)
  reviews?: FormReviewItem[]
  
  // Reports and certificates (for CAR form)
  reports?: UploadedDocument[]
  certificate?: UploadedDocument
  
  // Scores (for DPO form)
  scores?: SectionScore[]
  sectionScores?: SectionScore[] // Alias for API response
  totalScore?: number
  
  // Timestamps
  createdAt: Date
  updatedAt: Date
  submittedAt?: Date
  lastReviewedAt?: Date
  clearedAt?: Date
  approvedAt?: Date
}

// Review item structure for submission response
export interface FormReviewItem {
  reviewId: string
  reviewerId: string
  reviewerName: string
  reviewerAvatar?: string
  reviewerRole: "admin" | "auditor"
  sectionId?: string
  fieldId?: string
  type: "comment" | "flag" | "clear" | "score"
  content: string
  createdAt: string
}

export interface UploadedDocument {
  id: string
  name: string
  url: string
  type: string
  size: number
  uploadedBy: {
    userId: string
    name: string
    role: string
  }
  uploadedAt: Date
}

export interface SectionScore {
  sectionId: string
  sectionTitle: string
  score: number // 0-100
  maxScore: number
  comments?: string
  scoredBy?: {
    userId: string
    name: string
  }
  scoredAt?: Date
}

// ============================================================================
// FORM REVIEW/COMMENT TYPES
// ============================================================================

export interface FormReview {
  _id?: ObjectId
  reviewId: string
  submissionId: string
  formId: string
  
  // Who made the review
  reviewerId: string
  reviewerName: string
  reviewerAvatar?: string
  reviewerRole: "admin" | "auditor"
  
  // What was reviewed
  sectionId?: string // If reviewing a specific section
  fieldId?: string // If flagging a specific field
  
  // Review content
  type: "comment" | "flag" | "clear" | "score"
  content: string // Rich text content
  
  // Flag specific
  isFlagged?: boolean
  isCleared?: boolean
  clearedBy?: {
    userId: string
    name: string
  }
  clearedAt?: Date
  
  // Timestamps
  createdAt: Date
  updatedAt: Date
}

// ============================================================================
// FORM NOTIFICATION TYPES
// ============================================================================

export type NotificationType = 
  | "form_submitted"
  | "form_flagged"
  | "form_reviewed"
  | "form_cleared"
  | "form_approved"
  | "form_resubmitted"
  | "review_added"
  | "flag_cleared"
  | "report_uploaded"
  | "score_updated"

export interface FormNotification {
  _id?: ObjectId
  notificationId: string
  
  // Recipients
  recipientId: string
  recipientRole: "client" | "collaborator" | "admin" | "auditor"
  
  // Notification content
  type: NotificationType
  title: string
  message: string
  
  // Related entities
  formId: string
  submissionId: string
  companyName: string
  sectionId?: string
  fieldId?: string
  
  // Sender info
  senderId?: string
  senderName?: string
  senderRole?: string
  
  // Status
  isRead: boolean
  isEmailSent: boolean
  
  // Timestamps
  createdAt: Date
  readAt?: Date
}

// ============================================================================
// FORM ASSIGNMENT TYPES
// ============================================================================

export interface FormAssignment {
  _id?: ObjectId
  assignmentId: string
  
  // Who is assigned
  collaboratorId: string
  collaboratorName: string
  collaboratorEmail: string
  
  // What is assigned
  formId: string
  formName: string
  
  // Who assigned
  assignedBy: {
    userId: string
    name: string
    role: "client"
  }
  
  // Client/Company
  clientId: string
  companyId: string
  companyName: string
  
  // Status
  isActive: boolean
  
  // Timestamps
  assignedAt: Date
  revokedAt?: Date
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

export interface FormSubmissionListItem {
  _id: string
  submissionId: string
  formId: string
  formName: string
  companyName: string
  sector: string
  status: SubmissionStatus
  progress: number
  totalFlags: number
  submittedAt: string
  lastReviewedAt?: string
  assignedAuditorName?: string
}

export interface FormSubmissionDetail extends Omit<FormSubmissionData, 'reviews'> {
  reviews: FormReview[]
  notifications: FormNotification[]
}

// ============================================================================
// FORM ACTION PAYLOADS
// ============================================================================

export interface SubmitFormPayload {
  formId: string
  data: Record<string, any>
}

export interface SaveDraftPayload {
  formId: string
  submissionId?: string
  data: Record<string, any>
}

export interface AddReviewPayload {
  submissionId: string
  sectionId?: string
  fieldId?: string
  type: "comment" | "flag" | "clear" | "score"
  content: string
  score?: number
}

export interface ClearFlagPayload {
  submissionId: string
  reviewId?: string // Clear specific flag
  fieldId?: string // Clear flag on specific field
  sectionId?: string // Clear all flags in section
  clearAll?: boolean // Clear all flags
}

export interface UploadReportPayload {
  submissionId: string
  document: {
    name: string
    url: string
    type: string
    size: number
  }
}

export interface UpdateScorePayload {
  submissionId: string
  sectionId: string
  score: number
  comments?: string
}

export interface AssignFormPayload {
  collaboratorId: string
  formIds: string[]
}

// ============================================================================
// COLLECTION NAMES
// ============================================================================

export const COLLECTIONS = {
  FORM_DEFINITIONS: "form_definitions",
  FORM_SUBMISSIONS: "form_submissions",
  FORM_REVIEWS: "form_reviews",
  FORM_NOTIFICATIONS: "form_notifications",
  FORM_ASSIGNMENTS: "form_assignments",
} as const

// ============================================================================
// DEFAULT FORM DEFINITIONS
// ============================================================================

export const DEFAULT_FORM_DEFINITIONS: Omit<FormDefinition, "_id" | "createdAt" | "updatedAt">[] = [
  {
    id: "car",
    name: "NDP Act Compliance Audit Returns (CAR)",
    shortName: "Compliance Audit Returns",
    description: "Pursuant to Section 6(d) of NDP Act, 2023",
    icon: "FileText",
    type: "compliance",
    features: {
      hasReports: true,
      hasCertificate: true,
      hasScoring: false,
      hasPdfExport: true,
    },
    sections: [
      "summary",
      "corporate_info",
      "people_process",
      "principles_data_protection",
      "lawful_bases",
      "profiling_marketing",
      "data_security_controls",
      "data_access_control",
      "data_security",
      "accountability_risk",
      "accountability_record",
      "legitimate_interest",
      "cross_border",
      "data_processors",
      "report",
      "certificate",
    ],
    isActive: true,
  },
  {
    id: "dpo",
    name: "Data Protection Officer Credential Assessment",
    shortName: "DPO Assessment",
    description: "Aligned with NDPC GAID Schedule 3",
    icon: "UserCheck",
    type: "assessment",
    features: {
      hasReports: false,
      hasCertificate: false,
      hasScoring: true,
      hasPdfExport: true,
    },
    sections: [
      "summary",
      "section1_accreditation",
      "section2_training",
      "section3_examination",
      "section4_enrollment",
      "section5_cpd",
      "scores",
      "report",
    ],
    isActive: true,
  },
  {
    id: "lia",
    name: "Legitimate Interest Assessment (LIA)",
    shortName: "Legitimate Interest Assessment",
    description: "NDP Act-GAID LIA Template",
    icon: "Scale",
    type: "audit",
    features: {
      hasReports: false,
      hasCertificate: false,
      hasScoring: false,
      hasPdfExport: true,
    },
    sections: [
      "summary",
      "part1_purpose_test",
      "part2_necessity_test",
      "part3_balancing_test",
      "report",
    ],
    isActive: true,
  },
  {
    id: "dpia",
    name: "Data Privacy Impact Assessment (DPIA)",
    shortName: "Privacy Impact Assessment",
    description: "NDP Act-GAID DPIA Template",
    icon: "Shield",
    type: "audit",
    features: {
      hasReports: false,
      hasCertificate: false,
      hasScoring: false,
      hasPdfExport: true,
    },
    sections: [
      "summary",
      "general_background",
      "nature_of_processing",
      "scope_of_processing",
      "context_of_processing",
      "purpose_of_processing",
      "lawfulness_of_processing",
      "consultation",
      "proportionality_necessity",
      "data_subject_rights",
      "risk_assessment",
      "identified_risks",
      "additional_mitigation",
      "report",
    ],
    isActive: true,
  },
]

// ============================================================================
// DPO SCORING GUIDE
// ============================================================================

export const DPO_SCORING_GUIDE = {
  title: "DPO Credential Assessment Scoring Guide",
  description: "Each section is scored on a scale of 0-100 based on the following criteria:",
  sections: [
    {
      id: "section1_accreditation",
      title: "Section 1: Accreditation of Issuing Body",
      maxScore: 100,
      criteria: [
        { range: "90-100", description: "Fully accredited body with all documentation verified" },
        { range: "70-89", description: "Accredited body with minor documentation gaps" },
        { range: "50-69", description: "Partially accredited or pending accreditation" },
        { range: "30-49", description: "Limited accreditation or unverified claims" },
        { range: "0-29", description: "No accreditation or invalid documentation" },
      ],
    },
    {
      id: "section2_training",
      title: "Section 2: Training Hours Verification",
      maxScore: 100,
      criteria: [
        { range: "90-100", description: "Exceeds minimum training hours with comprehensive topics" },
        { range: "70-89", description: "Meets minimum training hours with adequate coverage" },
        { range: "50-69", description: "Slightly below requirements with gaps in coverage" },
        { range: "30-49", description: "Significantly below requirements" },
        { range: "0-29", description: "Insufficient training or no verification" },
      ],
    },
    {
      id: "section3_examination",
      title: "Section 3: Examination Requirement",
      maxScore: 100,
      criteria: [
        { range: "90-100", description: "Comprehensive examination with high pass mark achieved" },
        { range: "70-89", description: "Standard examination completed successfully" },
        { range: "50-69", description: "Basic examination with minimum pass" },
        { range: "30-49", description: "Incomplete examination or borderline pass" },
        { range: "0-29", description: "No examination or failed" },
      ],
    },
    {
      id: "section4_enrollment",
      title: "Section 4: Enrollment on NDPC Database",
      maxScore: 100,
      criteria: [
        { range: "90-100", description: "Fully enrolled with active status and all details verified" },
        { range: "70-89", description: "Enrolled with minor details pending" },
        { range: "50-69", description: "Enrollment in progress" },
        { range: "30-49", description: "Application submitted but not approved" },
        { range: "0-29", description: "Not enrolled or enrollment rejected" },
      ],
    },
    {
      id: "section5_cpd",
      title: "Section 5: Continuous Professional Development",
      maxScore: 100,
      criteria: [
        { range: "90-100", description: "Exceeds CPD requirements with documented activities" },
        { range: "70-89", description: "Meets CPD requirements" },
        { range: "50-69", description: "Partial CPD compliance" },
        { range: "30-49", description: "Below CPD requirements" },
        { range: "0-29", description: "No CPD activities or documentation" },
      ],
    },
  ],
  overallGrade: [
    { range: "90-100", grade: "A", description: "Excellent - Fully qualified DPO" },
    { range: "80-89", grade: "B", description: "Good - Qualified with minor improvements needed" },
    { range: "70-79", grade: "C", description: "Satisfactory - Meets minimum requirements" },
    { range: "60-69", grade: "D", description: "Below Average - Significant improvements needed" },
    { range: "0-59", grade: "F", description: "Unsatisfactory - Does not meet DPO requirements" },
  ],
}
