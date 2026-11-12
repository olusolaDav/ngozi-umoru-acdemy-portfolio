import type { Metadata } from "next";

import { VideosPage } from "@/features/videos/videos-page";
import { contentMetadata } from "@/lib/seo";
import { type BlogSummary, type PaginatedResponse } from "@/lib/blog";
import { callApi } from "@/lib/server-api";
import { type PaginatedResponse as VideoPaginatedResponse, type VideoPlaylistSummary, type VideoSummary } from "@/lib/video";
import { getLatestYoutubeVideo } from "@/lib/youtube";

export const metadata: Metadata = contentMetadata({ title: "Christian Videos and Bible Teaching", description: "Watch AVAD Christian videos, Bible teaching, daily Scripture content, and faith-building messages.", path: "/videos", type: "website" });

export default async function Videos() {
  const [blogs, videosResponse, playlistsResponse, youtubeFallback] = await Promise.all([
    callApi<PaginatedResponse<BlogSummary>>("/blogs?page=1&limit=3", { method: "GET" }).catch(() => ({
      status: 200,
      data: {
        items: [],
        pagination: { page: 1, limit: 3, total: 0, totalPages: 0 },
      },
    })),
    callApi<VideoPaginatedResponse<VideoSummary>>("/videos?page=1&limit=12&sortBy=publishedAt&sortOrder=desc", { method: "GET" }).catch(() => ({
      status: 200,
      data: {
        items: [],
        pagination: { page: 1, limit: 12, total: 0, totalPages: 0 },
      },
    })),
    callApi<VideoPlaylistSummary[]>("/videos/playlists", { method: "GET" }).catch(() => ({
      status: 200,
      data: [],
    })),
    getLatestYoutubeVideo(),
  ]);

  const featuredFromApi = videosResponse.data.items[0];
  const featuredVideo = {
    title: featuredFromApi?.title || youtubeFallback.title || "Latest YouTube Video",
    embedUrl: featuredFromApi
      ? `https://www.youtube.com/embed/${featuredFromApi.youtubeVideoId}`
      : youtubeFallback.embedUrl,
    publishedAt: featuredFromApi?.publishedAt || youtubeFallback.publishedAt || new Date().toISOString(),
  };

  return (
    <VideosPage
      featuredVideo={featuredVideo}
      videos={videosResponse.data.items}
      playlists={playlistsResponse.data}
      recentBlogs={blogs.data.items}
      initialPagination={videosResponse.data.pagination}
    />
  );
}
