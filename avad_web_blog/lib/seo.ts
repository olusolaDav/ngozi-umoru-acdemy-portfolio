import type { Metadata } from "next";

export const SITE_NAME = "AVAD - A Verse A Day";
export const SITE_DESCRIPTION =
  "AVAD (A Verse A Day) helps people grow in faith through daily Bible verses, devotionals, Christian articles, and a welcoming community.";
export const DEFAULT_OG_IMAGE = "/opengraph.jpeg";

const COMMON_VIDEO_SEARCH_PHRASES = [
  "AVAD",
  "A Verse A Day",
  "Daily Bible Verse",
  "Daily Scripture",
  "Encouragement for Today",
  "Christian encouragement",
  "Bible teaching",
];

export function videoSearchKeywords(title: string, category?: string | null) {
  const titlePhrases = title
    .split(/\s*(?:\|\||\||—|–|:)\s*/)
    .map((phrase) => phrase.trim())
    .filter((phrase) => phrase.length >= 2);
  const normalizedTitle = title.toLowerCase();
  const formatPhrases = normalizedTitle.includes("memoir")
    ? ["Memoir from the Father", "Christian memoir", "faith story", "Christian testimony"]
    : COMMON_VIDEO_SEARCH_PHRASES;

  return [...new Set([title, ...titlePhrases, ...formatPhrases, category].filter((value): value is string => Boolean(value?.trim())))];
}

export function getSiteUrl() {
  const configuredUrl = process.env.NEXT_PUBLIC_SITE_URL ?? process.env.WEB_PUBLIC_URL ?? "http://localhost:3000";
  return configuredUrl.replace(/\/$/, "");
}

export function absoluteUrl(path: string) {
  return new URL(path, `${getSiteUrl()}/`).toString();
}

/**
 * Returns a crawlable image URL for content sharing cards. Uploaded thumbnails
 * are used as-is; content without one gets a branded, dynamically generated
 * 1200x630 fallback instead of the site-wide social image.
 */
export function contentImageUrl(title: string, image?: string | null) {
  if (image) {
    return absoluteUrl(image);
  }

  const query = new URLSearchParams({ title: title.trim() || SITE_NAME }).toString();
  return absoluteUrl(`/api/og?${query}`);
}

function trimDescription(value: string, max = 160) {
  const normalized = value.replace(/\s+/g, " ").trim();
  return normalized.length <= max ? normalized : `${normalized.slice(0, max - 1).trimEnd()}…`;
}

export function contentMetadata({
  title,
  description,
  path,
  image = DEFAULT_OG_IMAGE,
  type = "article",
  publishedTime,
  modifiedTime,
  tags = [],
  author,
}: {
  title: string;
  description: string;
  path: string;
  image?: string | null;
  type?: "website" | "article";
  publishedTime?: string | null;
  modifiedTime?: string | null;
  tags?: string[];
  author?: string | null;
}): Metadata {
  const canonical = absoluteUrl(path);
  const imageUrl = contentImageUrl(title, image);
  const safeDescription = trimDescription(description || SITE_DESCRIPTION);

  return {
    title,
    description: safeDescription,
    keywords: tags.length ? tags : undefined,
    authors: author ? [{ name: author }] : undefined,
    alternates: { canonical },
    openGraph: {
      type,
      url: canonical,
      siteName: SITE_NAME,
      locale: "en_US",
      title,
      description: safeDescription,
      images: [{ url: imageUrl, width: 1200, height: 630, alt: title }],
      ...(type === "article"
        ? {
            publishedTime: publishedTime ?? undefined,
            modifiedTime: modifiedTime ?? undefined,
            authors: author ? [author] : undefined,
            tags: tags.length ? tags : undefined,
          }
        : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: safeDescription,
      images: [imageUrl],
    },
  };
}

export function jsonLd(value: Record<string, unknown>) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}
