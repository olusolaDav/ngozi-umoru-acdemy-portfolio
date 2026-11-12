import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { StructuredData } from "@/components/seo/structured-data";
import { callApi } from "@/lib/server-api";
import { absoluteUrl, contentMetadata, SITE_NAME, videoSearchKeywords } from "@/lib/seo";
import type { PaginatedResponse, VideoSummary } from "@/lib/video";

type VideoPageProps = { params: Promise<{ videoId: string }> };

async function getVideo(videoId: string) {
  const result = await callApi<PaginatedResponse<VideoSummary>>(`/videos?youtubeVideoId=${encodeURIComponent(videoId)}&page=1&limit=1`, { method: "GET", next: { revalidate: 900 } }).catch(() => null);
  return result?.data.items[0] ?? null;
}

export async function generateMetadata({ params }: VideoPageProps): Promise<Metadata> {
  const { videoId } = await params;
  const video = await getVideo(videoId);
  if (!video) return { title: "Video Not Found", robots: { index: false, follow: false } };

  return contentMetadata({
    title: video.title,
    description: video.description || `Watch ${video.title} from ${SITE_NAME}.`,
    path: `/videos/${video.youtubeVideoId}`,
    image: video.thumbnailUrl || `https://i.ytimg.com/vi/${video.youtubeVideoId}/hqdefault.jpg`,
    type: "article",
    publishedTime: video.publishedAt,
    modifiedTime: video.updatedAt,
    tags: videoSearchKeywords(video.title, video.category),
  });
}

export default async function VideoPage({ params }: VideoPageProps) {
  const { videoId } = await params;
  const video = await getVideo(videoId);
  if (!video) notFound();

  const canonicalUrl = absoluteUrl(`/videos/${video.youtubeVideoId}`);
  const thumbnail = video.thumbnailUrl || `https://i.ytimg.com/vi/${video.youtubeVideoId}/hqdefault.jpg`;
  const searchKeywords = videoSearchKeywords(video.title, video.category);
  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <StructuredData data={{ "@context": "https://schema.org", "@type": "VideoObject", name: video.title, description: video.description || video.title, thumbnailUrl: [thumbnail], uploadDate: video.publishedAt, dateModified: video.updatedAt, contentUrl: video.youtubeUrl, embedUrl: `https://www.youtube.com/embed/${video.youtubeVideoId}`, publisher: { "@type": "Organization", name: SITE_NAME, url: absoluteUrl("/") }, mainEntityOfPage: { "@type": "WebPage", "@id": canonicalUrl } }} />
      <nav aria-label="Breadcrumb" className="mb-6 text-sm text-slate-500">Home / Videos / {video.title}</nav>
      <h1 className="mb-6 text-3xl font-bold tracking-tight md:text-5xl">{video.title}</h1>
      <div className="aspect-video overflow-hidden rounded-2xl bg-black shadow-xl">
        <iframe className="h-full w-full" src={`https://www.youtube.com/embed/${video.youtubeVideoId}`} title={video.title} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen />
      </div>
      {video.description ? <p className="mt-8 whitespace-pre-line text-lg leading-8 text-slate-700">{video.description}</p> : null}
      <section aria-label="Video topics" className="mt-8 border-t border-slate-200 pt-6">
        <h2 className="text-lg font-semibold text-slate-900">Topics in this video</h2>
        <p className="mt-2 text-slate-600">{searchKeywords.slice(1).join(" • ")}</p>
      </section>
      <p className="mt-6 text-sm text-slate-500">Watch more Christian videos, Bible teaching, and daily Scripture from AVAD.</p>
    </main>
  );
}