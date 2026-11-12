import { ObjectId } from "mongodb"
import { createHash } from "node:crypto"
import { getDb, getMongoClient } from "./mongodb"
import { blogContentText, estimateBlogReadTime } from "./blog-content"

export type BlogStatus = "published" | "draft" | "scheduled"
export type CommentStatus = "published" | "pending" | "unpublished"

export interface BlogRecord {
  _id?: string | ObjectId
  title: string
  slug: string
  content: string
  excerpt?: string
  thumbnail?: string
  images?: string[]
  authorId?: string
  authorName?: string
  authorAvatar?: string
  status: BlogStatus
  tags?: string[]
  views?: number
  commentsCount?: number
  likes?: number
  shares?: number
  readTime?: number
  createdAt: string
  updatedAt: string
  publishedAt?: string
  scheduledAt?: string
}

export interface CommentRecord {
  _id?: string | ObjectId
  postId: string
  parentId?: string
  postSlug?: string
  postTitle?: string
  authorName: string
  authorEmail: string
  authorPhone?: string
  authorAvatar?: string
  subject?: string
  content: string
  status: CommentStatus
  likes?: number
  createdAt: string
  updatedAt: string
}

export class BlogSlugConflictError extends Error {
  constructor() {
    super("A blog post with this slug already exists.")
    this.name = "BlogSlugConflictError"
  }
}

async function ensureUniqueSlug(slug: string, excludeId?: ObjectId) {
  const db = await getDb()
  const query: Record<string, unknown> = { slug }
  if (excludeId) query._id = { $ne: excludeId }
  const existing = await db.collection("blogs").findOne(query)
  if (existing) throw new BlogSlugConflictError()
}

function extractFirstImage(content: string) {
  const m = content.match(/<img[^>]+src="([^"]+)"/i)
  return m ? m[1] : undefined
}

function calculateReadTime(content: string): number {
  return estimateBlogReadTime(content)
}

function generateExcerpt(content: string, maxLength = 160): string {
  const text = content.replace(/<[^>]+>/g, "")
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength).trim() + "..."
}

export async function createBlog(data: Partial<BlogRecord>) {
  const db = await getDb()
  const now = new Date().toISOString()
  const content = data.content || ""
  const slug = data.slug || `untitled-${Date.now()}`
  await ensureUniqueSlug(slug)
  
  const doc: BlogRecord = {
    title: data.title || "Untitled",
    slug,
    content: content,
    excerpt: data.excerpt || generateExcerpt(content),
    thumbnail: data.thumbnail || extractFirstImage(content) || undefined,
    images: data.images || [],
    authorId: data.authorId,
    authorName: data.authorName || "Admin",
    authorAvatar: data.authorAvatar,
    status: (data.status as BlogStatus) || "draft",
    tags: data.tags || [],
    views: data.views || 0,
    commentsCount: data.commentsCount || 0,
    likes: data.likes || 0,
    shares: data.shares || 0,
    readTime: data.readTime || calculateReadTime(content),
    createdAt: now,
    updatedAt: now,
    publishedAt: data.publishedAt,
    scheduledAt: data.scheduledAt,
  }

  const res = await db.collection("blogs").insertOne(doc as any)
  return { ...doc, _id: res.insertedId.toString() }
}

export async function updateBlog(id: string, updates: Partial<BlogRecord>) {
  const db = await getDb()
  const oid = new ObjectId(id)

  if (typeof updates.slug === "string") {
    await ensureUniqueSlug(updates.slug, oid)
  }
  
  if (typeof updates.content === "string") {
    if (!updates.thumbnail) {
      const first = extractFirstImage(updates.content)
      if (first) updates.thumbnail = first
    }
    updates.readTime = calculateReadTime(updates.content)
    if (!updates.excerpt) {
      updates.excerpt = generateExcerpt(updates.content)
    }
  }
  
  updates.updatedAt = new Date().toISOString()
  await db.collection("blogs").updateOne({ _id: oid }, { $set: updates })
  const doc = await db.collection("blogs").findOne({ _id: oid })
  if (!doc) return null
  return { ...doc, _id: doc._id.toString() }
}

