"use client";

import Image from "next/image";
import Link from "next/link";
import { Calendar, CalendarDays, Check, Clock3, Heart, MessageCircle, Share2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { NewsletterSection } from "@/components/sections/newsletter-section";
import { estimateReadTimeFromContent, formatDevotionalDate, safeThumbnailSrc, type DevotionalComment, type DevotionalSummary, type PaginatedResponse, stripHtml } from "@/lib/devotional";
import { getJson } from "@/lib/http";
import { cn } from "@/lib/utils";

type ViewMode = "POSTS" | "COMMENTS";
type CommentTab = "UNPUBLISHED" | "PUBLISHED";

type AdminComment = Omit<DevotionalComment, "replies"> & {
  devotional?: {
    id: string;
    title: string;
    slug: string;
    authorId: string | null;
  };
  repliesCount: number;
};

type AdminCommentsResponse = PaginatedResponse<AdminComment> & {
  statusTotals: {
    unpublished: number;
    published: number;
  };
};

function millisecondsUntilNextLocalDay(from: Date) {
  const next = new Date(from);
  next.setHours(24, 0, 0, 0);
  return Math.max(1_000, next.getTime() - from.getTime());
}

function sameCalendarDay(left: string | Date, right: Date) {
  const leftDate = new Date(left);
  return (
    leftDate.getFullYear() === right.getFullYear() &&
    leftDate.getMonth() === right.getMonth() &&
    leftDate.getDate() === right.getDate()
  );
}

export function DevotionalsPage() {
  const [viewMode, setViewMode] = useState<ViewMode>("POSTS");
  const [commentTab, setCommentTab] = useState<CommentTab>("UNPUBLISHED");
  const [search, setSearch] = useState("");
  const [posts, setPosts] = useState<DevotionalSummary[]>([]);
  const [recommendedPosts, setRecommendedPosts] = useState<DevotionalSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [sessionResolved, setSessionResolved] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [comments, setComments] = useState<AdminComment[]>([]);
  const [commentLoading, setCommentLoading] = useState(false);
  const [commentStatusTotals, setCommentStatusTotals] = useState({ unpublished: 0, published: 0 });
  const [commentSelectMode, setCommentSelectMode] = useState(false);
  const [selectedCommentIds, setSelectedCommentIds] = useState<string[]>([]);
  const [expandedCommentIds, setExpandedCommentIds] = useState<Record<string, boolean>>({});
  const [commentPagination, setCommentPagination] = useState<PaginatedResponse<AdminComment>["pagination"]>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });

  useEffect(() => {
    let active = true;
    let dayRolloverTimer: ReturnType<typeof setTimeout> | null = null;

    async function loadPosts() {
      const [data, recommendedData] = await Promise.all([
        getJson<PaginatedResponse<DevotionalSummary>>("/api/devotionals?page=1&limit=100"),
        getJson<PaginatedResponse<DevotionalSummary>>("/api/devotionals?page=1&limit=3&recommended=true"),
      ]);
      if (!active) {
        return;
      }
      setPosts(data.items);
      setRecommendedPosts(recommendedData.items);
      setLoading(false);
    }

    function scheduleDayRolloverRefresh() {
      const delay = millisecondsUntilNextLocalDay(new Date());
      dayRolloverTimer = setTimeout(() => {
        void loadPosts();
        scheduleDayRolloverRefresh();
      }, delay);
    }

    function handleVisibilityChange() {
      if (document.visibilityState === "visible") {
        void loadPosts();
      }
    }

    void loadPosts();
    scheduleDayRolloverRefresh();
    document.addEventListener("visibilitychange", handleVisibilityChange);

    const timer = setInterval(() => {
      void loadPosts();
    }, 30_000);

    return () => {
      active = false;
      clearInterval(timer);
      if (dayRolloverTimer) {
        clearTimeout(dayRolloverTimer);
      }
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  useEffect(() => {
    let active = true;

    async function loadSession() {
      try {
        const response = await fetch("/api/auth/session", { cache: "no-store" });
        if (!active) {
          return;
        }

        setIsAuthenticated(response.ok);
      } catch {
        if (active) {
          setIsAuthenticated(false);
        }
      } finally {
        if (active) {
          setSessionResolved(true);
        }
      }
    }

    void loadSession();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!sessionResolved || !isAuthenticated || viewMode !== "COMMENTS") {
      return;
    }

    void loadComments(1, commentTab, search);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionResolved, isAuthenticated, viewMode, commentTab]);

  async function loadComments(page: number, status: CommentTab, searchTerm: string) {
    setCommentLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: "10",
        status,
      });

      if (searchTerm.trim()) {
        params.set("search", searchTerm.trim());
      }

      const data = await getJson<AdminCommentsResponse>(`/api/dashboard/devotionals/comments?${params.toString()}`);
      setComments(data.items);
      setCommentStatusTotals(data.statusTotals);
      setCommentPagination(data.pagination);
    } finally {
      setCommentLoading(false);
    }
  }

  const allTags = useMemo(() => ["All Tags", ...new Set(posts.flatMap((post) => post.tags))], [posts]);
  const [activeTag, setActiveTag] = useState("All Tags");

  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      const tagMatch = activeTag === "All Tags" || post.tags.includes(activeTag);
      const searchTerm = search.toLowerCase();
      const searchMatch = post.title.toLowerCase().includes(searchTerm) || post.excerpt.toLowerCase().includes(searchTerm);
      return tagMatch && searchMatch;
    });
  }, [activeTag, posts, search]);

  const popularPosts = [...filteredPosts].sort((left, right) => right.views - left.views).slice(0, 5);

  const todaysRead = useMemo(() => {
    const today = new Date();
    return posts.find((post) => sameCalendarDay(post.devotionalDate, today)) ?? null;
  }, [posts]);

  return (
    <>
      <section className="mx-auto mt-12 w-full max-w-[1320px] px-4 md:mt-14 md:px-6 lg:px-8 xl:mt-16 xl:px-10 2xl:mt-20">
        <div className="mx-auto flex w-fit items-center gap-2">
          <button
            type="button"
            onClick={() => setViewMode("POSTS")}
            className={cn(
              "rounded-full border px-3 py-1 text-[11px] font-semibold",
              viewMode === "POSTS" ? "border-[#c99556] bg-[#d39a52] text-white" : "border-[var(--avad-border)] bg-[var(--avad-bg-elevated)] text-[var(--avad-text)]",
            )}
          >
            Devotionals
          </button>
          <button
            type="button"
            onClick={() => setViewMode("COMMENTS")}
            className={cn(
              "rounded-full border px-3 py-1 text-[11px] font-semibold",
              viewMode === "COMMENTS" ? "border-[#c99556] bg-[#d39a52] text-white" : "border-[var(--avad-border)] bg-[var(--avad-bg-elevated)] text-[var(--avad-text)]",
            )}
          >
            Comments
          </button>
        </div>
        <h1 className="text-center font-serif text-[clamp(2.4rem,5vw,3.6rem)] font-bold text-[var(--avad-text-strong)]">Daily Devotionals</h1>
        <div className="mx-auto mt-4 flex max-w-[420px] rounded-xl bg-[var(--avad-bg-elevated)] p-1.5 shadow-sm">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={viewMode === "COMMENTS" ? "Search by comment or post title" : "Search for..."}
            onKeyDown={(event) => {
              if (event.key === "Enter" && viewMode === "COMMENTS" && isAuthenticated) {
                void loadComments(1, commentTab, search);
              }
            }}
            className="h-10 flex-1 rounded-lg bg-transparent px-3 text-sm text-[var(--avad-text)] outline-none"
          />
          <button
            className="h-10 cursor-pointer rounded-lg bg-[#725980] px-7 text-xs font-semibold text-white"
            onClick={() => {
              if (viewMode === "COMMENTS" && isAuthenticated) {
                void loadComments(1, commentTab, search);
              }
            }}
          >
            Search
          </button>
        </div>
      </section>

      {viewMode === "POSTS" ? (
        <>
          <section className="mx-auto mt-14 w-full max-w-[1320px] px-4 md:mt-16 md:px-6 lg:px-8 xl:mt-20 xl:px-10 2xl:mt-24">
            <div className="mb-4 border-b border-[var(--avad-border)] pb-2">
              <h2 className="font-serif text-[clamp(2.1rem,4vw,3rem)] font-bold text-[var(--avad-text-strong)]">Today&apos;s Read</h2>
            </div>

        {todaysRead ? (
          <Link href={`/devotionals/${todaysRead.slug}`} className="block cursor-pointer">
            <article className="mx-auto max-w-[980px] rounded-[28px] bg-[#311048] p-6 shadow-lg">
              <div className="grid items-center gap-4 rounded-[20px] bg-[#2b0f41] p-4 md:grid-cols-[1fr_250px] md:p-5">
                <div>
                  <h3 className="font-serif text-[clamp(1.8rem,3vw,2.6rem)] font-bold leading-[1.05] text-[var(--avad-gold)]">
                    {todaysRead.title}
                  </h3>
                  <p className="mt-3 text-[13px] leading-5 text-[#f3e9fa]">{todaysRead.excerpt || stripHtml(todaysRead.content).slice(0, 180)}...</p>
                  <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-[var(--avad-gold)]">
                    <span className="inline-flex items-center gap-1"><Calendar size={12} /> {formatDevotionalDate(todaysRead.devotionalDate)}</span>
                    <span className="inline-flex items-center gap-1"><Clock3 size={12} /> {estimateReadTimeFromContent(todaysRead.content)} Min</span>
                    <span className="inline-flex items-center gap-1"><Heart size={12} /> {todaysRead.likes}</span>
                    <span className="inline-flex items-center gap-1"><Share2 size={12} /> {todaysRead.shares}</span>
                    <span className="inline-flex items-center gap-1"><MessageCircle size={12} /> {todaysRead.commentsCount}</span>
                  </div>
                </div>
                <div className="relative block h-36 overflow-hidden rounded-md bg-white md:h-40">
                  <Image src={safeThumbnailSrc(todaysRead.thumbnail, todaysRead.title)} alt={todaysRead.title} fill sizes="(max-width: 768px) 100vw, 250px" className="object-cover" />
                </div>
              </div>
            </article>
          </Link>
        ) : loading ? (
          <p className="text-sm text-[var(--avad-text-soft)]">Loading today&apos;s read...</p>
        ) : (
          <p className="text-sm text-[var(--avad-text-soft)]">Today&apos;s devotional has not been published yet. Please check back soon.</p>
        )}
          </section>

          <section className="mx-auto mt-14 grid w-full max-w-[1320px] gap-8 px-4 md:mt-16 md:px-6 lg:grid-cols-[2fr_1fr] lg:px-8 xl:mt-20 xl:px-10 2xl:mt-24">
            <div>
          <div className="mb-6 flex flex-wrap items-center gap-2">
            {allTags.map((tag) => {
              const active = tag === activeTag;
              return (
                <button
                  key={tag}
                  onClick={() => setActiveTag(tag)}
                  className={[
                    "cursor-pointer rounded-full border px-3 py-1 text-[11px]",
                    active ? "border-[#311048] bg-[#311048] text-white" : "border-[var(--avad-border)] bg-[var(--avad-bg-elevated)] text-[var(--avad-text)]",
                  ].join(" ")}
                >
                  {tag}
                </button>
              );
            })}
          </div>

          <div className="space-y-5">
            {loading ? <p className="text-sm text-[var(--avad-text-soft)]">Loading devotionals...</p> : null}

            {filteredPosts.map((post) => (
              <article key={post.id} className="relative grid min-w-0 items-center gap-4 rounded-3xl border border-[var(--avad-border)] p-3 transition-all duration-200 hover:-translate-y-[2px] hover:bg-[var(--avad-bg-elevated)] hover:shadow-lg sm:gap-5 md:grid-cols-[minmax(0,1fr)_180px]">
                <div>
                  <span className="inline-flex rounded-full bg-[#311048] px-3 py-1 text-[11px] text-[var(--avad-gold)]">{post.tags[0] ?? "Faith"}</span>
                  <h2 className="mt-2 font-serif text-[21px] font-bold leading-[1.08] text-[var(--avad-text-strong)] md:text-[24px]">{post.title}</h2>
                  <p className="mt-2 text-[13px] leading-5 text-[var(--avad-text-soft)]">{post.excerpt || stripHtml(post.content).slice(0, 180)}...</p>
                  <p className="mt-2 text-xs text-[var(--avad-text-soft)]">By {post.authorName}</p>
                  <div className="mt-3 flex flex-wrap items-center gap-4 text-[12px] text-[var(--avad-text)]">
                    <span className="inline-flex items-center gap-1"><Calendar size={13} /> {formatDevotionalDate(post.devotionalDate)}</span>
                    <span className="inline-flex items-center gap-1"><Clock3 size={13} /> {estimateReadTimeFromContent(post.content)} Min</span>
                    <span className="inline-flex items-center gap-1"><Heart size={13} /> {post.likes} Likes</span>
                    <span className="inline-flex items-center gap-1"><Share2 size={13} /> {post.shares} Shares</span>
                  </div>
                </div>
                <div className="relative block h-[180px] overflow-hidden rounded-lg">
                  <Image src={safeThumbnailSrc(post.thumbnail, post.title)} alt={post.title} fill sizes="(max-width: 768px) 100vw, 180px" className="object-cover" />
                </div>
                <Link href={`/devotionals/${post.slug}`} aria-label={`Open devotional: ${post.title}`} className="absolute inset-0 z-10 rounded-3xl cursor-pointer" />
              </article>
            ))}
          </div>

          {filteredPosts.length === 0 && !loading ? <p className="text-sm text-[var(--avad-text-soft)]">No published devotionals match your search yet.</p> : null}
          </div>

          <aside className="space-y-10">
          {recommendedPosts.length > 0 ? <div>
            <h3 className="mb-3 border-b border-[var(--avad-border)] pb-2 font-serif text-[clamp(1.5rem,3vw,2rem)] font-bold text-[var(--avad-text-strong)]">
              Recommended
            </h3>
            <div className="space-y-4">
              {recommendedPosts.map((post) => (
                <article key={post.id} className="grid grid-cols-[96px_1fr] gap-3 rounded-2xl border border-[var(--avad-border)] p-2 transition-all duration-200 hover:bg-[var(--avad-bg-elevated)] hover:shadow-lg">
                  <Link href={`/devotionals/${post.slug}`} className="relative block h-20 overflow-hidden rounded-lg">
                    <Image src={safeThumbnailSrc(post.thumbnail, post.title)} alt={post.title} fill sizes="96px" className="object-cover" />
                  </Link>
                  <div>
                    <span className="inline-flex rounded-full bg-[#311048] px-2 py-0.5 text-[10px] text-[var(--avad-gold)]">{post.tags[0] ?? "Faith"}</span>
                    <p className="mt-1 inline-flex items-center gap-1 text-[11px] text-[var(--avad-text)]"><Clock3 size={11} /> {estimateReadTimeFromContent(post.content)} Min</p>
                    <p className="mt-1 text-[11px] text-[var(--avad-text-soft)]">By {post.authorName}</p>
                    <h4 className="mt-1 font-serif text-lg font-bold leading-5"><Link href={`/devotionals/${post.slug}`} className="cursor-pointer">{post.title}</Link></h4>
                  </div>
                </article>
              ))}
            </div>
          </div> : null}

          <div>
            <h3 className="mb-3 border-b border-[var(--avad-border)] pb-2 font-serif text-[clamp(1.5rem,3vw,2rem)] font-bold text-[var(--avad-text-strong)]">
              Popular
            </h3>

            <article className="rounded-2xl border border-[var(--avad-border)] p-2">
              <Link href={`/devotionals/${popularPosts[0]?.slug ?? ""}`} className="relative block h-40 overflow-hidden rounded-xl">
                <Image src={safeThumbnailSrc(popularPosts[0]?.thumbnail, popularPosts[0]?.title ?? "Popular devotional")} alt={popularPosts[0]?.title ?? "Popular devotional"} fill sizes="(max-width: 1024px) 100vw, 320px" className="object-cover" />
              </Link>
              <h4 className="mt-3 font-serif text-xl font-bold leading-6"><Link href={`/devotionals/${popularPosts[0]?.slug ?? ""}`} className="cursor-pointer">{popularPosts[0]?.title}</Link></h4>
              <p className="mt-1 text-sm text-[#d99d58]">{formatDevotionalDate(popularPosts[0]?.devotionalDate)}</p>
            </article>

            <div className="mt-4 grid grid-cols-2 gap-3">
              {popularPosts.slice(1, 5).map((post) => (
                <article key={post.id} className="rounded-2xl border border-[var(--avad-border)] p-2 transition-all duration-200 hover:bg-[var(--avad-bg-elevated)] hover:shadow-lg">
                  <Link href={`/devotionals/${post.slug}`} className="relative block h-24 overflow-hidden rounded-lg">
                    <Image src={safeThumbnailSrc(post.thumbnail, post.title)} alt={post.title} fill sizes="(max-width: 1024px) 50vw, 160px" className="object-cover" />
                  </Link>
                  <h5 className="mt-2 font-serif text-base font-bold leading-5"><Link href={`/devotionals/${post.slug}`} className="cursor-pointer">{post.title}</Link></h5>
                  <p className="mt-1 text-xs text-[#d99d58]">{formatDevotionalDate(post.devotionalDate)}</p>
                </article>
              ))}
            </div>
          </div>
            </aside>
          </section>
        </>
      ) : (
        <section className="mx-auto mt-14 w-full max-w-[1320px] px-4 md:mt-16 md:px-6 lg:px-8 xl:mt-20 xl:px-10 2xl:mt-24">
          {!sessionResolved ? (
            <p className="py-10 text-sm text-[var(--avad-text-soft)]">Loading...</p>
          ) : !isAuthenticated ? (
            <div className="rounded-3xl border border-[var(--avad-border)] bg-[var(--avad-bg-elevated)] py-20 text-center">
              <p className="text-sm text-[var(--avad-text-soft)]">Sign in to view your devotional comments.</p>
              <Link href="/auth/sign-in?next=%2Fdevotionals" className="mt-5 inline-flex h-9 items-center rounded-full bg-gradient-to-b from-[#c99556] to-[#3a1a56] px-4 text-xs text-white">
                Sign In
              </Link>
            </div>
          ) : (
            <>
              <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-b border-[var(--avad-border)] pb-2">
                <div className="flex gap-4 text-sm">
                  <button
                    onClick={() => setCommentTab("UNPUBLISHED")}
                    className={cn("border-b pb-2", commentTab === "UNPUBLISHED" ? "border-[var(--avad-ring)]" : "border-transparent")}
                  >
                    Unpublished Comments ({commentStatusTotals.unpublished})
                  </button>
                  <button
                    onClick={() => setCommentTab("PUBLISHED")}
                    className={cn("border-b pb-2", commentTab === "PUBLISHED" ? "border-[var(--avad-ring)]" : "border-transparent")}
                  >
                    Published Comments ({commentStatusTotals.published})
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setCommentSelectMode((value) => !value);
                    setSelectedCommentIds([]);
                  }}
                  className={cn(
                    "h-9 rounded-full border px-3 text-sm",
                    commentSelectMode ? "border-[#c58d42] bg-[#d39a52] text-white" : "border-[var(--avad-border)] text-[var(--avad-text)]",
                  )}
                >
                  {commentSelectMode ? "Deselect" : "Select"}
                </button>
              </div>

              {commentSelectMode ? (
                <div className="mt-3 flex items-center justify-between rounded-2xl border border-[var(--avad-border)] bg-[var(--avad-bg-elevated)] px-3 py-2">
                  <label className="inline-flex items-center gap-2 text-sm text-[var(--avad-text)]">
                    <input
                      type="checkbox"
                      checked={comments.length > 0 && selectedCommentIds.length === comments.length}
                      onChange={(event) => {
                        if (event.target.checked) {
                          setSelectedCommentIds(comments.map((item) => item.id));
                        } else {
                          setSelectedCommentIds([]);
                        }
                      }}
                      className="size-4"
                    />
                    Select All
                  </label>
                </div>
              ) : null}

              <div className="mt-4 space-y-3">
                {commentLoading ? <p className="py-8 text-sm text-[var(--avad-text-soft)]">Loading comments...</p> : null}

                {!commentLoading && comments.length === 0 ? (
                  <div className="rounded-3xl border border-[var(--avad-border)] bg-[var(--avad-bg-elevated)] py-20 text-center">
                    <p className="text-sm text-[var(--avad-text-soft)]">There are no comments here yet.</p>
                  </div>
                ) : null}

                {comments.map((comment) => {
                  const isExpanded = expandedCommentIds[comment.id] ?? false;
                  const message = comment.message ?? "";
                  const shouldTruncate = message.length > 260;
                  const renderedMessage = shouldTruncate && !isExpanded ? `${message.slice(0, 260)}...` : message;

                  return (
                  <article
                    key={comment.id}
                    className={cn(
                      "rounded-2xl border border-[var(--avad-border)] bg-[var(--avad-bg-elevated)] px-4 py-4",
                      selectedCommentIds.includes(comment.id) ? "border-[#d39a52]" : "",
                    )}
                  >
                    <div className="flex items-start gap-3">
                      {commentSelectMode ? (
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedCommentIds((prev) =>
                              prev.includes(comment.id) ? prev.filter((id) => id !== comment.id) : [...prev, comment.id],
                            );
                          }}
                          className={cn(
                            "mt-1 grid size-6 place-items-center rounded-md border text-xs",
                            selectedCommentIds.includes(comment.id)
                              ? "border-[#d39a52] bg-[#d39a52] text-white"
                              : "border-[var(--avad-border)] text-transparent",
                          )}
                        >
                          <Check size={12} />
                        </button>
                      ) : null}

                      <div className="size-11 rounded-xl bg-[var(--avad-bg-soft)]" />
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-lg font-semibold text-[var(--avad-text-strong)]">You commented on &quot;{comment.devotional?.title ?? "this post"}&quot;</h3>
                          <span className="inline-flex items-center gap-1 text-xs text-[var(--avad-text-soft)]"><CalendarDays size={12} /> {formatDevotionalDate(comment.createdAt)}</span>
                        </div>
                        <p className="mt-2 text-sm text-[var(--avad-text)]">{renderedMessage}</p>
                        <div className="mt-3 flex items-center justify-between">
                          {shouldTruncate ? (
                            <button
                              type="button"
                              onClick={() => {
                                setExpandedCommentIds((prev) => ({
                                  ...prev,
                                  [comment.id]: !isExpanded,
                                }));
                              }}
                              className="text-xs font-semibold text-[var(--avad-text)] underline-offset-2 hover:underline"
                            >
                              {isExpanded ? "Show Less" : "Show More"}
                            </button>
                          ) : <span />}
                          <Link href={comment.devotional ? `/devotionals/${comment.devotional.slug}` : "/devotionals"} className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--avad-text)] underline-offset-2 hover:underline"><MessageCircle size={12} /> View Post</Link>
                        </div>
                      </div>
                    </div>
                  </article>
                  );
                })}
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-[var(--avad-border)] pt-3 text-sm text-[var(--avad-text-soft)]">
                <p>
                  Showing {comments.length} comment(s) of {commentPagination.total}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      const next = Math.max(1, commentPagination.page - 1);
                      void loadComments(next, commentTab, search);
                    }}
                    disabled={commentPagination.page <= 1}
                    className="disabled:opacity-40"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => {
                      const next = Math.min(commentPagination.totalPages, commentPagination.page + 1);
                      void loadComments(next, commentTab, search);
                    }}
                    disabled={commentPagination.page >= commentPagination.totalPages}
                    className="disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>
              </div>
            </>
          )}
        </section>
      )}

      <NewsletterSection className="mt-14 md:mt-16 xl:mt-20 2xl:mt-24" />
    </>
  );
}
