import { toRelativePostedTime } from "./blog";
import type { VideoItem } from "@/types/content";

export type VideoPlaylistSummary = {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
  videosCount: number;
};

export type VideoSummary = {
  id: string;
  youtubeVideoId: string;
  title: string;
  description: string | null;
  category: string;
  youtubeUrl: string;
  thumbnailUrl: string | null;
  views?: number;
  isRecommended: boolean;
  recommendedAt: string | null;
  playlistId: string | null;
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
  playlist?: {
    id: string;
    name: string;
    slug: string;
  } | null;
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

const TRUSTED_VIDEO_THUMBNAIL_HOSTS = new Set([
  "i.ytimg.com",
  "img.youtube.com",
  "images.unsplash.com",
  "res.cloudinary.com",
  "timtebowfoundation.org",
]);

export function safeVideoThumbnailSrc(value: string | null | undefined, fallback = "/placeholders/content-thumb.svg") {
  if (!value) {
    return fallback;
  }

  if (value.startsWith("/")) {
    return value;
  }

  try {
    const url = new URL(value);
    if (url.protocol === "https:" && TRUSTED_VIDEO_THUMBNAIL_HOSTS.has(url.hostname)) {
      return value;
    }
  } catch {
    return fallback;
  }

  return fallback;
}

export function toVideoCardItem(video: VideoSummary): VideoItem {
  return {
    id: video.id,
    title: video.title,
    description: video.description ?? "",
    publishedAgo: toRelativePostedTime(video.publishedAt),
    category: video.category,
    thumbnail: safeVideoThumbnailSrc(video.thumbnailUrl),
    watchUrl: video.youtubeUrl,
    embedUrl: `https://www.youtube.com/embed/${video.youtubeVideoId}`,
  };
}
