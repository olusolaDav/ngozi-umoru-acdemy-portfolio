// GET: Get submission details for review
// PATCH: Update submission (add report, certificate, score)
// POST: Add review/flag/comment

import { NextRequest, NextResponse } from "next/server"
import { verifySession } from "@/lib/auth"
import {
  getFormSubmission,
  getFormReviews,
  addFormReview,
  clearFieldFlag,
  clearSectionFlags,
  clearAllFlags,
  addReport,
  removeReport,
  setCertificate,
  updateSectionScore,
  getFormDefinition,
} from "@/lib/forms/form-db"
import { createFormNotifications } from "@/lib/forms/form-notifications"
import { nanoid } from "nanoid"

function parseCookies(cookieHeader: string | null) {
  if (!cookieHeader) return {}
  return Object.fromEntries(
    cookieHeader
      .split(";")
      .map((c) => c.trim().split("="))
      .map(([k, v]) => [k, decodeURIComponent(v)])
  )
}

// GET: Get submission details with reviews
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ submissionId: string }> }
) {
  try {
    const cookieHeader = request.headers.get("cookie")
    const cookies = parseCookies(cookieHeader)
    const session = cookies.session

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const payload = verifySession(session) as any
    if (!payload || payload.role !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    const { submissionId } = await params

    const submission = await getFormSubmission(submissionId)
    if (!submission) {
      return NextResponse.json({ error: "Submission not found" }, { status: 404 })
    }

    const reviews = await getFormReviews(submissionId)
    const formDef = await getFormDefinition(submission.formId)

    return NextResponse.json({
      success: true,
      submission,
      reviews,
      formDefinition: formDef,
    })
  } catch (error) {
    console.error("Error fetching submission:", error)
    return NextResponse.json(
      { error: "Failed to fetch submission" },
      { status: 500 }
    )
  }
}

// POST: Add review/flag/comment or handle actions
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ submissionId: string }> }
) {
  try {
    const cookieHeader = request.headers.get("cookie")
    const cookies = parseCookies(cookieHeader)
    const session = cookies.session

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const payload = verifySession(session) as any
    if (!payload || payload.role !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    const { submissionId } = await params
    const body = await request.json()
    const { action } = body

    const submission = await getFormSubmission(submissionId)
    if (!submission) {
      return NextResponse.json({ error: "Submission not found" }, { status: 404 })
    }

    const formDef = await getFormDefinition(submission.formId)

    switch (action) {
      case "add_review":
      case "add_flag":
      case "add_comment": {
        const { sectionId, fieldId, content, type } = body
        
        if (!content) {
          return NextResponse.json({ error: "Content is required" }, { status: 400 })
        }

        const reviewType = action === "add_flag" ? "flag" : (type || "comment")

        const review = await addFormReview({
          submissionId,
          formId: submission.formId,
          reviewerId: payload.userId,
          reviewerName: payload.name,
          reviewerRole: "admin",
          sectionId,
          fieldId,
          type: reviewType,
          content,
        })

        // Send notifications
        if (reviewType === "flag") {
          const updatedSubmission = await getFormSubmission(submissionId)
          if (updatedSubmission) {
            await createFormNotifications({
              type: "form_flagged",
              submission: updatedSubmission,
              formName: formDef?.name || submission.formId,
              reviewerName: payload.name,
              reviewContent: content,
              sectionId,
              fieldId,
            })
          }
        } else if (reviewType === "comment") {
          await createFormNotifications({
            type: "review_added",
            submission,
            formName: formDef?.name || submission.formId,
            reviewerName: payload.name,
            reviewContent: content,
            sectionId,
            fieldId,
          })
        }

        return NextResponse.json({
          success: true,
          message: `${reviewType === "flag" ? "Flag" : "Review"} added successfully`,
          review,
        })
      }

      case "clear_flag": {
        const { fieldId } = body
        
        if (!fieldId) {
          return NextResponse.json({ error: "Field ID is required" }, { status: 400 })
        }

        await clearFieldFlag(submissionId, fieldId, {
          userId: payload.userId,
          name: payload.name,
        })

        return NextResponse.json({
          success: true,
          message: "Flag cleared successfully",
        })
      }

      case "clear_section": {
        const { sectionId } = body
        
        if (!sectionId) {
          return NextResponse.json({ error: "Section ID is required" }, { status: 400 })
        }

        await clearSectionFlags(submissionId, sectionId, {
          userId: payload.userId,
          name: payload.name,
        })

        return NextResponse.json({
          success: true,
          message: "Section flags cleared successfully",
        })
      }

      case "clear_all": {
        await clearAllFlags(submissionId, {
          userId: payload.userId,
          name: payload.name,
        })

        // Send notification
        const clearedSubmission = await getFormSubmission(submissionId)
        if (clearedSubmission) {
          await createFormNotifications({
            type: "form_cleared",
            submission: clearedSubmission,
            formName: formDef?.name || submission.formId,
            reviewerName: payload.name,
          })
        }

        return NextResponse.json({
          success: true,
          message: "All flags cleared successfully",
        })
      }

      case "upload_report": {
        const { name, url, type: fileType, size } = body.document

        if (!name || !url) {
          return NextResponse.json({ error: "Document name and URL required" }, { status: 400 })
        }

        await addReport(submissionId, {
          id: nanoid(12),
          name,
          url,
          type: fileType || "application/pdf",
          size: size || 0,
          uploadedBy: {
            userId: payload.userId,
            name: payload.name,
            role: "admin",
          },
          uploadedAt: new Date(),
        })

        return NextResponse.json({
          success: true,
          message: "Report uploaded successfully",
        })
      }

      case "remove_report": {
        const { documentId } = body
        
        if (!documentId) {
          return NextResponse.json({ error: "Document ID required" }, { status: 400 })
        }

        await removeReport(submissionId, documentId)

        return NextResponse.json({
          success: true,
          message: "Report removed successfully",
        })
      }

      case "upload_certificate": {
        const { name, url, type: fileType, size } = body.document

        if (!name || !url) {
          return NextResponse.json({ error: "Certificate name and URL required" }, { status: 400 })
        }

        await setCertificate(submissionId, {
          id: nanoid(12),
          name,
          url,
          type: fileType || "application/pdf",
          size: size || 0,
          uploadedBy: {
            userId: payload.userId,
            name: payload.name,
            role: "admin",
          },
          uploadedAt: new Date(),
        })

        return NextResponse.json({
          success: true,
          message: "Certificate uploaded and submission approved",
        })
      }

      case "update_score": {
        const { sectionId, score, comments } = body

        if (!sectionId || score === undefined) {
          return NextResponse.json({ error: "Section ID and score required" }, { status: 400 })
        }

        if (score < 0 || score > 100) {
          return NextResponse.json({ error: "Score must be between 0 and 100" }, { status: 400 })
        }

        await updateSectionScore(submissionId, sectionId, score, comments || "", {
          userId: payload.userId,
          name: payload.name,
        })

        // Add a score review record
        await addFormReview({
          submissionId,
          formId: submission.formId,
          reviewerId: payload.userId,
          reviewerName: payload.name,
          reviewerRole: "admin",
          sectionId,
          type: "score",
          content: `Score updated to ${score}/100${comments ? `: ${comments}` : ""}`,
        })

        return NextResponse.json({
          success: true,
          message: "Score updated successfully",
        })
      }

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }
  } catch (error) {
    console.error("Error processing submission action:", error)
    return NextResponse.json(
      { error: "Failed to process action" },
      { status: 500 }
    )
  }
}
