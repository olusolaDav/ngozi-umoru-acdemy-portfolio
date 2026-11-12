import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { DevotionalsSlugPage } from "@/features/devotionals/devotionals-slug-page";
import type { DevotionalComment, DevotionalSummary } from "@/lib/devotional";
import { stripHtml } from "@/lib/blog";
import { callApi } from "@/lib/server-api";
import { StructuredData } from "@/components/seo/structured-data";
import { absoluteUrl, contentImageUrl, contentMetadata, SITE_NAME } from "@/lib/seo";

export const dynamic = "force-dynamic";

type DevotionalSlugRoutePageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return [];
}

export async function generateMetadata({ params }: DevotionalSlugRoutePageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await callApi<DevotionalSummary>(`/devotionals/${slug}`, {
    method: "GET",
    cache: "no-store",
  }).catch(() => null);

  if (!post) {
    return { title: "Devotional Not Found", robots: { index: false, follow: false } };
  }

  return contentMetadata({ title: post.data.title, description: post.data.metaDescription || post.data.excerpt, path: `/devotionals/${post.data.slug}`, image: post.data.thumbnail, publishedTime: post.data.publishedAt || post.data.devotionalDate, modifiedTime: post.data.updatedAt, tags: post.data.tags, author: post.data.authorName });
}

export default async function DevotionalSlugRoutePage({ params }: DevotionalSlugRoutePageProps) {
  const { slug } = await params;
  const [postResult, commentsResult] = await Promise.all([
    callApi<DevotionalSummary>(`/devotionals/${slug}`, {
      method: "GET",
      cache: "no-store",
    }).catch(() => null),
    callApi<DevotionalComment[]>(`/devotionals/${slug}/comments`, {
      method: "GET",
      cache: "no-store",
    }).catch(() => null),
  ]);

  if (!postResult) {
    notFound();
  }

  const post = postResult.data;
  const canonicalUrl = absoluteUrl(`/devotionals/${post.slug}`);
  return (
    <>
      <StructuredData data={{ "@context": "https://schema.org", "@type": "Article", headline: post.title, description: post.metaDescription || post.excerpt, image: contentImageUrl(post.title, post.thumbnail), datePublished: post.publishedAt || post.devotionalDate, dateModified: post.updatedAt, author: { "@type": "Person", name: post.authorName }, publisher: { "@type": "Organization", name: SITE_NAME, logo: { "@type": "ImageObject", url: absoluteUrl("/avad-logo.svg") } }, mainEntityOfPage: { "@type": "WebPage", "@id": canonicalUrl }, keywords: post.tags.join(", "), timeRequired: `PT${post.readTime || 1}M`, articleBody: stripHtml(post.content) }} />
      <StructuredData data={{ "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl("/") }, { "@type": "ListItem", position: 2, name: "Devotionals", item: absoluteUrl("/devotionals") }, { "@type": "ListItem", position: 3, name: post.title, item: canonicalUrl }] }} />
      <DevotionalsSlugPage post={post} comments={commentsResult?.data ?? []} />
    </>
  );
}
