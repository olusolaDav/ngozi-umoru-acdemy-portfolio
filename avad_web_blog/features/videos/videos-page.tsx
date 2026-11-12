"use client";

import { Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { BlogCard } from "@/components/cards/blog-card";
import { VideoCard } from "@/components/cards/video-card";
import { CommunityCta } from "@/components/sections/community-cta";
import { NewsletterSection } from "@/components/sections/newsletter-section";
import { SectionShell } from "@/components/ui/section-shell";
import { stripHtml, toRelativePostedTime, type BlogSummary } from "@/lib/blog";
import { getJson } from "@/lib/http";
import { toVideoCardItem, type PaginatedResponse, type VideoPlaylistSummary, type VideoSummary } from "@/lib/video";
import { cn } from "@/lib/utils";

type SortBy = "publishedAt" | "createdAt" | "views" | "title";
type SortOrder = "asc" | "desc";
type VideoTypeFilter = "AVAD_DAY" | "MEMOIR_FROM_THE_FATHER";
type PublicTab = "ALL" | "RECOMMENDED" | VideoTypeFilter | string;

const VIDEO_TYPE_TABS: Array<{ value: VideoTypeFilter; label: string }> = [
  { value: "AVAD_DAY", label: "AVAD Videos" },
  { value: "MEMOIR_FROM_THE_FATHER", label: "Memoir from the Father" },
];

type VideosPageProps = {
  featuredVideo: {
    title: string;
    embedUrl: string;
    publishedAt: string;
  };
  videos: VideoSummary[];
  playlists: VideoPlaylistSummary[];
  initialPagination: PaginatedResponse<VideoSummary>["pagination"];
  recentBlogs: BlogSummary[];
};

const PAGE_SIZE_OPTIONS = [10, 20, 30, 50, 100];

function buildPageItems(current: number, total: number) {
  if (total <= 1) {
    return [1];
  }

  const pages = new Set<number>([1, total]);
  for (let page = current - 1; page <= current + 1; page += 1) {
    if (page >= 1 && page <= total) {
      pages.add(page);
    }
  }

  return Array.from(pages).sort((a, b) => a - b);
}

export function VideosPage({ featuredVideo, videos: initialVideos, playlists: initialPlaylists, initialPagination, recentBlogs }: VideosPageProps) {
  const [activeTab, setActiveTab] = useState<PublicTab>("ALL");
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortBy>("publishedAt");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [categoryFilter, setCategoryFilter] = useState("ALL");

  const [videos, setVideos] = useState<VideoSummary[]>(initialVideos);
  const [pagination, setPagination] = useState(initialPagination);
  const [playlists, setPlaylists] = useState<VideoPlaylistSummary[]>(initialPlaylists);
  const [hasRecommendedVideos, setHasRecommendedVideos] = useState(false);
  const [tabCounts, setTabCounts] = useState<Record<string, number>>({ ALL: initialPagination.total });
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const pageItems = useMemo(() => buildPageItems(pagination.page, Math.max(pagination.totalPages, 1)), [pagination.page, pagination.totalPages]);

  const categoryOptions = useMemo(() => {
    const categories = new Set<string>();
    for (const video of videos) {
      if (video.category?.trim()) {
        categories.add(video.category.trim());
      }
    }
    return ["ALL", ...Array.from(categories).sort((a, b) => a.localeCompare(b))];
  }, [videos]);

  const featured = featuredVideo;

  async function loadVideos(next: {
    page?: number;
    limit?: number;
    tab?: PublicTab;
    search?: string;
    sortBy?: SortBy;
    sortOrder?: SortOrder;
    categoryFilter?: string;
  } = {}) {
    const page = next.page ?? pagination.page;
    const limit = next.limit ?? pagination.limit;
    const tab = next.tab ?? activeTab;
    const search = next.search ?? searchQuery;
    const nextSortBy = next.sortBy ?? sortBy;
    const nextSortOrder = next.sortOrder ?? sortOrder;
    const nextCategoryFilter = next.categoryFilter ?? categoryFilter;

    setLoading(true);
    setErrorMessage(null);

    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
        sortBy: nextSortBy,
        sortOrder: nextSortOrder,
      });

      if (search.trim()) {
        params.set("search", search.trim());
      }

      if (tab === "RECOMMENDED") {
        params.set("recommended", "true");
      } else if (tab === "AVAD_DAY" || tab === "MEMOIR_FROM_THE_FATHER") {
        params.set("videoType", tab);
      } else if (tab !== "ALL") {
        params.set("playlistId", tab);
      }

      if (nextCategoryFilter !== "ALL") {
        params.set("category", nextCategoryFilter);
      }

      const data = await getJson<PaginatedResponse<VideoSummary>>(`/api/videos?${params.toString()}`);
      setVideos(data.items);
      setPagination(data.pagination);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to load videos.";
      setErrorMessage(message);
      setVideos([]);
      setPagination((prev) => ({
        page: 1,
        limit: prev.limit,
        total: 0,
        totalPages: 1,
      }));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      async function loadTabCounts() {
        try {
          const loadedPlaylists = await getJson<VideoPlaylistSummary[]>("/api/videos/playlists");
          setPlaylists(loadedPlaylists);

          const countRequests = [
            ...VIDEO_TYPE_TABS.map((tab) => ({ key: tab.value, params: `videoType=${tab.value}` })),
            { key: "RECOMMENDED", params: "recommended=true" },
            ...loadedPlaylists.map((playlist) => ({ key: playlist.id, params: `playlistId=${playlist.id}` })),
          ];
          const countResults = await Promise.all(
            countRequests.map(async ({ key, params }) => {
              const data = await getJson<PaginatedResponse<VideoSummary>>(`/api/videos?page=1&limit=1&${params}`);
              return [key, data.pagination.total] as const;
            }),
          );

          const nextCounts = Object.fromEntries([["ALL", initialPagination.total], ...countResults]);
          setTabCounts(nextCounts);
          setHasRecommendedVideos((nextCounts.RECOMMENDED ?? 0) > 0);
        } catch {
          setPlaylists(initialPlaylists);
          setHasRecommendedVideos(false);
        }
      }

      void loadTabCounts();
    }, 0);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <section className="mx-auto mt-12 w-full max-w-[1320px] px-4 text-center md:mt-14 md:px-6 lg:px-8 xl:mt-16 xl:px-10 2xl:mt-20">
        <h1 className="font-serif text-[clamp(2.8rem,6vw,4.5rem)] font-bold text-[var(--avad-text-strong)]">Our Videos</h1>
        <div className="mx-auto mt-6 flex max-w-[760px] flex-wrap items-center gap-2 rounded-2xl bg-[var(--avad-bg-elevated)] p-2 shadow-md">
          <div className="relative min-w-0 flex-1 basis-full sm:basis-auto">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--avad-text-soft)]" />
            <input
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  const nextSearch = event.currentTarget.value.trim();
                  setSearchQuery(nextSearch);
                  void loadVideos({ page: 1, search: nextSearch });
                }
              }}
              placeholder="Search videos by title or words"
              className="h-11 w-full rounded-xl border border-[var(--avad-border)] bg-transparent pl-9 pr-3 text-sm text-[var(--avad-text)] outline-none"
            />
          </div>
          <button
            onClick={() => {
              const nextSearch = searchInput.trim();
              setSearchQuery(nextSearch);
              void loadVideos({ page: 1, search: nextSearch });
            }}
            className="h-11 rounded-xl bg-[#725980] px-6 text-sm font-semibold text-white"
          >
            Search
          </button>
        </div>
      </section>

      <section className="mx-auto mt-14 w-full max-w-[1320px] px-4 md:mt-16 md:px-6 lg:px-8 xl:mt-20 xl:px-10 2xl:mt-24">
        <div className="mb-5 border-b border-[var(--avad-border)] pb-3">
          <h2 className="font-serif text-[clamp(2.4rem,4.8vw,3.2rem)] font-bold text-[var(--avad-text-strong)]">Recently Uploaded Video</h2>
        </div>

        <article className="overflow-hidden rounded-[28px] bg-[var(--avad-purple)] p-2 md:p-5">
          <iframe
            title="Recently uploaded video"
            src={featured.embedUrl}
            className="aspect-video w-full rounded-xl border-[4px] border-[var(--avad-purple)] bg-black md:border-[10px]"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          />
          <h3 className="mt-4 font-serif text-2xl font-bold leading-tight text-[var(--avad-gold)] md:text-4xl">{featured.title}</h3>
          <p className="mt-2 text-sm text-[#f0d7ff]">{toRelativePostedTime(featured.publishedAt)}</p>
        </article>
      </section>

      <section className="mx-auto mt-14 w-full max-w-[1320px] px-4 md:mt-16 md:px-6 lg:px-8 xl:mt-20 xl:px-10 2xl:mt-24">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-[var(--avad-border)] pb-2">
          <h2 className="font-serif text-[clamp(2.2rem,4.8vw,3rem)] font-bold text-[var(--avad-text-strong)]">Videos</h2>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <select
              value={sortBy}
              onChange={(event) => {
                const nextSortBy = event.target.value as SortBy;
                setSortBy(nextSortBy);
                void loadVideos({ page: 1, sortBy: nextSortBy });
              }}
              className="rounded-full border border-[var(--avad-border)] bg-[var(--avad-bg-elevated)] px-3 py-1.5 text-[var(--avad-text)]"
            >
              <option value="publishedAt">Sort: Published</option>
              <option value="createdAt">Sort: Imported</option>
              <option value="views">Sort: Views</option>
              <option value="title">Sort: Title</option>
            </select>

            <select
              value={sortOrder}
              onChange={(event) => {
                const nextSortOrder = event.target.value as SortOrder;
                setSortOrder(nextSortOrder);
                void loadVideos({ page: 1, sortOrder: nextSortOrder });
              }}
              className="rounded-full border border-[var(--avad-border)] bg-[var(--avad-bg-elevated)] px-3 py-1.5 text-[var(--avad-text)]"
            >
              <option value="desc">Desc</option>
              <option value="asc">Asc</option>
            </select>

            <select
              value={categoryFilter}
              onChange={(event) => {
                const nextCategoryFilter = event.target.value;
                setCategoryFilter(nextCategoryFilter);
                void loadVideos({ page: 1, categoryFilter: nextCategoryFilter });
              }}
              className="rounded-full border border-[var(--avad-border)] bg-[var(--avad-bg-elevated)] px-3 py-1.5 text-[var(--avad-text)]"
            >
              {categoryOptions.map((option) => (
                <option key={option} value={option}>
                  {option === "ALL" ? "All Categories" : option}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mb-5 flex gap-3 overflow-x-auto border-b border-[var(--avad-border)] pb-3 text-sm text-[var(--avad-text)]" role="tablist" aria-label="Video categories">
          <button
            onClick={() => {
              setActiveTab("ALL");
              void loadVideos({ page: 1, tab: "ALL" });
            }}
            className={cn("min-h-11 shrink-0 whitespace-nowrap border-b px-2 pb-2", activeTab === "ALL" ? "border-[var(--avad-gold)] text-[var(--avad-text-strong)]" : "border-transparent text-[var(--avad-text-soft)]")}
            role="tab"
            aria-selected={activeTab === "ALL"}
          >
              All Videos ({tabCounts.ALL ?? 0})
          </button>

          {VIDEO_TYPE_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => {
                setActiveTab(tab.value);
                void loadVideos({ page: 1, tab: tab.value });
              }}
              className={cn(
                "min-h-11 shrink-0 whitespace-nowrap border-b px-2 pb-2",
                activeTab === tab.value ? "border-[var(--avad-gold)] text-[var(--avad-text-strong)]" : "border-transparent text-[var(--avad-text-soft)]",
              )}
            >
              {tab.label} ({tabCounts[tab.value] ?? 0})
            </button>
          ))}

          {hasRecommendedVideos ? (
            <button
              onClick={() => {
                setActiveTab("RECOMMENDED");
                void loadVideos({ page: 1, tab: "RECOMMENDED" });
              }}
              className={cn(
                "min-h-11 shrink-0 whitespace-nowrap border-b px-2 pb-2",
                activeTab === "RECOMMENDED" ? "border-[var(--avad-gold)] text-[var(--avad-text-strong)]" : "border-transparent text-[var(--avad-text-soft)]",
              )}
            >
              Recommended ({tabCounts.RECOMMENDED ?? 0})
            </button>
          ) : null}

          {playlists.map((playlist) => (
            <button
              key={playlist.id}
              onClick={() => {
                setActiveTab(playlist.id);
                void loadVideos({ page: 1, tab: playlist.id });
              }}
              className={cn(
                "min-h-11 shrink-0 whitespace-nowrap border-b px-2 pb-2",
                activeTab === playlist.id ? "border-[var(--avad-gold)] text-[var(--avad-text-strong)]" : "border-transparent text-[var(--avad-text-soft)]",
              )}
            >
              {playlist.name} ({tabCounts[playlist.id] ?? 0})
            </button>
          ))}
        </div>

        {errorMessage ? (
          <div className="mb-4 rounded-xl border border-[#f3d8cf] bg-[#fff2ee] px-3 py-2 text-sm text-[#9a4127] dark:border-[#7a3830] dark:bg-[#3b1f1b] dark:text-[#ffc8bb]">{errorMessage}</div>
        ) : null}

        {loading ? <p className="mb-6 text-sm text-[var(--avad-text-soft)]">Loading videos...</p> : null}

        {!loading && videos.length === 0 ? <p className="mb-6 text-sm text-[var(--avad-text-soft)]">No videos found.</p> : null}

        {videos.length > 0 ? (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {videos.map((video) => (
              <VideoCard key={video.id} video={toVideoCardItem(video)} />
            ))}
          </div>
        ) : null}

        <div className="mt-8 flex flex-col gap-4 text-sm text-[var(--avad-text)] sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
          <p>
            Showing {videos.length} video(s) of {pagination.total}
          </p>

          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
            <label className="flex items-center gap-2 text-xs">
              Per page
              <select
                value={pagination.limit}
                onChange={(event) => {
                  const nextLimit = Number(event.target.value);
                  void loadVideos({ page: 1, limit: nextLimit });
                }}
                className="rounded-full border border-[var(--avad-border)] bg-[var(--avad-bg-elevated)] px-3 py-1 text-xs text-[var(--avad-text)]"
              >
                {PAGE_SIZE_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>

            <div className="flex items-center justify-between gap-1 text-xs text-[var(--avad-text)] sm:justify-start sm:gap-2" aria-label="Video pagination">
              <button
                onClick={() => void loadVideos({ page: Math.max(1, pagination.page - 1) })}
                disabled={pagination.page <= 1}
                className="min-h-11 rounded-full px-3 py-2 text-[var(--avad-text-soft)] disabled:opacity-40"
              >
                Back
              </button>

              {pageItems.map((pageNumber, index) => {
                const previous = pageItems[index - 1];
                const showGap = typeof previous === "number" && pageNumber - previous > 1;
                return (
                  <div key={pageNumber} className="flex items-center gap-2">
                    {showGap ? <span className="text-[var(--avad-text-soft)]">...</span> : null}
                    <button
                      onClick={() => void loadVideos({ page: pageNumber })}
                      className={cn(
                        "grid size-10 place-items-center rounded-full",
                        pagination.page === pageNumber
                          ? "bg-gradient-to-b from-[#c99556] to-[#3a1a56] text-white"
                          : "border border-[var(--avad-border)] text-[var(--avad-text)]",
                      )}
                    >
                      {pageNumber}
                    </button>
                  </div>
                );
              })}

              <button
                onClick={() => void loadVideos({ page: Math.min(pagination.totalPages || 1, pagination.page + 1) })}
                disabled={pagination.page >= pagination.totalPages}
                className="min-h-11 rounded-full px-3 py-2 text-[var(--avad-text)] disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </section>

      <CommunityCta className="mt-14 md:mt-16 xl:mt-20 2xl:mt-24" />

      <section className="mt-14 md:mt-16 xl:mt-20 2xl:mt-24">
        <SectionShell title="Blog Posts" actionLabel="SEE ALL" actionHref="/blog">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {recentBlogs.map((blog) => (
              <BlogCard
                key={blog.id}
                blog={{
                  id: blog.id,
                  title: blog.title,
                  excerpt: blog.excerpt || stripHtml(blog.content).slice(0, 160),
                  authorName: blog.authorName,
                  likes: blog.likes,
                  comments: blog.commentsCount,
                  bookmarks: 0,
                  shares: blog.shares,
                  postedAgo: toRelativePostedTime(blog.publishedAt ?? blog.createdAt),
                  thumbnail: blog.thumbnail,
                  href: `/blog/${blog.slug}`,
                }}
              />
            ))}
          </div>
        </SectionShell>
      </section>

      <NewsletterSection className="mt-14 md:mt-16 xl:mt-20 2xl:mt-24" />
    </>
  );
}