export async function deleteBlog(id: string) {
  const db = await getDb()
  const oid = new ObjectId(id)
  await db.collection("comments").deleteMany({ postId: id })
  const result = await db.collection("blogs").deleteOne({ _id: oid })
  return result.deletedCount > 0
}

export async function getBlogBySlug(slug: string): Promise<(BlogRecord & { _id: string }) | null> {
  const db = await getDb()
  const doc = await db.collection("blogs").findOne(
    { slug, status: "published" },
    { sort: { publishedAt: -1, updatedAt: -1, createdAt: -1 } },
  )
  if (!doc) return null
  return { ...doc, readTime: calculateReadTime(doc.content || ""), _id: doc._id.toString() } as BlogRecord & { _id: string }
}

export async function getBlogById(id: string): Promise<(BlogRecord & { _id: string }) | null> {
  const db = await getDb()
  const doc = await db.collection("blogs").findOne({ _id: new ObjectId(id) })
  if (!doc) return null
  return { ...doc, readTime: calculateReadTime(doc.content || ""), _id: doc._id.toString() } as BlogRecord & { _id: string }
}

export async function listPublishedBlogs(limit = 20, skip = 0): Promise<Array<BlogRecord & { _id: string }>> {
  const db = await getDb()
  const cursor = db
    .collection("blogs")
    .find({ status: "published" })
    .sort({ publishedAt: -1, createdAt: -1 })
    .skip(skip)
    .limit(limit)
  const docs = await cursor.toArray()
  return docs.map((d) => ({
    ...d,
    readTime: calculateReadTime(d.content || ""),
    _id: d._id.toString(),
  } as BlogRecord & { _id: string }))
}

export async function listAllBlogs(limit = 50, skip = 0, status?: BlogStatus) {
  const db = await getDb()
  const query: any = {}
  if (status) query.status = status
  
  const cursor = db.collection("blogs").find(query).sort({ createdAt: -1 }).skip(skip).limit(limit)
  const docs = await cursor.toArray()
  const total = await db.collection("blogs").countDocuments(query)
  return { posts: docs.map((d) => ({ ...d, readTime: calculateReadTime(d.content || ""), _id: d._id.toString() })), total }
}

export async function publishBlog(id: string, opts: { title?: string; excerpt?: string; tags?: string[]; scheduledAt?: string }) {
  const db = await getDb()
  const oid = new ObjectId(id)
  const doc = await db.collection("blogs").findOne({ _id: oid })
  if (!doc) return null
  if (!blogContentText(typeof doc.content === "string" ? doc.content : "")) return null

  const thumbnail = doc.thumbnail || extractFirstImage(doc.content || "")
  const now = new Date()
  const nowIso = now.toISOString()
  
  const updates: any = {
    status: opts.scheduledAt ? "scheduled" : "published",
    updatedAt: nowIso,
    readTime: calculateReadTime(doc.content || ""),
  }
  
  if (!opts.scheduledAt) {
    updates.publishedAt = nowIso
  }
  
  if (opts.title) updates.title = opts.title
  if (opts.excerpt) updates.excerpt = opts.excerpt
  if (opts.tags) updates.tags = opts.tags
  if (opts.scheduledAt) {
    updates.scheduledAt = new Date(opts.scheduledAt).toISOString()
  }
  if (thumbnail) updates.thumbnail = thumbnail

  await db.collection("blogs").updateOne({ _id: oid }, { $set: updates })
  const updated = await db.collection("blogs").findOne({ _id: oid })
  if (!updated) return null
  return { ...updated, _id: updated._id.toString() }
}

