import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import { CommunitySlugPage } from "@/features/community/community-slug-page";
import type { CommunityComment, CommunitySummary } from "@/lib/community";
import { stripHtml } from "@/lib/blog";
import { callApi } from "@/lib/server-api";
import { StructuredData } from "@/components/seo/structured-data";
import { absoluteUrl, contentImageUrl, contentMetadata, SITE_NAME } from "@/lib/seo";

export const dynamic = "force-dynamic";

type CommunityThreadPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: CommunityThreadPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await callApi<CommunitySummary>(`/community/${slug}`, {
    method: "GET",
    cache: "no-store",
  }).catch(() => null);

  if (!post) {
    return { title: "Community Post Not Found", robots: { index: false, follow: false } };
  }

  return contentMetadata({ title: post.data.title, description: post.data.metaDescription || post.data.excerpt, path: `/community/thread/${post.data.slug}`, image: post.data.thumbnail, publishedTime: post.data.createdAt, modifiedTime: post.data.updatedAt, tags: post.data.tags, author: post.data.authorName });
}

export default async function CommunityThreadPage({ params }: CommunityThreadPageProps) {
  const { slug } = await params;

  if (!slug) {
    redirect("/community");
  }

  const [postResult, commentsResult] = await Promise.all([
    callApi<CommunitySummary>(`/community/${slug}`, {
      method: "GET",
      cache: "no-store",
    }).catch(() => null),
    callApi<CommunityComment[]>(`/community/${slug}/comments`, {
      method: "GET",
      cache: "no-store",
    }).catch(() => null),
  ]);

  if (!postResult) {
    notFound();
  }

  const post = postResult.data;
  const canonicalUrl = absoluteUrl(`/community/thread/${post.slug}`);
  return (
    <>
      <StructuredData data={{ "@context": "https://schema.org", "@type": "DiscussionForumPosting", headline: post.title, text: stripHtml(post.content), image: contentImageUrl(post.title, post.thumbnail), datePublished: post.createdAt, dateModified: post.updatedAt, author: { "@type": "Person", name: post.authorName }, publisher: { "@type": "Organization", name: SITE_NAME }, mainEntityOfPage: { "@type": "WebPage", "@id": canonicalUrl }, keywords: post.tags.join(", ") }} />
      <StructuredData data={{ "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl("/") }, { "@type": "ListItem", position: 2, name: "Community", item: absoluteUrl("/community") }, { "@type": "ListItem", position: 3, name: post.title, item: canonicalUrl }] }} />
      <CommunitySlugPage post={post} comments={commentsResult?.data ?? []} />
    </>
  );
}
