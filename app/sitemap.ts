import { MetadataRoute } from 'next'
import { getDb } from '@/lib/mongodb'
import { getSiteUrl } from '@/lib/seo'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getSiteUrl()
  
  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/blog`,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/resources`,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/contact`,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
  ]

  try {
    const db = await getDb()

    // Get all published blog posts
    const blogPosts = await db
      .collection('blogs')
      .find({ status: 'published' })
      .project({ slug: 1, updatedAt: 1, createdAt: 1 })
      .toArray()

    const blogPages: MetadataRoute.Sitemap = blogPosts.map((post) => {
      const lastModifiedValue = post.updatedAt || post.createdAt
      const lastModified = lastModifiedValue ? new Date(lastModifiedValue) : undefined
      return {
        url: `${baseUrl}/blog/${encodeURIComponent(post.slug)}`,
        ...(lastModified && !Number.isNaN(lastModified.getTime()) ? { lastModified } : {}),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      }
    })

    return [...staticPages, ...blogPages]
  } catch (error) {
    console.error('Error generating sitemap:', error)
    return staticPages
  }
}
