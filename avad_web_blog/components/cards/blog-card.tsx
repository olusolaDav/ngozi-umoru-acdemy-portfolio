import Image from "next/image";
import Link from "next/link";
import { Bookmark, Heart, MessageCircle, Share2 } from "lucide-react";

import { safeThumbnailSrc } from "@/lib/blog";

type BlogCardProps = {
  blog: {
    id: string;
    title: string;
    excerpt: string;
    authorName?: string;
    likes: number;
    comments: number;
    bookmarks: number;
    shares: number;
    postedAgo: string;
    thumbnail?: string | null;
    href?: string;
  };
  featured?: boolean;
};

export function BlogCard({ blog, featured = false }: BlogCardProps) {
  const cardHref = blog.href ?? "/blog";
  const thumbnailSrc = safeThumbnailSrc(blog.thumbnail, blog.title);

  return (
    <Link href={cardHref} className="block cursor-pointer">
      <article
        className={[
          "rounded-3xl border border-[var(--avad-border)] bg-transparent p-2 shadow-none transition-all duration-200",
          "hover:-translate-y-[2px] hover:border-[var(--avad-border)] hover:bg-[var(--avad-bg-elevated)] hover:p-4 hover:shadow-sm",
          featured ? "border-[var(--avad-border)] bg-[var(--avad-bg-elevated)] p-4 shadow-sm" : "",
        ].join(" ")}
      >
        <div className="relative block aspect-video overflow-hidden rounded">
          <Image
            src={thumbnailSrc}
            alt={blog.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover"
          />
        </div>
        <h3 className="mt-4 font-serif text-[21px] font-bold leading-[1.08] text-[var(--avad-text-strong)] md:text-[24px]">{blog.title}</h3>
        <p className="mt-3 text-[15px] leading-6 text-[var(--avad-text-soft)]">{blog.excerpt}</p>
        {blog.authorName ? <p className="mt-2 text-xs text-[var(--avad-text-soft)]">By {blog.authorName}</p> : null}
        <div className="mt-3 flex items-center gap-3 text-[var(--avad-gold)]">
          <span className="inline-flex items-center gap-1 text-sm"><Heart size={14} /> {blog.likes}</span>
          <span className="inline-flex items-center gap-1 text-sm"><Share2 size={14} /> {blog.shares}</span>
          <span className="inline-flex items-center gap-1 text-sm"><MessageCircle size={14} /> {blog.comments}</span>
          <span className="inline-flex items-center gap-1 text-sm"><Bookmark size={14} /> {blog.bookmarks}</span>
        </div>
        <p className="mt-4 text-sm text-[var(--avad-text-soft)]">Posted {blog.postedAgo}</p>
      </article>
    </Link>
  );
}
