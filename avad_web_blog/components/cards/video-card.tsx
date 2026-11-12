import Image from "next/image";
import Link from "next/link";

import type { VideoItem } from "@/types/content";

type VideoCardProps = {
  video: VideoItem;
  featured?: boolean;
  badgeLabel?: string;
  href?: string;
};

export function VideoCard({ video, featured, badgeLabel, href = "/videos" }: VideoCardProps) {
  const targetHref = video.watchUrl ?? href;
  const thumbnailSrc = video.thumbnail ?? "/placeholders/content-thumb.svg";

  return (
    <Link href={targetHref} target={video.watchUrl ? "_blank" : undefined} rel={video.watchUrl ? "noreferrer" : undefined} className="block cursor-pointer">
      <article
        className={[
          "rounded-3xl border border-[var(--avad-border)] bg-transparent p-2 shadow-none transition-all duration-200",
          "hover:-translate-y-[2px] hover:border-[var(--avad-border)] hover:bg-[var(--avad-bg-elevated)] hover:p-4 hover:shadow-sm",
          featured ? "border-[#d39a52] bg-[var(--avad-bg-elevated)] p-4 shadow-[0_8px_24px_rgba(211,154,82,0.2)]" : "",
        ].join(" ")}
      >
        <div className="relative block aspect-video w-full overflow-hidden rounded-md">
          {badgeLabel ? (
            <span className="absolute left-2 top-2 z-10 rounded-full bg-gradient-to-r from-[#d39a52] to-[#b8742f] px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-white shadow-md">
              {badgeLabel}
            </span>
          ) : null}
          <Image
            src={thumbnailSrc}
            alt={video.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover"
          />
        </div>
        <h3 className="mt-3 font-serif text-lg font-bold leading-6 text-[var(--avad-text-strong)] md:text-[19px]">{video.title}</h3>
        <p className="mt-2 text-sm text-[var(--avad-text-soft)]">{video.publishedAgo}</p>
      </article>
    </Link>
  );
}
