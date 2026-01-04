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

// Generate invoice number
function generateInvoiceNumber(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, "0")
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, "0")
  return `INV-${year}${month}-${random}`
}

function getCurrencySymbol(currency: string): string {
  const symbols: Record<string, string> = {
    NGN: "₦",
    USD: "$",
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

function formatDateTime(date: Date | string): string {
  const d = new Date(date)
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

// Email template for new client account creation
function newClientAccountEmail(clientName: string, clientEmail: string, tempPassword: string) {
  const appUrl = process.env.APP_URL || "http://localhost:3000"

  return {
    subject: "Welcome to Academic Portfolio - Your Account Details",
    text: `Welcome to Academic Portfolio!\n\nYour account has been created. Login at ${appUrl}/auth/login\n\nEmail: ${clientEmail}\nTemporary Password: ${tempPassword}\n\nPlease change your password after first login.`,
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
            <h1 style="color: white; margin: 0; font-size: 24px;">🎉 Welcome to Academic Portfolio!</h1>
          </div>

          <!-- Content -->
          <div style="background: white; padding: 30px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <p style="color: #475569; margin: 0 0 20px 0;">Dear ${clientName},</p>
            <p style="color: #475569; margin: 0 0 24px 0;">An account has been created for you on the Academic Portfolio platform. You can now access your invoices, make payments, and manage your account.</p>

            <!-- Credentials Box -->
            <div style="background: linear-gradient(135deg, #00afef 0%, #4169e1 100%); color: white; padding: 24px; border-radius: 12px; margin-bottom: 24px;">
              <h3 style="margin: 0 0 16px 0; font-size: 18px;">Your Login Credentials</h3>
              <p style="margin: 0 0 8px 0;"><strong>Email:</strong> ${clientEmail}</p>
              <p style="margin: 0 0 16px 0;"><strong>Temporary Password:</strong> ${tempPassword}</p>
              <p style="margin: 0; font-size: 14px; opacity: 0.9;">⚠️ Please change your password after your first login for security.</p>
            </div>

            <!-- CTA Button -->
            <div style="text-align: center; margin-bottom: 24px;">
              <a href="${appUrl}/auth/login" style="display: inline-block; background: #1e293b; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600;">Login to Your Account</a>
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

// Email template for invoice
function invoiceEmailTemplate(invoice: any) {
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
                  <td style="padding: 4px 0; color: #059669; text-align: right;">+${currencySymbol}${invoice.vat.toLocaleString()}</td>
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

export async function GET(req: Request) {
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

    const { url } = req
    const { searchParams } = new URL(url)
    const search = searchParams.get("search") || ""
    const status = searchParams.get("status") || "all"
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "20")
    const sort = searchParams.get("sort") || "newest"

    const db = await getDb()
    const invoicesCollection = db.collection("invoices")

    // Build query
    const query: any = {}

    // Search filter
    if (search) {
      query.$or = [
        { invoiceNumber: { $regex: search, $options: "i" } },
        { clientName: { $regex: search, $options: "i" } },
        { clientEmail: { $regex: search, $options: "i" } },
        { subject: { $regex: search, $options: "i" } },
      ]
    }

    // Status filter
    if (status !== "all") {
      query.status = status
    }

    // Sort options
    let sortOption: any = {}
    switch (sort) {
      case "newest":
        sortOption = { createdAt: -1 }
        break
      case "oldest":
        sortOption = { createdAt: 1 }
        break
      case "amount_high":
        sortOption = { total: -1 }
        break
      case "amount_low":
        sortOption = { total: 1 }
        break
      default:
        sortOption = { createdAt: -1 }
    }

    // Calculate skip for pagination
    const skip = (page - 1) * limit

    // Get invoices with pagination
    const invoices = await invoicesCollection
      .find(query)
      .sort(sortOption)
      .skip(skip)
      .limit(limit)
      .toArray()

    // Get total count for pagination
    const total = await invoicesCollection.countDocuments(query)

    // Get stats
    const stats = await invoicesCollection
      .aggregate([
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
            totalAmount: { $sum: "$total" },
          },
        },
      ])
      .toArray()

    const statsMap = {
      total: total,
      draft: 0,
      sent: 0,
      deposit_paid: 0,
      full_paid: 0,
      paid: 0,
      totalRevenue: 0,
    }

    stats.forEach((s) => {
      if (s._id in statsMap) {
        statsMap[s._id as keyof typeof statsMap] = s.count
      }
      if (s._id === "full_paid" || s._id === "paid") {
        statsMap.totalRevenue += s.totalAmount
      }
    })

    return NextResponse.json({
      invoices: invoices.map((inv) => ({
        ...inv,
        _id: inv._id.toString(),
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      stats: statsMap,
    })
  } catch (error: any) {
    console.error("Error fetching invoices:", error)
    return NextResponse.json({ error: "Failed to fetch invoices" }, { status: 500 })
  }
}

export async function POST(req: Request) {
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

    const body = await req.json()
    const {
      clientId,
      clientName,
      clientEmail,
      clientPhone,
      subject,
      dueDate,
      currency,
      items,
      invoiceType,
      depositEnabled,
      status, // 'draft' or 'sent'
      sendToNewClient,
      newClientName,
      newClientEmail,
      newClientSector,
    } = body

    // Validate required fields
    if (!subject || !dueDate || !currency || !items || items.length === 0) {
      return NextResponse.json(
        { error: "Missing required fields: subject, dueDate, currency, items" },
        { status: 400 }
      )
    }

    // Either clientId or newClient info is required
    if (!sendToNewClient && !clientId) {
      return NextResponse.json({ error: "Client selection is required" }, { status: 400 })
    }

    if (sendToNewClient && (!newClientName || !newClientEmail)) {
      return NextResponse.json({ error: "New client name and email are required" }, { status: 400 })
    }

    const db = await getDb()
    const invoicesCollection = db.collection("invoices")

    // Calculate totals
    const subtotal = items.reduce(
      (sum: number, item: any) => sum + item.quantity * item.unitPrice,
      0
    )
    const vat = (subtotal * 7.5) / 100
    const total = subtotal + vat

    // Calculate deposit and balance amounts
    const depositAmount = depositEnabled ? Math.round(total * 0.6) : 0
    const balanceAmount = depositEnabled ? total - depositAmount : 0

    // Generate invoice number
    const invoiceNumber = generateInvoiceNumber()

    // Create invoice document
    const invoice: any = {
      invoiceNumber,
      subject,
      dueDate: new Date(dueDate),
      currency,
      items: items.map((item: any) => ({
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
      })),
      subtotal,
      vat,
      total,
      invoiceType: invoiceType || "professional",
      depositEnabled: depositEnabled || false,
      depositAmount,
      balanceAmount,
      status: status || "draft",
      createdAt: new Date(),
      updatedAt: new Date(),
      payments: [],
      amountPaid: 0,
    }

    // Handle client assignment
    if (sendToNewClient) {
      invoice.clientId = null
      invoice.clientName = newClientName
      invoice.clientEmail = newClientEmail
      invoice.clientPhone = null
      invoice.isNewClient = true
      invoice.newClientSector = newClientSector || null
    } else {
      // Get client info from database
      const usersCollection = db.collection("users")
      const client = await usersCollection.findOne({ _id: new ObjectId(clientId) })

      if (!client) {
        return NextResponse.json({ error: "Client not found" }, { status: 404 })
      }

      invoice.clientId = clientId
      invoice.clientName = client.name || client.companyName || clientName
      invoice.clientEmail = client.email || clientEmail
      invoice.clientPhone = client.phone || clientPhone || null
      invoice.isNewClient = false
    }

    const result = await invoicesCollection.insertOne(invoice)
    const invoiceId = result.insertedId.toString()

    // If status is "sent", handle new client creation and send emails
    let newClientCreated = false
    if (status === "sent") {
      const usersCollection = db.collection("users")
      
      // If this is a new client, create the user account first
      if (sendToNewClient) {
        // Check if user already exists
        const existingUser = await usersCollection.findOne({ email: newClientEmail })

        if (!existingUser) {
          // Generate temporary password
          const tempPassword = uuidv4().slice(0, 10)
          const passwordHash = await hashPassword(tempPassword)

          const newUser = {
            email: newClientEmail,
            name: newClientName,
            role: "client",
            passwordHash,
            emailVerified: false,
            mustChangePassword: true,
            verificationCode: null,
            verificationExpires: null,
            createdAt: new Date(),
            companyName: newClientName,
            sector: newClientSector || null,
            status: "active",
          }

          const userResult = await usersCollection.insertOne(newUser)
          const newClientId = userResult.insertedId.toString()
          newClientCreated = true

          // Update invoice with new client ID
          await invoicesCollection.updateOne(
            { _id: result.insertedId },
            { $set: { clientId: newClientId, isNewClient: false } }
          )

          // Send account credentials email FIRST
          const accountEmail = newClientAccountEmail(newClientName, newClientEmail, tempPassword)
          await sendEmail({
            to: newClientEmail,
            subject: accountEmail.subject,
            text: accountEmail.text,
            html: accountEmail.html,
          })
        } else {
          // Update invoice with existing client ID
          await invoicesCollection.updateOne(
            { _id: result.insertedId },
            { $set: { clientId: existingUser._id.toString(), isNewClient: false } }
          )
        }
      }

      // Update invoice status to sent with timestamp
      await invoicesCollection.updateOne(
        { _id: result.insertedId },
        { $set: { sentAt: new Date() } }
      )

      // Send invoice email
      const updatedInvoice = await invoicesCollection.findOne({ _id: result.insertedId })
      const emailTemplate = invoiceEmailTemplate({ ...updatedInvoice, _id: invoiceId })
      await sendEmail({
        to: invoice.clientEmail,
        subject: emailTemplate.subject,
        text: emailTemplate.text,
        html: emailTemplate.html,
      })
    }

    return NextResponse.json({
      success: true,
      invoice: {
        ...invoice,
        _id: invoiceId,
      },
      newClientCreated,
    })
  } catch (error: any) {
    console.error("Error creating invoice:", error)
    return NextResponse.json({ error: "Failed to create invoice" }, { status: 500 })
  }
}
