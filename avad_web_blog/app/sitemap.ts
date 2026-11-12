import type { MetadataRoute } from "next";

import type { BlogSummary, PaginatedResponse as BlogResponse } from "@/lib/blog";
import type { CommunitySummary, PaginatedResponse as CommunityResponse } from "@/lib/community";
import type { DevotionalSummary, PaginatedResponse as DevotionalResponse } from "@/lib/devotional";
import { callApi } from "@/lib/server-api";
import { absoluteUrl } from "@/lib/seo";
import type { PaginatedResponse as VideoResponse, VideoSummary } from "@/lib/video";

export const revalidate = 3600;

const emptyPagination = { page: 1, limit: 100, total: 0, totalPages: 0 };

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [blogs, devotionals, community, videos] = await Promise.all([
    callApi<BlogResponse<BlogSummary>>("/blogs?page=1&limit=100", { method: "GET" }).catch(() => ({ data: { items: [], pagination: emptyPagination } })),
    callApi<DevotionalResponse<DevotionalSummary>>("/devotionals?page=1&limit=100", { method: "GET" }).catch(() => ({ data: { items: [], pagination: emptyPagination } })),
    callApi<CommunityResponse<CommunitySummary>>("/community?page=1&limit=100&scope=PUBLIC", { method: "GET" }).catch(() => ({ data: { items: [], pagination: emptyPagination } })),
    callApi<VideoResponse<VideoSummary>>("/videos?page=1&limit=100&sortBy=publishedAt&sortOrder=desc", { method: "GET" }).catch(() => ({ data: { items: [], pagination: emptyPagination } })),
  ]);

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: absoluteUrl("/"), changeFrequency: "daily", priority: 1 },
    { url: absoluteUrl("/blog"), changeFrequency: "daily", priority: 0.9 },
    { url: absoluteUrl("/devotionals"), changeFrequency: "daily", priority: 0.9 },
    { url: absoluteUrl("/videos"), changeFrequency: "daily", priority: 0.8 },
    { url: absoluteUrl("/community"), changeFrequency: "daily", priority: 0.8 },
    { url: absoluteUrl("/about"), changeFrequency: "monthly", priority: 0.5 },
  ];

  return [
    ...staticRoutes,
    ...blogs.data.items.filter((post) => post.status === "PUBLISHED").map((post) => ({ url: absoluteUrl(`/blog/${post.slug}`), lastModified: post.updatedAt, changeFrequency: "weekly" as const, priority: 0.8 })),
    ...devotionals.data.items.filter((post) => post.status === "PUBLISHED").map((post) => ({ url: absoluteUrl(`/devotionals/${post.slug}`), lastModified: post.updatedAt, changeFrequency: "weekly" as const, priority: 0.8 })),
    ...community.data.items.filter((post) => post.status === "PUBLISHED").map((post) => ({ url: absoluteUrl(`/community/thread/${post.slug}`), lastModified: post.updatedAt, changeFrequency: "weekly" as const, priority: 0.6 })),
    ...videos.data.items.map((video) => ({ url: absoluteUrl(`/videos/${video.youtubeVideoId}`), lastModified: video.updatedAt, changeFrequency: "weekly" as const, priority: 0.7 })),
  ];
}
