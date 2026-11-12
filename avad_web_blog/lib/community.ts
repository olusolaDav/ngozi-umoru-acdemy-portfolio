import { generatedThumbnailSrc } from "@/lib/generated-thumbnail";

export type CommunityStatus = "DRAFT" | "SCHEDULED" | "UNAPPROVED" | "PUBLISHED";

export type CommunitySummary = {
  id: string;
  title: string;
  slug: string;
  content: string;
  prayerPoint: string;
  communityDate: string;
  excerpt: string;
  metaDescription: string;
  thumbnail: string | null;
  status: CommunityStatus;
  tags: string[];
  views: number;
  likes: number;
  shares: number;
  readTime: number;
  isRecommended: boolean;
  recommendedAt: string | null;
  commentsCount: number;
  publishedAt: string | null;
  scheduledAt: string | null;
  moderationReason: string | null;
  moderatedAt: string | null;
  moderatedById: string | null;
  submissionCount: number;
  lastSubmittedAt: string | null;
  lastResubmittedAt: string | null;
  createdAt: string;
  updatedAt: string;
  authorId: string | null;
  authorName: string;
  authorRole: "ADMIN" | "MODERATOR" | "BLOGGER" | "MEMBER" | null;
};

export type CommunityComment = {
  id: string;
  communityId: string;
  parentId: string | null;
  authorName: string;
  authorEmail: string | null;
  subject: string | null;
  message: string;
  status: "UNPUBLISHED" | "PUBLISHED";
  moderationReason: string | null;
  moderatedAt: string | null;
  moderatedById: string | null;
  likes: number;
  createdAt: string;
  updatedAt: string;
  replies?: CommunityComment[];
};

export type CommunitySubmissionRevision = {
  id: string;
  submissionNumber: number;
  title: string;
  changedFields: string[];
  submittedAt: string;
  submittedByName: string;
};

export type PaginatedResponse<T> = {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export type CommunityFeed = {
  date: string;
  rotationWindowMinutes: number;
  activeIndex: number;
  activeScripture: CommunitySummary | null;
  items: CommunitySummary[];
};

const htmlEntityMap: Record<string, string> = {
  nbsp: " ",
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
};

const ALLOWED_INLINE_STYLE_PROPERTIES = new Set([
  "background",
  "background-color",
  "color",
  "font-style",
  "font-weight",
  "text-align",
  "text-decoration",
]);

function sanitizeInlineStyles(rawStyles: string) {
  const keptStyles = rawStyles
    .split(";")
    .map((rule) => rule.trim())
    .filter(Boolean)
    .map((rule) => {
      const [property, ...valueParts] = rule.split(":");
      const key = property?.trim().toLowerCase();
      const value = valueParts.join(":").trim();
      if (!key || !value || !ALLOWED_INLINE_STYLE_PROPERTIES.has(key)) {
        return null;
      }
      return `${key}: ${value}`;
    })
    .filter((rule): rule is string => Boolean(rule))
    .sort((left, right) => left.localeCompare(right));

  return keptStyles.length ? keptStyles.join("; ") : null;
}

function mergeAdjacentStyledSpans(html: string) {
  const adjacentSpanPattern = /<span style="([^"]+)">([\s\S]*?)<\/span>(\s+)<span style="\1">([\s\S]*?)<\/span>/gi;
  let merged = html;

  // Run until there are no more adjacent matching spans left.
  while (adjacentSpanPattern.test(merged)) {
    merged = merged.replace(adjacentSpanPattern, '<span style="$1">$2$3$4</span>');
    adjacentSpanPattern.lastIndex = 0;
  }

  return merged;
}

export function decodeHtmlEntities(value: string) {
  if (!value) {
    return "";
  }

  if (typeof window !== "undefined") {
    const textarea = window.document.createElement("textarea");
    textarea.innerHTML = value;
    return textarea.value;
  }

  return value
    .replace(/&#(\d+);/g, (_, dec: string) => String.fromCodePoint(Number(dec)))
    .replace(/&#x([\da-fA-F]+);/g, (_, hex: string) => String.fromCodePoint(Number.parseInt(hex, 16)))
    .replace(/&([a-zA-Z]+);/g, (match: string, name: string) => htmlEntityMap[name] ?? match);
}

export function formatCommunityDate(value?: string | null) {
  if (!value) {
    return "";
  }

  return new Date(value).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function stripHtml(value: string) {
  const withoutTags = value.replace(/<[^>]+>/g, " ");
  const decoded = decodeHtmlEntities(withoutTags);
  return decoded.replace(/\s+/g, " ").trim();
}

export function normalizeCommunityHtmlForRender(value: string) {
  if (!value) {
    return "";
  }

  let normalized = value;
  normalized = decodeHtmlEntities(normalized);
  normalized = decodeHtmlEntities(normalized);
  normalized = normalized.replace(/\u00a0/g, " ");
  normalized = normalized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "");
  normalized = normalized.replace(/\sstyle="([^"]*)"/gi, (_, rawStyles: string) => {
    const sanitized = sanitizeInlineStyles(rawStyles);
    if (!sanitized) {
      return "";
    }

    return ` style="${sanitized}"`;
  });

  return mergeAdjacentStyledSpans(normalized);
}

export function excerptFromContent(content: string, max = 190) {
  const plain = stripHtml(content);
  if (plain.length <= max) {
    return plain;
  }
  return `${plain.slice(0, max).trimEnd()}...`;
}

export function firstSentenceFromContent(content: string, max = 140) {
  const plain = stripHtml(content);
  if (!plain) {
    return "";
  }

  const match = plain.match(/[^.!?]+[.!?]?/);
  const sentence = match?.[0]?.trim() || plain;
  if (sentence.length <= max) {
    return sentence;
  }

  return `${sentence.slice(0, max).trimEnd()}...`;
}

export function estimateReadTimeFromContent(content: string, wordsPerMinute = 150) {
  const plain = stripHtml(content);
  if (!plain) {
    return 0;
  }
  const words = plain.split(/\s+/).filter(Boolean).length;
  if (words === 0) {
    return 0;
  }
  return Math.max(1, Math.ceil(words / wordsPerMinute));
}

const TRUSTED_IMAGE_HOSTS = new Set([
  "images.unsplash.com",
  "res.cloudinary.com",
  "timtebowfoundation.org",
]);

export function safeThumbnailSrc(value: string | null | undefined, title = "A Verse A Day") {
  if (!value) {
    return generatedThumbnailSrc(title);
  }

  if (value.startsWith("/")) {
    return value;
  }

  try {
    const url = new URL(value);
    if ((url.protocol === "https:" || url.protocol === "http:") && TRUSTED_IMAGE_HOSTS.has(url.hostname)) {
      return value;
    }
  } catch {
    return generatedThumbnailSrc(title);
  }

  return generatedThumbnailSrc(title);
}
