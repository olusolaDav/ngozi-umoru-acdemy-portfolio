"use client";

import { useEffect, useState } from "react";

import type { LatestYoutubeVideo } from "@/lib/youtube";
import type { VideoItem } from "@/types/content";

type HomeHeroVideoRotatorProps = {
  initialVideo: LatestYoutubeVideo;
  avadVideos: VideoItem[];
  enabled: boolean;
};

const HOUR_MS = 60 * 60 * 1000;

function getVideoForCurrentHour(videos: VideoItem[], now = new Date()) {
  if (!videos.length) {
    return null;
  }

  const utcHour = Math.floor(now.getTime() / HOUR_MS);
  return videos[utcHour % videos.length];
}

export function HomeHeroVideoRotator({ initialVideo, avadVideos, enabled }: HomeHeroVideoRotatorProps) {
  const [video, setVideo] = useState<LatestYoutubeVideo | VideoItem>(
    enabled ? (getVideoForCurrentHour(avadVideos) ?? initialVideo) : initialVideo,
  );

  useEffect(() => {
    if (!enabled || !avadVideos.length) {
      return;
    }

    const updateVideo = () => {
      const nextVideo = getVideoForCurrentHour(avadVideos);
      if (nextVideo) {
        setVideo(nextVideo);
      }
    };

    const millisecondsUntilNextHour = HOUR_MS - (Date.now() % HOUR_MS);
    let interval: number | undefined;
    const timeout = window.setTimeout(() => {
      updateVideo();
      interval = window.setInterval(updateVideo, HOUR_MS);
    }, millisecondsUntilNextHour);

    return () => {
      window.clearTimeout(timeout);
      if (interval !== undefined) {
        window.clearInterval(interval);
      }
    };
  }, [avadVideos, enabled]);

  return (
    <iframe
      title="Latest YouTube video"
      src={video.embedUrl}
      className="aspect-video w-full"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      referrerPolicy="strict-origin-when-cross-origin"
      allowFullScreen
    />
  );
}