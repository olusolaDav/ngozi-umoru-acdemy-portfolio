import { type BlogSummary, type PaginatedResponse } from "@/lib/blog";
import { callApi } from "@/lib/server-api";
import { absoluteUrl, SITE_DESCRIPTION, SITE_NAME } from "@/lib/seo";

export const revalidate = 1800;

function escapeXml(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
}

export async function GET() {
  const response = await callApi<PaginatedResponse<BlogSummary>>("/blogs?page=1&limit=50", { method: "GET" }).catch(() => ({ data: { items: [], pagination: { page: 1, limit: 50, total: 0, totalPages: 0 } } }));
  const posts = response.data.items.filter((post) => post.status === "PUBLISHED");
  const siteUrl = absoluteUrl("/");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(`${SITE_NAME} Blog`)}</title>
    <link>${siteUrl}blog</link>
    <description>${escapeXml(SITE_DESCRIPTION)}</description>
    <language>en-US</language>
    <atom:link href="${siteUrl}feed/blog" rel="self" type="application/rss+xml" />
    ${posts.map((post) => `<item><title>${escapeXml(post.title)}</title><link>${siteUrl}blog/${encodeURIComponent(post.slug)}</link><guid isPermaLink="true">${siteUrl}blog/${encodeURIComponent(post.slug)}</guid><description>${escapeXml(post.metaDescription || post.excerpt)}</description><pubDate>${new Date(post.publishedAt || post.createdAt).toUTCString()}</pubDate>${post.tags.map((tag) => `<category>${escapeXml(tag)}</category>`).join("")}</item>`).join("")}
  </channel>
</rss>`;

  return new Response(xml, { headers: { "Content-Type": "application/rss+xml; charset=utf-8", "Cache-Control": "public, max-age=1800, stale-while-revalidate=3600" } });
}
