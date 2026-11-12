"use client";

import Image from "next/image";
import Link from "next/link";
import { Calendar, CalendarDays, Check, Clock3, Heart, MessageCircle, Share2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { NewsletterSection } from "@/components/sections/newsletter-section";
import { estimateReadTimeFromContent, formatBlogDate, safeThumbnailSrc, type BlogComment, type BlogSummary, type PaginatedResponse, stripHtml } from "@/lib/blog";
import { getJson } from "@/lib/http";
import { cn } from "@/lib/utils";

type ViewMode = "POSTS" | "COMMENTS";
type CommentTab = "UNPUBLISHED" | "PUBLISHED";

type AdminComment = Omit<BlogComment, "replies"> & {
  blog?: {
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

export function BlogPage() {
  const [viewMode, setViewMode] = useState<ViewMode>("POSTS");
  const [commentTab, setCommentTab] = useState<CommentTab>("UNPUBLISHED");
  const [search, setSearch] = useState("");
  const [posts, setPosts] = useState<BlogSummary[]>([]);
  const [recommendedPosts, setRecommendedPosts] = useState<BlogSummary[]>([]);
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

    async function loadPosts() {
      const [data, recommendedData] = await Promise.all([
        getJson<PaginatedResponse<BlogSummary>>("/api/blog?page=1&limit=100"),
        getJson<PaginatedResponse<BlogSummary>>("/api/blog?page=1&limit=3&recommended=true"),
      ]);
      if (!active) {
        return;
      }
      setPosts(data.items);
      setRecommendedPosts(recommendedData.items);
      setLoading(false);
    }

    void loadPosts();

    const timer = setInterval(() => {
      void loadPosts();
    }, 30_000);

    return () => {
      active = false;
      clearInterval(timer);
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

      const data = await getJson<AdminCommentsResponse>(`/api/dashboard/blogs/comments?${params.toString()}`);
      setComments(data.items);
      setCommentStatusTotals(data.statusTotals);
      setCommentPagination(data.pagination);
    } finally {
      setCommentLoading(false);
    }
  }

  const allTags = useMemo(
    () => ["All Tags", ...new Set(posts.flatMap((post) => post.tags))],
    [posts],
  );
  const [activeTag, setActiveTag] = useState("All Tags");

  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      const tagMatch = activeTag === "All Tags" || post.tags.includes(activeTag);
      const searchTerm = search.toLowerCase();
      const searchMatch =
        post.title.toLowerCase().includes(searchTerm) ||
        post.excerpt.toLowerCase().includes(searchTerm);
      return tagMatch && searchMatch;
    });
  }, [activeTag, posts, search]);

  const popularPosts = [...filteredPosts].sort((left, right) => right.views - left.views).slice(0, 3);

  return (
    <>
      <section className="mx-auto mt-12 w-full max-w-[1320px] px-4 md:mt-14 md:px-6 lg:px-8 xl:mt-16 xl:px-10 2xl:mt-20">
        <div className="mx-auto mb-3 flex w-fit items-center gap-2">
          <button
            type="button"
            onClick={() => setViewMode("POSTS")}
            className={cn(
              "rounded-full border px-3 py-1 text-[11px] font-semibold",
              viewMode === "POSTS" ? "border-[#c99556] bg-[#d39a52] text-white" : "border-[var(--avad-border)] bg-[var(--avad-bg-elevated)] text-[var(--avad-text)]",
            )}
          >
            Blog Post
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
        <h1 className="text-center font-serif text-[clamp(2.4rem,5vw,3.6rem)] font-bold text-[var(--avad-text-strong)]">Our Blog</h1>
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
                    active
                      ? "border-[#311048] bg-[#311048] text-white"
                      : "border-[var(--avad-border)] bg-[var(--avad-bg-elevated)] text-[var(--avad-text)]",
                  ].join(" ")}
                >
                  {tag}
                </button>
              );
            })}
          </div>

          <div className="space-y-5">
            {loading ? <p className="text-sm text-[var(--avad-text-soft)]">Loading blog posts...</p> : null}

            {filteredPosts.map((post) => (
              <article key={post.id} className="relative grid min-w-0 items-center gap-4 rounded-3xl border border-[var(--avad-border)] p-3 transition-all duration-200 hover:-translate-y-[2px] hover:bg-[var(--avad-bg-elevated)] hover:shadow-lg sm:gap-5 md:grid-cols-[minmax(0,1fr)_180px]">
                <div>
                  <span className="inline-flex rounded-full bg-[#311048] px-3 py-1 text-[11px] text-[var(--avad-gold)]">{post.tags[0] ?? "Faith"}</span>
                  <h2 className="mt-2 font-serif text-[18px] font-bold leading-[1.2] text-[var(--avad-text-strong)] md:text-[20px]">{post.title}</h2>
                  <p className="mt-2 text-[13px] leading-5 text-[var(--avad-text-soft)]">{post.excerpt || stripHtml(post.content).slice(0, 180)}...</p>
                  <p className="mt-2 text-xs text-[var(--avad-text-soft)]">By {post.authorName}</p>
                  <div className="mt-3 flex flex-wrap items-center gap-4 text-[12px] text-[var(--avad-text)]">
                    <span className="inline-flex items-center gap-1"><Clock3 size={13} /> {estimateReadTimeFromContent(post.content)} Min</span>
                    <span className="inline-flex items-center gap-1"><Calendar size={13} /> {formatBlogDate(post.publishedAt ?? post.createdAt)}</span>
                    <span className="inline-flex items-center gap-1"><Heart size={13} /> {post.likes} Likes</span>
                    <span className="inline-flex items-center gap-1"><Share2 size={13} /> {post.shares} Shares</span>
                  </div>
                </div>
                <div className="relative block h-[180px] overflow-hidden rounded-lg">
                  <Image src={safeThumbnailSrc(post.thumbnail, post.title)} alt={post.title} fill sizes="(max-width: 768px) 100vw, 180px" className="object-cover" />
                </div>
                <Link href={`/blog/${post.slug}`} aria-label={`Open blog post: ${post.title}`} className="absolute inset-0 z-10 rounded-3xl cursor-pointer" />
              </article>
            ))}
          </div>

          {filteredPosts.length === 0 && !loading ? <p className="text-sm text-[var(--avad-text-soft)]">No published posts match your search yet. Please check back soon.</p> : null}
        </div>

        <aside className="space-y-10">
          {recommendedPosts.length > 0 ? <div>
            <h3 className="mb-3 border-b border-[var(--avad-border)] pb-2 font-serif text-[clamp(1.5rem,3vw,2rem)] font-bold text-[var(--avad-text-strong)]">
              Recommended Posts
            </h3>
            <div className="space-y-4">
              {recommendedPosts.map((post) => (
                <article key={post.id} className="grid grid-cols-[96px_1fr] gap-3 rounded-2xl border border-[var(--avad-border)] p-2 transition-all duration-200 hover:bg-[var(--avad-bg-elevated)] hover:shadow-lg">
                  <Link href={`/blog/${post.slug}`} className="relative block h-20 overflow-hidden rounded-lg">
                    <Image src={safeThumbnailSrc(post.thumbnail, post.title)} alt={post.title} fill sizes="96px" className="object-cover" />
                  </Link>
                  <div>
                    <span className="inline-flex rounded-full bg-[#311048] px-2 py-0.5 text-[10px] text-[var(--avad-gold)]">{post.tags[0] ?? "Faith"}</span>
                    <p className="mt-1 inline-flex items-center gap-1 text-[11px] text-[var(--avad-text)]"><Clock3 size={11} /> {estimateReadTimeFromContent(post.content)} Min</p>
                    <h4 className="mt-1 font-serif text-base font-bold leading-5"><Link href={`/blog/${post.slug}`} className="cursor-pointer">{post.title}</Link></h4>
                    <p className="mt-1 text-[11px] text-[var(--avad-text-soft)]">By {post.authorName}</p>
                  </div>
                </article>
              ))}
            </div>
          </div> : null}

          <div>
            <h3 className="mb-3 border-b border-[var(--avad-border)] pb-2 font-serif text-[clamp(1.5rem,3vw,2rem)] font-bold text-[var(--avad-text-strong)]">
              Popular Posts
            </h3>

            <article className="rounded-2xl border border-[var(--avad-border)] p-2">
              <Link href={`/blog/${popularPosts[0]?.slug ?? ""}`} className="relative block h-40 overflow-hidden rounded-xl">
                <Image src={safeThumbnailSrc(popularPosts[0]?.thumbnail, popularPosts[0]?.title ?? "Popular post")} alt={popularPosts[0]?.title ?? "Popular post"} fill sizes="(max-width: 1024px) 100vw, 320px" className="object-cover" />
              </Link>
              <h4 className="mt-3 font-serif text-[19px] font-bold leading-6"><Link href={`/blog/${popularPosts[0]?.slug ?? ""}`} className="cursor-pointer">{popularPosts[0]?.title}</Link></h4>
              <p className="mt-1 text-xs text-[var(--avad-text-soft)]">By {popularPosts[0]?.authorName ?? "Unknown"}</p>
              <p className="mt-1 text-sm text-[#d99d58]">{formatBlogDate(popularPosts[0]?.publishedAt ?? popularPosts[0]?.createdAt)}</p>
            </article>

            <div className="mt-4 grid grid-cols-2 gap-3">
              {popularPosts.slice(1, 3).map((post) => (
                <article key={post.id} className="rounded-2xl border border-[var(--avad-border)] p-2 transition-all duration-200 hover:bg-[var(--avad-bg-elevated)] hover:shadow-lg">
                  <Link href={`/blog/${post.slug}`} className="relative block h-24 overflow-hidden rounded-lg">
                    <Image src={safeThumbnailSrc(post.thumbnail, post.title)} alt={post.title} fill sizes="(max-width: 1024px) 50vw, 160px" className="object-cover" />
                  </Link>
                  <h5 className="mt-2 font-serif text-sm font-bold leading-5"><Link href={`/blog/${post.slug}`} className="cursor-pointer">{post.title}</Link></h5>
                  <p className="mt-1 text-[11px] text-[var(--avad-text-soft)]">By {post.authorName}</p>
                  <p className="mt-1 text-xs text-[#d99d58]">{formatBlogDate(post.publishedAt ?? post.createdAt)}</p>
                </article>
              ))}
            </div>
          </div>
        </aside>
      </section>
      ) : (
        <section className="mx-auto mt-14 w-full max-w-[1320px] px-4 md:mt-16 md:px-6 lg:px-8 xl:mt-20 xl:px-10 2xl:mt-24">
          {!sessionResolved ? (
            <p className="py-10 text-sm text-[var(--avad-text-soft)]">Loading...</p>
          ) : !isAuthenticated ? (
            <div className="rounded-3xl border border-[var(--avad-border)] bg-[var(--avad-bg-elevated)] py-20 text-center">
              <p className="text-sm text-[var(--avad-text-soft)]">Sign in to view your blog comments.</p>
              <Link href="/auth/sign-in?next=%2Fblog" className="mt-5 inline-flex h-9 items-center rounded-full bg-gradient-to-b from-[#c99556] to-[#3a1a56] px-4 text-xs text-white">
                Sign In
              </Link>
            </div>
          ) : (
            <>
              <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-b border-[var(--avad-border)] pb-2">
                <div className="flex gap-4 text-sm">
                  <button onClick={() => setCommentTab("UNPUBLISHED")} className={cn("border-b pb-2", commentTab === "UNPUBLISHED" ? "border-[var(--avad-ring)]" : "border-transparent")}>
                    Unpublished Comments ({commentStatusTotals.unpublished})
                  </button>
                  <button onClick={() => setCommentTab("PUBLISHED")} className={cn("border-b pb-2", commentTab === "PUBLISHED" ? "border-[var(--avad-ring)]" : "border-transparent")}>
                    Published Comments ({commentStatusTotals.published})
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setCommentSelectMode((value) => !value);
                    setSelectedCommentIds([]);
                  }}
                  className={cn("h-9 rounded-full border px-3 text-sm", commentSelectMode ? "border-[#c58d42] bg-[#d39a52] text-white" : "border-[var(--avad-border)] text-[var(--avad-text)]")}
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
                    <article key={comment.id} className={cn("rounded-2xl border border-[var(--avad-border)] bg-[var(--avad-bg-elevated)] px-4 py-4", selectedCommentIds.includes(comment.id) ? "border-[#d39a52]" : "")}>
                      <div className="flex items-start gap-3">
                        {commentSelectMode ? (
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedCommentIds((prev) => (prev.includes(comment.id) ? prev.filter((id) => id !== comment.id) : [...prev, comment.id]));
                            }}
                            className={cn(
                              "mt-1 grid size-6 place-items-center rounded-md border text-xs",
                              selectedCommentIds.includes(comment.id) ? "border-[#d39a52] bg-[#d39a52] text-white" : "border-[var(--avad-border)] text-transparent",
                            )}
                          >
                            <Check size={12} />
                          </button>
                        ) : null}

                        <div className="size-11 rounded-xl bg-[var(--avad-bg-soft)]" />
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-lg font-semibold text-[var(--avad-text-strong)]">You commented on &quot;{comment.blog?.title ?? "this post"}&quot;</h3>
                            <span className="inline-flex items-center gap-1 text-xs text-[var(--avad-text-soft)]"><CalendarDays size={12} /> {formatBlogDate(comment.createdAt)}</span>
                          </div>
                          <p className="mt-2 text-sm text-[var(--avad-text)]">{renderedMessage}</p>
                          <div className="mt-3 flex items-center justify-between">
                            {shouldTruncate ? (
                              <button
                                type="button"
                                onClick={() => {
                                  setExpandedCommentIds((prev) => ({ ...prev, [comment.id]: !isExpanded }));
                                }}
                                className="text-xs font-semibold text-[var(--avad-text)] underline-offset-2 hover:underline"
                              >
                                {isExpanded ? "Show Less" : "Show More"}
                              </button>
                            ) : <span />}
                            <Link href={comment.blog ? `/blog/${comment.blog.slug}` : "/blog"} className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--avad-text)] underline-offset-2 hover:underline"><MessageCircle size={12} /> View Post</Link>
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
