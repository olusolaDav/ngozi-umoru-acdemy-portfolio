import { HomePage } from "@/features/home/home-page";
import { type BlogSummary, type PaginatedResponse } from "@/lib/blog";
import { type DailyScriptureFeed, type DailyScriptureSummary } from "@/lib/daily-scripture";
import { type DevotionalSummary } from "@/lib/devotional";
import { callApi } from "@/lib/server-api";
import { toVideoCardItem, type PaginatedResponse as VideoPaginatedResponse, type VideoSummary } from "@/lib/video";
import { getHomeHeroYoutubeVideo } from "@/lib/youtube";

function isSameLocalCalendarDay(value: string, now: Date) {
  const date = new Date(value);
  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  );
}

export default async function Home() {
  const [blogs, dailyScriptureFeed, devotionals, latestApiVideo, avadVideos, recommendedVideos, lowestViewedVideos] = await Promise.all([
    callApi<PaginatedResponse<BlogSummary>>("/blogs?page=1&limit=3", { method: "GET" }).catch(() => ({
      status: 200,
      data: {
        items: [],
        pagination: { page: 1, limit: 3, total: 0, totalPages: 0 },
      },
    })),
    callApi<DailyScriptureFeed>("/daily-scriptures/today", { method: "GET" }).catch(() => ({
      status: 200,
      data: {
        date: "",
        hasAdminScripture: false,
        rotationWindowMinutes: 60,
        activeIndex: -1,
        activeScripture: null,
        items: [],
      },
    })),
    callApi<PaginatedResponse<DevotionalSummary>>("/devotionals?page=1&limit=6", { method: "GET" }).catch(() => ({
      status: 200,
      data: {
        items: [],
        pagination: { page: 1, limit: 6, total: 0, totalPages: 0 },
      },
    })),
    callApi<VideoPaginatedResponse<VideoSummary>>("/videos?page=1&limit=1", { method: "GET" }).catch(() => ({
      status: 200,
      data: {
        items: [],
        pagination: { page: 1, limit: 1, total: 0, totalPages: 0 },
      },
    })),
    callApi<VideoPaginatedResponse<VideoSummary>>("/videos?page=1&limit=24&videoType=AVAD_DAY&sortBy=publishedAt&sortOrder=desc", { method: "GET" }).catch(() => ({
      status: 200,
      data: {
        items: [],
        pagination: { page: 1, limit: 24, total: 0, totalPages: 0 },
      },
    })),
    callApi<VideoPaginatedResponse<VideoSummary>>("/videos?page=1&limit=10&recommended=true", { method: "GET" }).catch(() => ({
      status: 200,
      data: {
        items: [],
        pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
      },
    })),
    callApi<VideoPaginatedResponse<VideoSummary>>("/videos?page=1&limit=24&sortBy=views&sortOrder=asc", { method: "GET" }).catch(() => ({
      status: 200,
      data: {
        items: [],
        pagination: { page: 1, limit: 24, total: 0, totalPages: 0 },
      },
    })),
  ]);

  const latestVideo = getHomeHeroYoutubeVideo();
  const latestFeaturedVideo = latestApiVideo.data.items[0] ?? null;
  const firstFiveRecommended = recommendedVideos.data.items
    .filter((video) => video.id !== latestFeaturedVideo?.id)
    .slice(0, 5);

  const featuredVideoItemsBase = latestFeaturedVideo
    ? [latestFeaturedVideo, ...firstFiveRecommended]
    : [...firstFiveRecommended];

  const fallbackNeeded = Math.max(0, 6 - featuredVideoItemsBase.length);
  const excludedIds = new Set(featuredVideoItemsBase.map((video) => video.id));
  const fallbackPool = lowestViewedVideos.data.items.filter((video) => !excludedIds.has(video.id));
  const stableFallback = [...fallbackPool].sort((first, second) => first.id.localeCompare(second.id)).slice(0, fallbackNeeded);

  const featuredVideoItems = [...featuredVideoItemsBase, ...stableFallback].slice(0, 6);
  const featuredVideoCards = featuredVideoItems.map(toVideoCardItem);
  const avadVideoCards = avadVideos.data.items.map(toVideoCardItem);
  const latestFeaturedVideoIsToday =
    latestFeaturedVideo ? isSameLocalCalendarDay(latestFeaturedVideo.publishedAt, new Date()) : false;

  return (
    <HomePage
      latestVideo={latestVideo}
      avadVideos={avadVideoCards}
      rotateAvadVideo={dailyScriptureFeed.data.hasAdminScripture}
      recentBlogs={blogs.data.items}
      dailyScripture={dailyScriptureFeed.data.activeScripture as DailyScriptureSummary | null}
      recentDevotionals={devotionals.data.items}
      recommendedVideos={featuredVideoCards}
      latestFeaturedVideoIsToday={latestFeaturedVideoIsToday}
    />
  );
}
