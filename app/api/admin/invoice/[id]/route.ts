import { NextResponse } from "next/server"
import { verifySession, hashPassword } from "@/lib/auth"
import { getDb } from "@/lib/mongodb"
import { ObjectId } from "mongodb"
import { sendEmail } from "@/lib/email"
import { v4 as uuidv4 } from "uuid"

function parseCookies(cookieHeader: string | null) {
  if (!cookieHeader) return {}
  return Object.fromEntries(
    cookieHeader
      .split(";")
      .map((c) => c.trim().split("="))
      .map(([k, v]) => [k, decodeURIComponent(v)])
  )
}

function getCurrencySymbol(currency: string): string {
  const symbols: Record<string, string> = {
    NGN: "₦",
    USD: "$",
    EUR: "€",
    GBP: "£",
  }
  return symbols[currency] || currency
}

function formatDate(date: Date | string): string {
  const d = new Date(date)
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })
}

// Email template for invoice
function invoiceEmailTemplate(invoice: any, isNewClient: boolean, tempPassword?: string) {
  const currencySymbol = getCurrencySymbol(invoice.currency)
  const appUrl = process.env.APP_URL || "http://localhost:3000"

  const itemsHtml = invoice.items
    .map(
      (item: any) => `
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #e2e8f0;">${item.description}</td>
          <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; text-align: center;">${item.quantity}</td>
          <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; text-align: right;">${currencySymbol}${item.unitPrice.toLocaleString()}</td>
          <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; text-align: right;">${currencySymbol}${(item.quantity * item.unitPrice).toLocaleString()}</td>
        </tr>
      `
    )
    .join("")

  const newClientSection = isNewClient
    ? `
      <div style="background: linear-gradient(135deg, #00afef 0%, #4169e1 100%); color: white; padding: 20px; border-radius: 8px; margin-bottom: 24px;">
        <h3 style="margin: 0 0 12px 0; font-size: 18px;">🎉 Welcome to Academic Portfolio!</h3>
        <p style="margin: 0 0 12px 0;">An account has been created for you. Use the following credentials to log in:</p>
        <p style="margin: 0;"><strong>Email:</strong> ${invoice.clientEmail}</p>
        <p style="margin: 0;"><strong>Temporary Password:</strong> ${tempPassword}</p>
        <p style="margin: 12px 0 0 0; font-size: 14px;">Please change your password after first login.</p>
      </div>
    `
    : ""

  return {
    subject: `Invoice ${invoice.invoiceNumber} from Academic Portfolio`,
    text: `You have received an invoice (${invoice.invoiceNumber}) for ${currencySymbol}${invoice.total.toLocaleString()}. Due date: ${formatDate(invoice.dueDate)}. Log in to view and pay: ${appUrl}/dashboard/invoice/${invoice._id}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #00afef 0%, #4169e1 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">Invoice from Academic Portfolio</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0;">${invoice.invoiceNumber}</p>
          </div>

          <!-- Content -->
          <div style="background: white; padding: 30px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            ${newClientSection}

            <p style="color: #475569; margin: 0 0 20px 0;">Dear ${invoice.clientName},</p>
            <p style="color: #475569; margin: 0 0 24px 0;">Please find your invoice details below:</p>

            <!-- Invoice Info -->
            <div style="background: #f1f5f9; padding: 16px; border-radius: 8px; margin-bottom: 24px;">
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 4px 0; color: #64748b;">Invoice Number:</td>
                  <td style="padding: 4px 0; color: #1e293b; font-weight: 600;">${invoice.invoiceNumber}</td>
                </tr>
                <tr>
                  <td style="padding: 4px 0; color: #64748b;">Subject:</td>
                  <td style="padding: 4px 0; color: #1e293b;">${invoice.subject}</td>
                </tr>
                <tr>
                  <td style="padding: 4px 0; color: #64748b;">Due Date:</td>
                  <td style="padding: 4px 0; color: #1e293b;">${formatDate(invoice.dueDate)}</td>
                </tr>
              </table>
            </div>

            <!-- Items Table -->
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
              <thead>
                <tr style="background: #f1f5f9;">
                  <th style="padding: 12px; text-align: left; color: #475569; font-weight: 600;">Description</th>
                  <th style="padding: 12px; text-align: center; color: #475569; font-weight: 600;">Qty</th>
                  <th style="padding: 12px; text-align: right; color: #475569; font-weight: 600;">Unit Price</th>
                  <th style="padding: 12px; text-align: right; color: #475569; font-weight: 600;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
            </table>

            <!-- Totals -->
            <div style="background: #f1f5f9; padding: 16px; border-radius: 8px; margin-bottom: 24px;">
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 4px 0; color: #64748b;">Subtotal:</td>
                  <td style="padding: 4px 0; color: #1e293b; text-align: right;">${currencySymbol}${invoice.subtotal.toLocaleString()}</td>
                </tr>
                <tr>
                  <td style="padding: 4px 0; color: #64748b;">VAT (7.5%):</td>
                  <td style="padding: 4px 0; color: #16a34a; text-align: right;">+${currencySymbol}${invoice.vat.toLocaleString()}</td>
                </tr>
                <tr style="border-top: 2px solid #e2e8f0;">
                  <td style="padding: 12px 0 4px 0; color: #1e293b; font-weight: 700; font-size: 18px;">Total:</td>
                  <td style="padding: 12px 0 4px 0; color: #1e293b; font-weight: 700; font-size: 18px; text-align: right;">${currencySymbol}${invoice.total.toLocaleString()}</td>
                </tr>
                ${
                  invoice.depositEnabled
                    ? `
                <tr>
                  <td style="padding: 4px 0; color: #64748b; font-size: 14px;">Deposit (60%):</td>
                  <td style="padding: 4px 0; color: #64748b; font-size: 14px; text-align: right;">${currencySymbol}${invoice.depositAmount.toLocaleString()}</td>
                </tr>
                <tr>
                  <td style="padding: 4px 0; color: #64748b; font-size: 14px;">Balance (40%):</td>
                  <td style="padding: 4px 0; color: #64748b; font-size: 14px; text-align: right;">${currencySymbol}${invoice.balanceAmount.toLocaleString()}</td>
                </tr>
                `
                    : ""
                }
              </table>
            </div>

            <!-- CTA Button -->
            <div style="text-align: center; margin-bottom: 24px;">
              <a href="${appUrl}/dashboard/invoice/${invoice._id}" style="display: inline-block; background: linear-gradient(135deg, #00afef 0%, #4169e1 100%); color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600;">View & Pay Invoice</a>
            </div>

            <p style="color: #64748b; font-size: 14px; margin: 0; text-align: center;">If you have any questions, please contact us at hello@ngoziumoru.info</p>
          </div>

          <!-- Footer -->
          <div style="text-align: center; padding: 20px; color: #64748b; font-size: 12px;">
            <p style="margin: 0;">© ${new Date().getFullYear()} Academic Portfolio Limited. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  }
}

// GET single invoice
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
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
    const invoicesCollection = db.collection("invoices")

    let invoice
    try {
      invoice = await invoicesCollection.findOne({ _id: new ObjectId(id) })
    } catch {
      return NextResponse.json({ error: "Invalid invoice ID" }, { status: 400 })
    }

    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 })
    }

    return NextResponse.json({
      invoice: {
        ...invoice,
        _id: invoice._id.toString(),
      },
    })
  } catch (error: any) {
    console.error("Error fetching invoice:", error)
    return NextResponse.json({ error: "Failed to fetch invoice" }, { status: 500 })
  }
}

// UPDATE invoice
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
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

    const body = await req.json()
    const { action, ...updateData } = body

    const db = await getDb()
    const invoicesCollection = db.collection("invoices")
    const usersCollection = db.collection("users")

    let invoice
    try {
      invoice = await invoicesCollection.findOne({ _id: new ObjectId(id) })
    } catch {
      return NextResponse.json({ error: "Invalid invoice ID" }, { status: 400 })
    }

    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 })
    }

    // Handle different actions
    if (action === "send") {
      // Send invoice to client
      if (invoice.status !== "draft") {
        return NextResponse.json({ error: "Only draft invoices can be sent" }, { status: 400 })
      }

      let tempPassword: string | undefined
      let newClientId: string | undefined

      // If this is a new client, create the user account first
      if (invoice.isNewClient) {
        // Check if user already exists
        const existingUser = await usersCollection.findOne({ email: invoice.clientEmail })

        if (!existingUser) {
          // Generate temporary password
          tempPassword = uuidv4().slice(0, 10)
          const passwordHash = await hashPassword(tempPassword)

          const newUser = {
            email: invoice.clientEmail,
            name: invoice.clientName,
            role: "client",
            passwordHash,
            emailVerified: false,
            mustChangePassword: true,
            verificationCode: null,
            verificationExpires: null,
            createdAt: new Date(),
            companyName: invoice.clientName,
            sector: invoice.newClientSector || null,
            status: "active",
          }

          const result = await usersCollection.insertOne(newUser)
          newClientId = result.insertedId.toString()

          // Update invoice with new client ID
          await invoicesCollection.updateOne(
            { _id: new ObjectId(id) },
            { $set: { clientId: newClientId, isNewClient: false } }
          )
        } else {
          newClientId = existingUser._id.toString()
        }
      }

      // Update invoice status to sent
      await invoicesCollection.updateOne(
        { _id: new ObjectId(id) },
        { $set: { status: "sent", sentAt: new Date(), updatedAt: new Date() } }
      )

      // Send email to client
      const updatedInvoice = await invoicesCollection.findOne({ _id: new ObjectId(id) })
      const emailTemplate = invoiceEmailTemplate(
        { ...updatedInvoice, _id: id },
        !!tempPassword,
        tempPassword
      )
      await sendEmail({
        to: invoice.clientEmail,
        subject: emailTemplate.subject,
        text: emailTemplate.text,
        html: emailTemplate.html,
      })

      return NextResponse.json({
        success: true,
        message: "Invoice sent successfully",
        newClientCreated: !!tempPassword,
      })
    }

    // Regular update (for draft invoices)
    if (invoice.status !== "draft") {
      return NextResponse.json({ error: "Only draft invoices can be edited" }, { status: 400 })
    }

    // Recalculate totals if items are updated
    if (updateData.items) {
      const subtotal = updateData.items.reduce(
        (sum: number, item: any) => sum + item.quantity * item.unitPrice,
        0
      )
      const vat = (subtotal * 7.5) / 100
      const total = subtotal + vat
      const depositEnabled = updateData.depositEnabled ?? invoice.depositEnabled
      const depositAmount = depositEnabled ? Math.round(total * 0.6) : 0
      const balanceAmount = depositEnabled ? total - depositAmount : 0

      updateData.subtotal = subtotal
      updateData.vat = vat
      updateData.total = total
      updateData.depositAmount = depositAmount
      updateData.balanceAmount = balanceAmount
    }

    updateData.updatedAt = new Date()

    await invoicesCollection.updateOne({ _id: new ObjectId(id) }, { $set: updateData })

    const updatedInvoice = await invoicesCollection.findOne({ _id: new ObjectId(id) })

    return NextResponse.json({
      success: true,
      invoice: {
        ...updatedInvoice,
        _id: updatedInvoice!._id.toString(),
      },
    })
  } catch (error: any) {
    console.error("Error updating invoice:", error)
    return NextResponse.json({ error: "Failed to update invoice" }, { status: 500 })
  }
}

// DELETE invoice
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
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
    const invoicesCollection = db.collection("invoices")

    let invoice
    try {
      invoice = await invoicesCollection.findOne({ _id: new ObjectId(id) })
    } catch {
      return NextResponse.json({ error: "Invalid invoice ID" }, { status: 400 })
    }

    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 })
    }

    // Only allow deletion of draft invoices
    if (invoice.status !== "draft") {
      return NextResponse.json({ error: "Only draft invoices can be deleted" }, { status: 400 })
    }

    await invoicesCollection.deleteOne({ _id: new ObjectId(id) })

    return NextResponse.json({ success: true, message: "Invoice deleted successfully" })
  } catch (error: any) {
    console.error("Error deleting invoice:", error)
    return NextResponse.json({ error: "Failed to delete invoice" }, { status: 500 })
  }
}
