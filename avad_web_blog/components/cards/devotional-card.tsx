import Image from "next/image";
import Link from "next/link";
import { Calendar } from "lucide-react";
import { Bookmark, Heart, MessageCircle, Share2 } from "lucide-react";

import { formatDevotionalDate, safeThumbnailSrc } from "@/lib/devotional";
import type { DevotionalItem } from "@/types/content";

type DevotionalCardModel = DevotionalItem & {
  thumbnail?: string | null;
  devotionalDate?: string | null;
  authorName?: string;
};

type DevotionalCardProps = {
  devotional: DevotionalCardModel;
  badgeLabel?: string;
  href?: string;
};

export function DevotionalCard({ devotional, badgeLabel, href = "/devotionals" }: DevotionalCardProps) {
  const thumbnailSrc = safeThumbnailSrc(devotional.thumbnail, devotional.title);

  return (
    <Link href={href} className="block cursor-pointer">
      <article className="grid min-w-0 grid-cols-1 items-center gap-4 rounded-3xl border border-[var(--avad-border)] bg-transparent p-2 shadow-none transition-all duration-200 hover:-translate-y-[2px] hover:border-[var(--avad-border)] hover:bg-[var(--avad-bg-elevated)] hover:p-4 hover:shadow-sm sm:gap-5 md:grid-cols-[minmax(0,1fr)_216px]">
        <div>
          {badgeLabel ? (
            <span className="mb-2 inline-flex rounded-full bg-gradient-to-r from-[#d39a52] to-[#b8742f] px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-white shadow-sm">
              {badgeLabel}
            </span>
          ) : null}
          <h3 className="font-serif text-[22px] font-bold leading-[1.08] text-[var(--avad-text-strong)] md:text-[25px]">{devotional.title}</h3>
          <p className="mt-3 max-w-[340px] text-[15px] leading-6 text-[var(--avad-text-soft)]">{devotional.excerpt}</p>
          {devotional.authorName ? <p className="mt-2 text-xs text-[var(--avad-text-soft)]">By {devotional.authorName}</p> : null}
          {devotional.devotionalDate ? (
            <p className="mt-3 inline-flex items-center gap-1 text-xs text-[var(--avad-text-soft)]">
              <Calendar size={12} />
              {formatDevotionalDate(devotional.devotionalDate)}
            </p>
          ) : null}
          <div className="mt-4 flex items-center gap-3 text-[var(--avad-gold)]">
            <span className="inline-flex items-center gap-1 text-sm"><Heart size={14} /> {devotional.likes}</span>
            <span className="inline-flex items-center gap-1 text-sm"><Share2 size={14} /> {devotional.shares}</span>
            <span className="inline-flex items-center gap-1 text-sm"><MessageCircle size={14} /> {devotional.comments}</span>
            <span className="inline-flex items-center gap-1 text-sm"><Bookmark size={14} /> {devotional.bookmarks}</span>
          </div>
        </div>
        <div className="relative block h-full min-h-40 overflow-hidden rounded">
          <Image
            src={thumbnailSrc}
            alt={devotional.title}
            fill
            sizes="(max-width: 768px) 100vw, 216px"
            className="object-cover"
          />
        </div>
      </article>
    </Link>
  );
}
