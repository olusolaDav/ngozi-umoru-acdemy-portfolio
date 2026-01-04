import { NextRequest, NextResponse } from "next/server"
import { getDb } from "@/lib/mongodb"
import { verifySession } from "@/lib/auth"
import { sendEmail } from "@/lib/email"
import { ObjectId } from "mongodb"

function parseCookies(cookieHeader: string | null) {
  if (!cookieHeader) return {}
  return Object.fromEntries(
    cookieHeader
      .split(";")
      .map((c) => c.trim().split("="))
      .map(([k, v]) => [k, decodeURIComponent(v)])
  )
}

// Email template for reply
function replyEmailTemplate(data: {
  recipientName: string
  subject: string
  content: string
  originalMessage: string
}) {
  return {
    subject: data.subject,
    text: `
Hello ${data.recipientName},

${data.content.replace(/<[^>]+>/g, '')}

---
Original Message:
${data.originalMessage}

---
Best regards,
Academic Portfolio Team
    `.trim(),
    html: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #00afef 0%, #4169e1 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
    .content { background: #ffffff; padding: 24px; border: 1px solid #e5e7eb; border-top: none; }
    .message { margin-bottom: 24px; }
    .original { background: #f9fafb; padding: 16px; border-radius: 8px; border-left: 4px solid #00afef; margin-top: 24px; }
    .original-label { font-size: 12px; color: #6b7280; margin-bottom: 8px; text-transform: uppercase; }
    .original-content { color: #6b7280; font-size: 14px; }
    .footer { text-align: center; padding: 20px; font-size: 12px; color: #6b7280; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px; background: #f9fafb; }
    .signature { margin-top: 24px; padding-top: 16px; border-top: 1px solid #e5e7eb; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin: 0; font-size: 20px;">📧 Response from Academic Portfolio</h1>
    </div>
    <div class="content">
      <p style="margin: 0 0 16px 0;">Hello <strong>${data.recipientName}</strong>,</p>
      
      <div class="message">
        ${data.content}
      </div>
      
      <div class="original">
        <p class="original-label">Your Original Message:</p>
        <p class="original-content">${data.originalMessage.replace(/\n/g, '<br>')}</p>
      </div>
      
      <div class="signature">
        <p style="margin: 0;">Best regards,<br><strong>Academic Portfolio Team</strong></p>
      </div>
    </div>
    <div class="footer">
      <p style="margin: 0;">© ${new Date().getFullYear()} Academic Portfolio. All rights reserved.</p>
      <p style="margin: 8px 0 0 0;">360 Herbert Macaulay Way, Yaba, Lagos, Nigeria</p>
    </div>
  </div>
</body>
</html>
    `.trim()
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cookieHeader = request.headers.get("cookie")
    const cookies = parseCookies(cookieHeader)
    const session = cookies.session
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const payload = verifySession(session)
    if (!payload || (payload as any).role !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    const { id } = await params
    const body = await request.json()
    const { subject, content, recipientEmail, recipientName } = body

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid submission ID" }, { status: 400 })
    }

    if (!content || !recipientEmail) {
      return NextResponse.json({ error: "Content and recipient email are required" }, { status: 400 })
    }

    const db = await getDb()
    
    // Get the original submission
    const submission = await db.collection("contact_submissions").findOne({
      _id: new ObjectId(id),
    })

    if (!submission) {
      return NextResponse.json({ error: "Submission not found" }, { status: 404 })
    }

    // Send the reply email
    const emailTemplate = replyEmailTemplate({
      recipientName: recipientName || submission.fullName,
      subject: subject || `Re: ${submission.department} - Academic Portfolio`,
      content,
      originalMessage: submission.message,
    })

    await sendEmail({
      to: recipientEmail,
      ...emailTemplate,
    })

    // Update the submission status to replied and store the reply
    await db.collection("contact_submissions").updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          status: "replied",
          repliedAt: new Date(),
          updatedAt: new Date(),
        },
        $push: {
          replies: {
            subject,
            content,
            sentAt: new Date(),
            sentBy: (payload as any).userId || "admin",
          },
        } as any,
      }
    )

    return NextResponse.json({ success: true, message: "Reply sent successfully" })
  } catch (error: any) {
    console.error("Failed to send reply:", error)
    return NextResponse.json(
      { error: error.message || "Failed to send reply" },
      { status: 500 }
    )
  }
}