export async function unpublishBlog(id: string) {
  const db = await getDb()
  const oid = new ObjectId(id)
  const updates = {
    status: "draft",
    updatedAt: new Date().toISOString(),
    publishedAt: null,
    scheduledAt: null,
  }
  await db.collection("blogs").updateOne({ _id: oid }, { $set: updates })
  const doc = await db.collection("blogs").findOne({ _id: oid })
  if (!doc) return null
  return { ...doc, _id: doc._id.toString() }
}

export async function recordUniqueBlogView(id: string, visitorId: string) {
  const client = await getMongoClient()
  const db = await getDb()
  const viewId = createHash("sha256").update(`${id}:${visitorId}`).digest("hex")
  const session = client.startSession()
  let counted = false

  try {
    await session.withTransaction(async () => {
      counted = false
      await db.collection("blog_viewers").insertOne(
        { _id: viewId, postId: id, countedAt: new Date().toISOString() },
        { session },
      )

      const update = await db.collection("blogs").updateOne(
        { _id: new ObjectId(id), status: "published" },
        { $inc: { views: 1 } },
        { session },
      )
      if (update.matchedCount !== 1) throw new Error("Published blog post not found")
      counted = true
    })
  } catch (error) {
    if ((error as { code?: number }).code !== 11000) throw error
  } finally {
    await session.endSession()
  }

  const post = await db.collection("blogs").findOne({ _id: new ObjectId(id) }, { projection: { views: 1 } })
  return { counted, views: post?.views || 0 }
}

export async function createComment(data: Partial<CommentRecord>) {
  const db = await getDb()
  const now = new Date().toISOString()
  
  const doc: CommentRecord = {
    postId: data.postId || "",
    parentId: data.parentId,
    postSlug: data.postSlug,
    postTitle: data.postTitle,
    authorName: data.authorName || "Anonymous",
    authorEmail: data.authorEmail || "",
    authorPhone: data.authorPhone,
    authorAvatar: data.authorAvatar,
    subject: data.subject,
    content: data.content || "",
    likes: data.likes || 0,
    status: data.parentId ? "published" : "pending",
    createdAt: now,
    updatedAt: now,
  }

  const res = await db.collection("comments").insertOne(doc as any)
  
  await db.collection("blogs").updateOne(
    { _id: new ObjectId(data.postId) },
    { $inc: { commentsCount: 1 } }
  )
  
  return { ...doc, _id: res.insertedId.toString() }
}

export async function getCommentById(id: string) {
  const db = await getDb()
  const doc = await db.collection("comments").findOne({ _id: new ObjectId(id) })
  if (!doc) return null
  return { ...doc, _id: doc._id.toString() }
}

export async function listPublishedCommentsByPost(postId: string, limit = 50, skip = 0) {
  const db = await getDb()
  const cursor = db
    .collection("comments")
    .find({ postId, status: "published", $or: [{ parentId: { $exists: false } }, { parentId: null }] })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
  const docs = await cursor.toArray()
  return docs.map((d) => ({ ...d, _id: d._id.toString() }))
}

export async function listPublishedRepliesByParentId(parentId: string, limit = 50, skip = 0) {
  const db = await getDb()
  const cursor = db
    .collection("comments")
    .find({ parentId, status: "published" })
    .sort({ createdAt: 1 })
    .skip(skip)
    .limit(limit)
  const docs = await cursor.toArray()
  return docs.map((d) => ({ ...d, _id: d._id.toString() }))
}

export async function likeBlog(id: string) {
  const db = await getDb()
  await db.collection("blogs").updateOne({ _id: new ObjectId(id) }, { $inc: { likes: 1 } })
  const doc = await db.collection("blogs").findOne({ _id: new ObjectId(id) })
  return doc ? { ...doc, _id: doc._id.toString() } : null
}

export async function unlikeBlog(id: string) {
  const db = await getDb()
  await db.collection("blogs").updateOne({ _id: new ObjectId(id) }, { $inc: { likes: -1 } })
  const doc = await db.collection("blogs").findOne({ _id: new ObjectId(id) })
  return doc ? { ...doc, _id: doc._id.toString() } : null
}

