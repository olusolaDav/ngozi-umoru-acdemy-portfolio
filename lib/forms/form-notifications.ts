// Form Notification Helper Functions
// Sends email and in-app notifications for form events

import { getDb } from "../mongodb"
import { sendEmail } from "../email"
import type {
  FormSubmissionData,
  NotificationType,
} from "./form-models"
import { createNotification } from "./form-db"

interface NotificationParams {
  type: NotificationType
  submission: FormSubmissionData
  formName: string
  sectionId?: string
  fieldId?: string
  reviewerName?: string
  reviewContent?: string
}

// ============================================================================
// EMAIL TEMPLATES
// ============================================================================

function getFormSubmittedEmailTemplate(params: {
  recipientName: string
  formName: string
  companyName: string
  submissionId: string
  submittedBy: string
}): { subject: string; html: string } {
  return {
    subject: `New Form Submission: ${params.formName}`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #16a34a; color: white; padding: 20px; text-align: center; }
    .content { background: #f9fafb; padding: 30px; }
    .button { display: inline-block; background: #16a34a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 20px; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
    .info-row { margin: 10px 0; }
    .info-label { font-weight: bold; color: #4b5563; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>New Form Submission</h1>
    </div>
    <div class="content">
      <p>Hello ${params.recipientName},</p>
      <p>A new form has been submitted and requires your review.</p>
      
      <div class="info-row">
        <span class="info-label">Form:</span> ${params.formName}
      </div>
      <div class="info-row">
        <span class="info-label">Company:</span> ${params.companyName}
      </div>
      <div class="info-row">
        <span class="info-label">Submitted By:</span> ${params.submittedBy}
      </div>
      <div class="info-row">
        <span class="info-label">Submission ID:</span> ${params.submissionId}
      </div>
      
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/admin/forms/${params.submissionId}" class="button">
        Review Submission
      </a>
    </div>
    <div class="footer">
      <p>This is an automated message from Academic Portfolio</p>
    </div>
  </div>
</body>
</html>
    `,
  }
}

function getFormFlaggedEmailTemplate(params: {
  recipientName: string
  formName: string
  companyName: string
  submissionId: string
  flaggedBy: string
  flagCount: number
  comment?: string
  sectionId?: string
  fieldId?: string
}): { subject: string; html: string } {
  return {
    subject: `Action Required: Form Flagged for Review - ${params.formName}`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #dc2626; color: white; padding: 20px; text-align: center; }
    .content { background: #f9fafb; padding: 30px; }
    .button { display: inline-block; background: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 20px; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
    .info-row { margin: 10px 0; }
    .info-label { font-weight: bold; color: #4b5563; }
    .alert { background: #fef2f2; border: 1px solid #fecaca; padding: 15px; border-radius: 6px; margin: 20px 0; }
    .comment { background: white; border-left: 4px solid #dc2626; padding: 15px; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Form Requires Attention</h1>
    </div>
    <div class="content">
      <p>Hello ${params.recipientName},</p>
      
      <div class="alert">
        <strong>Your form submission has been flagged for review.</strong>
        <br>Please address the flagged items and resubmit.
      </div>
      
      <div class="info-row">
        <span class="info-label">Form:</span> ${params.formName}
      </div>
      <div class="info-row">
        <span class="info-label">Company:</span> ${params.companyName}
      </div>
      <div class="info-row">
        <span class="info-label">Flagged By:</span> ${params.flaggedBy}
      </div>
      <div class="info-row">
        <span class="info-label">Flagged Fields:</span> ${params.flagCount}
      </div>
      ${params.sectionId ? `<div class="info-row"><span class="info-label">Section:</span> ${params.sectionId}</div>` : ""}
      
      ${params.comment ? `
      <div class="comment">
        <strong>Reviewer Comment:</strong>
        <p>${params.comment}</p>
      </div>
      ` : ""}
      
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/forms/${params.submissionId}?section=${params.sectionId || ""}${params.fieldId ? `&field=${params.fieldId}` : ""}" class="button">
        View & Update Form
      </a>
    </div>
    <div class="footer">
      <p>This is an automated message from Academic Portfolio</p>
    </div>
  </div>
</body>
</html>
    `,
  }
}

function getFormClearedEmailTemplate(params: {
  recipientName: string
  formName: string
  companyName: string
  submissionId: string
  clearedBy: string
}): { subject: string; html: string } {
  return {
    subject: `Form Cleared: ${params.formName}`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #16a34a; color: white; padding: 20px; text-align: center; }
    .content { background: #f9fafb; padding: 30px; }
    .button { display: inline-block; background: #16a34a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 20px; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
    .info-row { margin: 10px 0; }
    .info-label { font-weight: bold; color: #4b5563; }
    .success { background: #f0fdf4; border: 1px solid #bbf7d0; padding: 15px; border-radius: 6px; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Form Cleared ✓</h1>
    </div>
    <div class="content">
      <p>Hello ${params.recipientName},</p>
      
      <div class="success">
        <strong>Great news!</strong> Your form submission has been cleared and approved.
      </div>
      
      <div class="info-row">
        <span class="info-label">Form:</span> ${params.formName}
      </div>
      <div class="info-row">
        <span class="info-label">Company:</span> ${params.companyName}
      </div>
      <div class="info-row">
        <span class="info-label">Cleared By:</span> ${params.clearedBy}
      </div>
      
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/forms/${params.submissionId}" class="button">
        View Submission
      </a>
    </div>
    <div class="footer">
      <p>This is an automated message from Academic Portfolio</p>
    </div>
  </div>
</body>
</html>
    `,
  }
}

function getReviewAddedEmailTemplate(params: {
  recipientName: string
  formName: string
  companyName: string
  submissionId: string
  reviewerName: string
  comment: string
  sectionId?: string
  fieldId?: string
}): { subject: string; html: string } {
  return {
    subject: `New Review Comment: ${params.formName}`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #2563eb; color: white; padding: 20px; text-align: center; }
    .content { background: #f9fafb; padding: 30px; }
    .button { display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 20px; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
    .info-row { margin: 10px 0; }
    .info-label { font-weight: bold; color: #4b5563; }
    .comment { background: white; border-left: 4px solid #2563eb; padding: 15px; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>New Review Comment</h1>
    </div>
    <div class="content">
      <p>Hello ${params.recipientName},</p>
      <p>A reviewer has added a comment on your form submission.</p>
      
      <div class="info-row">
        <span class="info-label">Form:</span> ${params.formName}
      </div>
      <div class="info-row">
        <span class="info-label">Company:</span> ${params.companyName}
      </div>
      <div class="info-row">
        <span class="info-label">Reviewer:</span> ${params.reviewerName}
      </div>
      
      <div class="comment">
        <strong>Comment:</strong>
        <p>${params.comment}</p>
      </div>
      
      ${params.sectionId ? `<div class="info-row"><span class="info-label">Section:</span> ${params.sectionId}</div>` : ""}
      
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/forms/${params.submissionId}?section=${params.sectionId || ""}${params.fieldId ? `&field=${params.fieldId}` : ""}" class="button">
        View & Respond
      </a>
    </div>
    <div class="footer">
      <p>This is an automated message from Academic Portfolio</p>
    </div>
  </div>
</body>
</html>
    `,
  }
}

// ============================================================================
// NOTIFICATION CREATION
// ============================================================================

export async function createFormNotifications(params: NotificationParams) {
  const db = await getDb()
  const { type, submission, formName, sectionId, fieldId, reviewerName, reviewContent } = params

  try {
    switch (type) {
      case "form_submitted":
        await handleFormSubmittedNotifications(db, submission, formName)
        break
      case "form_flagged":
        await handleFormFlaggedNotifications(db, submission, formName, reviewerName!, reviewContent, sectionId, fieldId)
        break
      case "form_cleared":
        await handleFormClearedNotifications(db, submission, formName, reviewerName!)
        break
      case "review_added":
        await handleReviewAddedNotifications(db, submission, formName, reviewerName!, reviewContent!, sectionId, fieldId)
        break
      case "form_resubmitted":
        await handleFormResubmittedNotifications(db, submission, formName)
        break
    }
  } catch (error) {
    console.error("Error creating notifications:", error)
    // Don't throw - notifications shouldn't block the main operation
  }
}

async function handleFormSubmittedNotifications(
  db: any,
  submission: FormSubmissionData,
  formName: string
) {
  // Notify admins
  const admins = await db.collection("users").find({ role: "admin" }).toArray()
  
  for (const admin of admins) {
    // Create in-app notification
    await createNotification({
      recipientId: admin._id.toString(),
      recipientRole: "admin",
      type: "form_submitted",
      title: "New Form Submission",
      message: `${submission.companyName} submitted ${formName}`,
      formId: submission.formId,
      submissionId: submission.submissionId,
      companyName: submission.companyName,
      senderId: submission.filledBy.userId,
      senderName: submission.filledBy.name,
      senderRole: "client",
    })

    // Send email
    const emailTemplate = getFormSubmittedEmailTemplate({
      recipientName: admin.name,
      formName,
      companyName: submission.companyName,
      submissionId: submission.submissionId,
      submittedBy: submission.filledBy.name,
    })
    
    await sendEmail({
      to: admin.email,
      subject: emailTemplate.subject,
      html: emailTemplate.html,
    })
  }

  // Notify assigned auditor if any
  if (submission.assignedAuditorId) {
    const auditor = await db.collection("users").findOne({ 
      _id: submission.assignedAuditorId 
    })

    if (auditor) {
      await createNotification({
        recipientId: auditor._id.toString(),
        recipientRole: "auditor",
        type: "form_submitted",
        title: "New Form Submission",
        message: `${submission.companyName} submitted ${formName}`,
        formId: submission.formId,
        submissionId: submission.submissionId,
        companyName: submission.companyName,
        senderId: submission.filledBy.userId,
        senderName: submission.filledBy.name,
        senderRole: "client",
      })

      const emailTemplate = getFormSubmittedEmailTemplate({
        recipientName: auditor.name,
        formName,
        companyName: submission.companyName,
        submissionId: submission.submissionId,
        submittedBy: submission.filledBy.name,
      })

      await sendEmail({
        to: auditor.email,
        subject: emailTemplate.subject,
        html: emailTemplate.html,
      })
    }
  }
}

async function handleFormFlaggedNotifications(
  db: any,
  submission: FormSubmissionData,
  formName: string,
  reviewerName: string,
  comment?: string,
  sectionId?: string,
  fieldId?: string
) {
  // Notify client
  const client = await db.collection("users").findOne({ 
    _id: submission.clientId 
  })

  if (client) {
    await createNotification({
      recipientId: client._id.toString(),
      recipientRole: "client",
      type: "form_flagged",
      title: "Form Flagged for Review",
      message: `${reviewerName} flagged items in your ${formName} submission`,
      formId: submission.formId,
      submissionId: submission.submissionId,
      companyName: submission.companyName,
      sectionId,
      fieldId,
      senderName: reviewerName,
    })

    const emailTemplate = getFormFlaggedEmailTemplate({
      recipientName: client.name,
      formName,
      companyName: submission.companyName,
      submissionId: submission.submissionId,
      flaggedBy: reviewerName,
      flagCount: submission.totalFlags,
      comment,
      sectionId,
      fieldId,
    })

    await sendEmail({
      to: client.email,
      subject: emailTemplate.subject,
      html: emailTemplate.html,
    })
  }

  // Notify collaborator if the form was filled by one
  if (submission.filledBy.role === "collaborator") {
    const collaborator = await db.collection("users").findOne({
      _id: submission.filledBy.userId
    })

    if (collaborator) {
      await createNotification({
        recipientId: collaborator._id.toString(),
        recipientRole: "collaborator",
        type: "form_flagged",
        title: "Form Flagged for Review",
        message: `${reviewerName} flagged items in ${formName} for ${submission.companyName}`,
        formId: submission.formId,
        submissionId: submission.submissionId,
        companyName: submission.companyName,
        sectionId,
        fieldId,
        senderName: reviewerName,
      })
    }
  }
}

async function handleFormClearedNotifications(
  db: any,
  submission: FormSubmissionData,
  formName: string,
  clearedBy: string
) {
  // Notify client
  const client = await db.collection("users").findOne({ 
    _id: submission.clientId 
  })

  if (client) {
    await createNotification({
      recipientId: client._id.toString(),
      recipientRole: "client",
      type: "form_cleared",
      title: "Form Cleared",
      message: `Your ${formName} submission has been cleared by ${clearedBy}`,
      formId: submission.formId,
      submissionId: submission.submissionId,
      companyName: submission.companyName,
      senderName: clearedBy,
    })

    const emailTemplate = getFormClearedEmailTemplate({
      recipientName: client.name,
      formName,
      companyName: submission.companyName,
      submissionId: submission.submissionId,
      clearedBy,
    })

    await sendEmail({
      to: client.email,
      subject: emailTemplate.subject,
      html: emailTemplate.html,
    })
  }
}

async function handleReviewAddedNotifications(
  db: any,
  submission: FormSubmissionData,
  formName: string,
  reviewerName: string,
  comment: string,
  sectionId?: string,
  fieldId?: string
) {
  // Notify client
  const client = await db.collection("users").findOne({ 
    _id: submission.clientId 
  })

  if (client) {
    await createNotification({
      recipientId: client._id.toString(),
      recipientRole: "client",
      type: "review_added",
      title: "New Review Comment",
      message: `${reviewerName} added a comment on your ${formName}`,
      formId: submission.formId,
      submissionId: submission.submissionId,
      companyName: submission.companyName,
      sectionId,
      fieldId,
      senderName: reviewerName,
    })

    const emailTemplate = getReviewAddedEmailTemplate({
      recipientName: client.name,
      formName,
      companyName: submission.companyName,
      submissionId: submission.submissionId,
      reviewerName,
      comment,
      sectionId,
      fieldId,
    })

    await sendEmail({
      to: client.email,
      subject: emailTemplate.subject,
      html: emailTemplate.html,
    })
  }
}

async function handleFormResubmittedNotifications(
  db: any,
  submission: FormSubmissionData,
  formName: string
) {
  // Similar to form_submitted but with different messaging
  const admins = await db.collection("users").find({ role: "admin" }).toArray()
  
  for (const admin of admins) {
    await createNotification({
      recipientId: admin._id.toString(),
      recipientRole: "admin",
      type: "form_resubmitted",
      title: "Form Resubmitted",
      message: `${submission.companyName} resubmitted ${formName}`,
      formId: submission.formId,
      submissionId: submission.submissionId,
      companyName: submission.companyName,
      senderId: submission.filledBy.userId,
      senderName: submission.filledBy.name,
      senderRole: "client",
    })
  }

  // Notify assigned auditor
  if (submission.assignedAuditorId) {
    const auditor = await db.collection("users").findOne({ 
      _id: submission.assignedAuditorId 
    })

    if (auditor) {
      await createNotification({
        recipientId: auditor._id.toString(),
        recipientRole: "auditor",
        type: "form_resubmitted",
        title: "Form Resubmitted",
        message: `${submission.companyName} resubmitted ${formName}`,
        formId: submission.formId,
        submissionId: submission.submissionId,
        companyName: submission.companyName,
        senderId: submission.filledBy.userId,
        senderName: submission.filledBy.name,
        senderRole: "client",
      })
    }
  }
}
