import { XMLParser } from "fast-xml-parser";

const DEFAULT_FALLBACK_EMBED = "https://www.youtube.com/embed/hIYbeKajjCw";
const DEFAULT_HOME_HERO_VIDEO_ID = "hIYbeKajjCw";

type YoutubeFeedEntry = {
  "yt:videoId"?: string;
  title?: string;
  published?: string;
};

type YoutubeFeed = {
  feed?: {
    entry?: YoutubeFeedEntry | YoutubeFeedEntry[];
  };
};

export type LatestYoutubeVideo = {
  embedUrl: string;
  title?: string;
  publishedAt?: string;
  source: "youtube-feed" | "fallback" | "configured";
};

export function getHomeHeroYoutubeVideo(): LatestYoutubeVideo {
  const videoId = process.env.NEXT_PUBLIC_HOME_HERO_YOUTUBE_ID?.trim() || DEFAULT_HOME_HERO_VIDEO_ID;

  return {
    embedUrl: `https://www.youtube.com/embed/${videoId}`,
    source: "configured",
  };
}

export async function getLatestYoutubeVideo(): Promise<LatestYoutubeVideo> {
  const channelId = process.env.YOUTUBE_CHANNEL_ID;
  const fallbackEmbed = process.env.NEXT_PUBLIC_FALLBACK_YOUTUBE_EMBED ?? DEFAULT_FALLBACK_EMBED;

  if (!channelId) {
    return { embedUrl: fallbackEmbed, source: "fallback" };
  }

  try {
    const response = await fetch(
      `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`,
      {
        next: { revalidate: 900 },
      },
    );

    if (!response.ok) {
      return { embedUrl: fallbackEmbed, source: "fallback" };
    }

    const xml = await response.text();
    const parser = new XMLParser({ ignoreAttributes: false });
    const parsed = parser.parse(xml) as YoutubeFeed;

    const entry = Array.isArray(parsed.feed?.entry)
      ? parsed.feed?.entry[0]
      : parsed.feed?.entry;

    const videoId = entry?.["yt:videoId"];
    if (!videoId) {
      return { embedUrl: fallbackEmbed, source: "fallback" };
    }

    return {
      embedUrl: `https://www.youtube.com/embed/${videoId}`,
      title: entry?.title?.trim() || undefined,
      publishedAt: entry?.published,
      source: "youtube-feed",
    };
  } catch {
    return { embedUrl: fallbackEmbed, source: "fallback" };
  }
}
