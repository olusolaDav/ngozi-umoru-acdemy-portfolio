import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || "change-me"
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d"

export async function hashPassword(password: string) {
  const salt = await bcrypt.genSalt(10)
  return bcrypt.hash(password, salt)
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash)
}

export function signSession(payload: object, expiresIn = JWT_EXPIRES_IN) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn })
}

export function verifySession(token: string) {
  try {
    return jwt.verify(token, JWT_SECRET) as any
  } catch (err) {
    return null
  }
}

export function generateOTP(length = 6) {
  const min = Math.pow(10, length - 1)
  const max = Math.pow(10, length) - 1
  return String(Math.floor(Math.random() * (max - min + 1)) + min)
}

export function createSetCookieHeader(name: string, value: string, opts: { maxAge?: number; path?: string; httpOnly?: boolean; secure?: boolean } = {}) {
  const parts: string[] = []
  parts.push(`${name}=${value}`)
  if (opts.maxAge) parts.push(`Max-Age=${opts.maxAge}`)
  parts.push(`Path=${opts.path || "/"}`)
  if (opts.httpOnly) parts.push("HttpOnly")
  if (opts.secure) parts.push("Secure")
  parts.push("SameSite=Lax")
  return parts.join("; ")
}

// Rate-limiting helpers
const RATE_LIMIT_WINDOW = 15 * 60 * 1000 // 15 minutes
const LOGIN_MAX_ATTEMPTS = 5
const VERIFY_MAX_ATTEMPTS = 10

export async function checkRateLimit(db: any, key: string, maxAttempts: number, windowMs: number = RATE_LIMIT_WINDOW) {
  const collection = db.collection("rate_limits")
  const now = new Date()
  const windowStart = new Date(now.getTime() - windowMs)

  // Find or create rate limit record
  const record = await collection.findOne({ key, createdAt: { $gt: windowStart } })

  if (!record) {
    // First attempt in this window
    await collection.insertOne({ key, count: 1, createdAt: now, expiresAt: new Date(now.getTime() + windowMs) })
    return { allowed: true, remaining: maxAttempts - 1 }
  }

  if (record.count >= maxAttempts) {
    return { allowed: false, remaining: 0, retryAfter: Math.ceil((record.expiresAt.getTime() - now.getTime()) / 1000) }
  }

  // Increment attempt
  await collection.updateOne({ _id: record._id }, { $inc: { count: 1 } })
  return { allowed: true, remaining: maxAttempts - record.count - 1 }
}

export async function resetRateLimit(db: any, key: string) {
  const collection = db.collection("rate_limits")
  await collection.deleteOne({ key })
}