export async function likeComment(id: string) {
  const db = await getDb()
  await db.collection("comments").updateOne({ _id: new ObjectId(id) }, { $inc: { likes: 1 } })
  const doc = await db.collection("comments").findOne({ _id: new ObjectId(id) })
  return doc ? { ...doc, _id: doc._id.toString() } : null
}

export async function unlikeComment(id: string) {
  const db = await getDb()
  await db.collection("comments").updateOne({ _id: new ObjectId(id) }, { $inc: { likes: -1 } })
  const doc = await db.collection("comments").findOne({ _id: new ObjectId(id) })
  return doc ? { ...doc, _id: doc._id.toString() } : null
}

export async function listAllComments(limit = 50, skip = 0, status?: CommentStatus) {
  const db = await getDb()
  const query: any = {}
  if (status) query.status = status
  
  const cursor = db.collection("comments").find(query).sort({ createdAt: -1 }).skip(skip).limit(limit)
  const docs = await cursor.toArray()
  const total = await db.collection("comments").countDocuments(query)
  return { comments: docs.map((d) => ({ ...d, _id: d._id.toString() })), total }
}

export async function publishComment(id: string) {
  const db = await getDb()
  const oid = new ObjectId(id)
  const updates = {
    status: "published",
    updatedAt: new Date().toISOString(),
  }
  await db.collection("comments").updateOne({ _id: oid }, { $set: updates })
  const doc = await db.collection("comments").findOne({ _id: oid })
  if (!doc) return null
  return { ...doc, _id: doc._id.toString() }
}

export async function unpublishComment(id: string) {
  const db = await getDb()
  const oid = new ObjectId(id)
  const updates = {
    status: "unpublished",
    updatedAt: new Date().toISOString(),
  }
  await db.collection("comments").updateOne({ _id: oid }, { $set: updates })
  const doc = await db.collection("comments").findOne({ _id: oid })
  if (!doc) return null
  return { ...doc, _id: doc._id.toString() }
}

export async function deleteComment(id: string) {
  const db = await getDb()
  const oid = new ObjectId(id)
  const comment = await db.collection("comments").findOne({ _id: oid })
  
  if (comment) {
    await db.collection("blogs").updateOne(
      { _id: new ObjectId(comment.postId) },
      { $inc: { commentsCount: -1 } }
    )
  }
  
  const result = await db.collection("comments").deleteOne({ _id: oid })
  return result.deletedCount > 0
}

export async function deleteMultipleComments(ids: string[]) {
  const db = await getDb()
  const oids = ids.map(id => new ObjectId(id))
  
  const comments = await db.collection("comments").find({ _id: { $in: oids } }).toArray()
  const postUpdates: Record<string, number> = {}
  
  comments.forEach(comment => {
    if (comment.postId) {
      postUpdates[comment.postId] = (postUpdates[comment.postId] || 0) + 1
    }
  })
  
  for (const [postId, count] of Object.entries(postUpdates)) {
    await db.collection("blogs").updateOne(
      { _id: new ObjectId(postId) },
      { $inc: { commentsCount: -count } }
    )
  }
  
  const result = await db.collection("comments").deleteMany({ _id: { $in: oids } })
  return result.deletedCount
}

export async function processScheduledBlogs() {
  const db = await getDb()
  const nowDate = new Date()
  const now = nowDate.toISOString()
  
  const scheduledPosts = await db.collection("blogs").find({
    status: "scheduled",
    $or: [
      { scheduledAt: { $lte: now } },
      // Include legacy scheduledAt values stored as BSON Date objects.
      { scheduledAt: { $lte: nowDate } },
    ],
  }).toArray()
  
  for (const post of scheduledPosts) {
    await db.collection("blogs").updateOne(
      { _id: post._id },
      { 
        $set: { 
          status: "published",
          publishedAt: now,
          updatedAt: now
        }
      }
    )
  }
  
  return scheduledPosts.length
}

export default {}
