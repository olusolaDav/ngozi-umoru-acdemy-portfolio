"use client";

import { ArrowLeft } from "lucide-react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { formatBlogDate, normalizeBlogHtmlForRender, safeThumbnailSrc, type BlogSummary } from "@/lib/blog";
import { getJson } from "@/lib/http";

export default function DashboardBlogPreviewPage() {
  const params = useParams<{ blogId: string }>();
  const router = useRouter();
  const [post, setPost] = useState<BlogSummary | null>(null);

  useEffect(() => {
    void getJson<BlogSummary>(`/api/dashboard/blogs/${params.blogId}`).then(setPost);
  }, [params.blogId]);

  if (!post) {
    return <p className="p-6 text-sm text-[var(--avad-text-soft)]">Loading preview...</p>;
  }

  return (
    <article className="rounded-[24px] border border-[var(--avad-border)] bg-[var(--avad-bg-elevated)] p-4 sm:p-8">
      <div className="mb-5 flex items-center justify-between rounded-xl bg-[var(--avad-bg-soft)] px-4 py-2 text-sm text-[var(--avad-text)]">
        <span className="font-semibold">Preview</span>
        <button onClick={() => router.push(`/dashboard/blogs/${params.blogId}/edit`)} className="inline-flex items-center gap-2">
          <ArrowLeft size={14} />
          Back to editor
        </button>
      </div>

      <div className="mx-auto max-w-[860px]">
        <p className="inline-flex rounded-full bg-[#d39a52] px-3 py-1 text-[11px] font-semibold text-white">AVAD - A VERSE A DAY</p>
        <h1 className="mt-4 font-serif text-[46px] leading-[1.05] text-[var(--avad-text-strong)]">{post.title}</h1>
        <p className="mt-3 text-sm text-[var(--avad-text-soft)]">{post.excerpt || post.metaDescription}</p>

        <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-[var(--avad-text-soft)]">
          {post.tags[0] ? <span className="rounded-full border border-[var(--avad-border)] bg-[var(--avad-bg-soft)] px-2 py-1 text-[var(--avad-gold)]">{post.tags[0]}</span> : null}
          <span>{post.readTime} Min</span>
          <span>{formatBlogDate(post.publishedAt ?? post.createdAt)}</span>
          <span>{post.likes} Likes</span>
          <span>{post.shares} Shares</span>
        </div>

        <div className="relative mt-8 h-[300px] overflow-hidden rounded-3xl sm:h-[460px]">
          <Image
            src={safeThumbnailSrc(post.thumbnail, post.title)}
            alt={post.title}
            fill
            className="object-cover"
          />
        </div>

        <div className="blog-article-content mt-8" dangerouslySetInnerHTML={{ __html: normalizeBlogHtmlForRender(post.content) }} />
      </div>
    </article>
  );
}
