import nodemailer from "nodemailer"

type EmailOptions = {
  to: string
  subject: string
  text?: string
  html?: string
}

let transporter: nodemailer.Transporter | null = null
let etherealTestAccount: any = null

async function getTransporter() {
  if (transporter) return transporter

  const host = process.env.SMTP_HOST
  const port = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : undefined
  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASS
  // If SMTP host is provided but credentials are missing or look like placeholders, fall back to Ethereal
  const credsPresent = !!(user && pass)
  const looksLikePlaceholder = (v?: string) => !v || v.includes('ethereal') || v.includes('your-')

  if (host && port && credsPresent && !looksLikePlaceholder(user) && !looksLikePlaceholder(pass)) {
    transporter = nodemailer.createTransport({ host, port, auth: { user, pass }, tls: { rejectUnauthorized: process.env.MONGODB_TLS_ALLOW_INVALID !== 'true' } })
    return transporter
  }

  // Fallback to ethereal for development when SMTP not fully configured
  // eslint-disable-next-line no-console
  console.warn('SMTP not fully configured or using placeholder credentials — falling back to Ethereal (dev). To use a real SMTP server, set SMTP_HOST, SMTP_PORT, SMTP_USER and SMTP_PASS in your environment.')
  etherealTestAccount = await nodemailer.createTestAccount()
  transporter = nodemailer.createTransport({ host: etherealTestAccount.smtp.host, port: etherealTestAccount.smtp.port, secure: etherealTestAccount.smtp.secure, auth: { user: etherealTestAccount.user, pass: etherealTestAccount.pass } })
  return transporter
}

export async function sendEmail(opts: EmailOptions) {
  const t = await getTransporter()
  try {
    // Use Ethereal's test email when using the fallback transporter
    const fromEmail = etherealTestAccount ? etherealTestAccount.user : (process.env.EMAIL_FROM || 'hello@ngoziumoru.info')
    const fromName = 'Ngozi Umoru'
    const from = `"${fromName}" <${fromEmail}>`
    const info = await t.sendMail({ from, to: opts.to, subject: opts.subject, text: opts.text, html: opts.html })
    // log preview url when using ethereal
    const preview = nodemailer.getTestMessageUrl(info)
    if (preview) {
      // eslint-disable-next-line no-console
      console.log('Ethereal preview URL:', preview)
    }
    return info
  } catch (err: any) {
    // Provide clearer guidance on auth errors
    // eslint-disable-next-line no-console
    console.error('Failed to send email:', err && err.message ? err.message : err)
    if (err && err.code === 'EAUTH') {
      // eslint-disable-next-line no-console
      console.error('SMTP authentication failed. Check SMTP_USER and SMTP_PASS environment variables.')
    }
    throw err
  }
}

export function inviteEmailTemplate({ name, email, defaultPassword, inviteLink }: { name: string; email: string; defaultPassword: string; inviteLink: string }) {
  return {
    subject: 'You have been invited',
    text: `Hello ${name || ''},\n\nYou have been invited to join. Sign in at ${inviteLink} with email: ${email} and temporary password: ${defaultPassword}. Please change your password on first login.\n\nIf you did not expect this email, ignore it.`,
    html: `<p>Hello ${name || ''},</p><p>You have been invited to join. Sign in at <a href="${inviteLink}">${inviteLink}</a> with:</p><ul><li><strong>Email:</strong> ${email}</li><li><strong>Temporary password:</strong> ${defaultPassword}</li></ul><p>Please change your password on first login.</p>`
  }
}

export function otpEmailTemplate({ code }: { code: string }) {
  return {
    subject: 'Your Verification Code - Ngozi Umoru',
    text: `Your verification code is: ${code}\n\nThis code will expire in 10 minutes.\n\nIf you did not request this code, please ignore this email.`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #00afef; margin: 0;">Ngozi Umoru</h1>
        </div>
        <div style="background: #f9fafb; border-radius: 12px; padding: 30px; text-align: center;">
          <h2 style="color: #1f2937; margin-top: 0;">Verify Your Email</h2>
          <p style="color: #6b7280; font-size: 16px;">Use the verification code below to complete your login:</p>
          <div style="background: linear-gradient(to right, #00afef, #4169e1); border-radius: 8px; padding: 20px; margin: 20px 0;">
            <span style="font-size: 32px; font-weight: bold; color: white; letter-spacing: 8px;">${code}</span>
          </div>
          <p style="color: #9ca3af; font-size: 14px;">This code will expire in <strong>10 minutes</strong>.</p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
          <p style="color: #9ca3af; font-size: 12px;">If you did not request this verification code, you can safely ignore this email. Your account remains secure.</p>
        </div>
        <div style="text-align: center; margin-top: 20px;">
          <p style="color: #9ca3af; font-size: 12px;">© ${new Date().getFullYear()} Ngozi Umoru. All rights reserved.</p>
        </div>
      </div>
    `
  }
}

export function passwordResetEmailTemplate({ code, name }: { code: string; name: string }) {
  return {
    subject: 'Password Reset Code - Ngozi Umoru',
    text: `Hello ${name},\n\nYou have requested to reset your password. Your verification code is: ${code}\n\nThis code will expire in 10 minutes.\n\nIf you did not request this password reset, please ignore this email or contact support if you have concerns.\n\nBest regards,\nNgozi Umoru`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #00afef; margin: 0;">Ngozi Umoru</h1>
        </div>
        <div style="background: #f9fafb; border-radius: 12px; padding: 30px; text-align: center;">
          <h2 style="color: #1f2937; margin-top: 0;">Password Reset Request</h2>
          <p style="color: #6b7280; font-size: 16px;">Hello ${name},</p>
          <p style="color: #6b7280; font-size: 16px;">You have requested to reset your password. Use the verification code below:</p>
          <div style="background: linear-gradient(to right, #00afef, #4169e1); border-radius: 8px; padding: 20px; margin: 20px 0;">
            <span style="font-size: 32px; font-weight: bold; color: white; letter-spacing: 8px;">${code}</span>
          </div>
          <p style="color: #9ca3af; font-size: 14px;">This code will expire in <strong>10 minutes</strong>.</p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
          <p style="color: #9ca3af; font-size: 12px;">If you did not request this password reset, please ignore this email or contact support if you have concerns.</p>
        </div>
        <div style="text-align: center; margin-top: 20px;">
          <p style="color: #9ca3af; font-size: 12px;">© ${new Date().getFullYear()} Ngozi Umoru. All rights reserved.</p>
        </div>
      </div>
    `
  }
}
