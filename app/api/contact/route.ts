import { NextRequest, NextResponse } from "next/server"
import { getDb } from "@/lib/mongodb"
import { sendEmail } from "@/lib/email"
import { notifyNewContact } from "@/lib/notifications/notification-service"
import { verifySession } from "@/lib/auth"

// Purpose labels for better display
const purposeLabels: Record<string, string> = {
  "general": "General Inquiry",
  "collaboration": "Collaboration Opportunity",
  "research": "Research Query",
  "teaching": "Teaching Inquiry",
  "speaking": "Speaking Engagement",
}

function parseCookies(cookieHeader: string | null) {
  if (!cookieHeader) return {}
  return Object.fromEntries(
    cookieHeader
      .split(";")
      .map(c => c.trim().split("="))
      .map(([k, v]) => [k, decodeURIComponent(v || "")])
  )
}

// GET - Fetch contacts (admin only)
export async function GET(req: NextRequest) {
  try {
    const cookieHeader = req.headers.get("cookie")
    const cookies = parseCookies(cookieHeader)
    const session = cookies.session

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const payload = verifySession(session)
    if (!payload || (payload as any).role !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    const db = await getDb()
    const contacts = await db
      .collection("contact_submissions")
      .find({})
      .sort({ createdAt: -1 })
      .toArray()

    // Transform _id to string
    const transformedContacts = contacts.map((c: any) => ({
      ...c,
      _id: c._id.toString(),
      name: c.fullName,
    }))

    return NextResponse.json({ contacts: transformedContacts })
  } catch (error) {
    console.error("GET /api/contact error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// Email template for admin notification
function adminNotificationTemplate(data: {
  fullName: string
  email: string
  phone?: string
  purpose: string
  message: string
  submittedAt: string
}) {
  const purposeLabel = purposeLabels[data.purpose] || data.purpose
  
  return {
    subject: `New Contact Form Submission - ${purposeLabel}`,
    text: `
New Contact Form Submission

From: ${data.fullName}
Email: ${data.email}
Phone: ${data.phone || "Not provided"}
Purpose: ${purposeLabel}

Message:
${data.message}

Submitted: ${new Date(data.submittedAt).toLocaleString()}

---
This is an automated notification from Academic Portfolio Contact Form.
    `.trim(),
    html: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #00afef 0%, #4169e1 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
    .content { background: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; border-top: none; }
    .field { margin-bottom: 15px; }
    .label { font-weight: bold; color: #374151; font-size: 12px; text-transform: uppercase; }
    .value { margin-top: 4px; color: #111827; }
    .message-box { background: white; padding: 15px; border-radius: 8px; border: 1px solid #e5e7eb; margin-top: 10px; }
    .footer { text-align: center; padding: 20px; font-size: 12px; color: #6b7280; }
    .badge { display: inline-block; background: #dbeafe; color: #1d4ed8; padding: 4px 12px; border-radius: 20px; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin: 0; font-size: 20px;">📩 New Contact Form Submission</h1>
    </div>
    <div class="content">
      <div class="field">
        <div class="label">Purpose</div>
        <div class="value"><span class="badge">${purposeLabel}</span></div>
      </div>
      <div class="field">
        <div class="label">From</div>
        <div class="value">${data.fullName}</div>
      </div>
      <div class="field">
        <div class="label">Email</div>
        <div class="value"><a href="mailto:${data.email}">${data.email}</a></div>
      </div>
      <div class="field">
        <div class="label">Phone</div>
        <div class="value">${data.phone || "Not provided"}</div>
      </div>
      <div class="field">
        <div class="label">Message</div>
        <div class="message-box">${data.message.replace(/\n/g, "<br>")}</div>
      </div>
      <div class="field">
        <div class="label">Submitted At</div>
        <div class="value">${new Date(data.submittedAt).toLocaleString()}</div>
      </div>
    </div>
    <div class="footer">
      <p>This is an automated notification from Academic Portfolio</p>
    </div>
  </div>
</body>
</html>
    `.trim()
  }
}

// Email template for user confirmation
function userConfirmationTemplate(data: {
  fullName: string
  purpose: string
  message: string
}) {
  const purposeLabel = purposeLabels[data.purpose] || data.purpose
  
  return {
    subject: `We've received your message - Dr. Ngozi Blessing Umoru`,
    text: `
Hello ${data.fullName},

Thank you for contacting me!

I have received your message regarding "${purposeLabel}" and will review it shortly. You can expect a response within 24-48 business hours.

Your Message:
${data.message}

If your inquiry is urgent, please don't hesitate to reach out through alternative channels.

Best regards,
Dr. Ngozi Blessing Umoru

---
This is an automated confirmation. Please do not reply to this email.
    `.trim(),
    html: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #00afef 0%, #4169e1 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; text-align: center; }
    .content { background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; border-top: none; }
    .message-box { background: white; padding: 15px; border-radius: 8px; border: 1px solid #e5e7eb; margin: 20px 0; }
    .footer { text-align: center; padding: 20px; font-size: 12px; color: #6b7280; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px; }
    .highlight { color: #00afef; }
    .badge { display: inline-block; background: #dbeafe; color: #1d4ed8; padding: 4px 12px; border-radius: 20px; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin: 0; font-size: 24px;">✅ Message Received!</h1>
    </div>
    <div class="content">
      <p>Hello <strong>${data.fullName}</strong>,</p>
      <p>Thank you for contacting me!</p>
      <p>I have received your message regarding <span class="badge">${purposeLabel}</span> and will review it shortly. You can expect a response within <strong>24-48 business hours</strong>.</p>
      
      <div class="message-box">
        <p style="margin: 0 0 10px 0; font-weight: bold; color: #374151;">Your Message:</p>
        <p style="margin: 0; color: #6b7280;">${data.message.replace(/\n/g, "<br>")}</p>
      </div>
      
      <p>If your inquiry is urgent, please reach out through alternative channels.</p>
      
      <p>Best regards,<br><strong>Dr. Ngozi Blessing Umoru</strong></p>
    </div>
    <div class="footer">
      <p>This is an automated confirmation. Please do not reply to this email.</p>
      <p>© ${new Date().getFullYear()} Academic Portfolio. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
    `.trim()
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { fullName, email, purpose, phone, message, agreePolicy } = body

    // Validation
    if (!fullName || !email || !purpose || !message) {
      return NextResponse.json(
        { error: "Please fill in all required fields" },
        { status: 400 }
      )
    }

    if (!agreePolicy) {
      return NextResponse.json(
        { error: "Please agree to the Privacy Policy" },
        { status: 400 }
      )
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Please enter a valid email address" },
        { status: 400 }
      )
    }

    const db = await getDb()
    const submittedAt = new Date().toISOString()

    // Store in database
    const contactSubmission = {
      fullName,
      email,
      purpose,
      phone: phone || null,
      message,
      agreedToPolicy: agreePolicy,
      status: "unread",
      submittedAt,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await db.collection("contact_submissions").insertOne(contactSubmission)
    console.log("[POST /api/contact] Contact saved with ID:", result.insertedId.toString())

    // Create in-app notification for admin (with optional email)
    try {
      console.log("[POST /api/contact] Calling notifyNewContact...")
      await notifyNewContact({
        id: result.insertedId.toString(),
        fullName,
        email,
        phone,
        purpose,
        subject: purposeLabels[purpose] || purpose,
        message,
        submittedAt: new Date(submittedAt),
      })
      console.log("[POST /api/contact] notifyNewContact completed")
    } catch (notifError) {
      console.error("[POST /api/contact] Failed to create notification:", notifError)
      // Don't fail the request if notification fails
    }

    // Send confirmation email to user
    try {
      const userTemplate = userConfirmationTemplate({
        fullName,
        purpose,
        message,
      })
      await sendEmail({
        to: email,
        ...userTemplate,
      })
    } catch (emailError) {
      console.error("Failed to send user confirmation email:", emailError)
      // Don't fail the request if email fails
    }

    return NextResponse.json({
      success: true,
      message: "Thank you for your message! We'll get back to you within 24-48 hours.",
      id: result.insertedId,
    })
  } catch (error) {
    console.error("Contact form submission error:", error)
    return NextResponse.json(
      { error: "Failed to submit your message. Please try again later." },
      { status: 500 }
    )
  }
}
