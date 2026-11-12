"use client";

import Image from "next/image";
import Link from "next/link";
import { Calendar, Check, Clock3, Eye, MessageCircle, Plus, Share2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { NewsletterSection } from "@/components/sections/newsletter-section";
import { ActionMenu } from "@/components/ui/action-menu";
import { useConfirmationDialog } from "@/components/ui/confirmation-dialog-provider";
import {
  formatCommunityDate,
  estimateReadTimeFromContent,
  safeThumbnailSrc,
  stripHtml,
  type CommunityComment,
  type CommunityStatus,
  type CommunitySummary,
  type PaginatedResponse,
} from "@/lib/community";
import { getJson, patchJson } from "@/lib/http";
import { cn } from "@/lib/utils";

type SessionUser = {
  id: string;
  fullName: string;
  email: string;
  role: "ADMIN" | "MODERATOR" | "BLOGGER" | "MEMBER";
};

type ThreadTab = "ALL" | "DRAFT" | "SCHEDULED" | "UNAPPROVED" | "PUBLISHED";
type ThreadScope = "ALL_THREADS" | "MY_THREADS";
type ViewMode = "THREADS" | "COMMENTS";
type CommentTab = "UNPUBLISHED" | "PUBLISHED";

type AdminComment = Omit<CommunityComment, "replies"> & {
  community?: {
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

const statusByTab: Record<ThreadTab, CommunityStatus | undefined> = {
  ALL: undefined,
  DRAFT: "DRAFT",
  SCHEDULED: "SCHEDULED",
  UNAPPROVED: "UNAPPROVED",
  PUBLISHED: "PUBLISHED",
};

export function CommunityPage() {
  const confirmation = useConfirmationDialog();
  const [sessionUser, setSessionUser] = useState<SessionUser | null>(null);
  const [sessionResolved, setSessionResolved] = useState(false);

  const [viewMode, setViewMode] = useState<ViewMode>("THREADS");
  const [threadScope, setThreadScope] = useState<ThreadScope>("ALL_THREADS");
  const [threadTab, setThreadTab] = useState<ThreadTab>("ALL");
  const [commentTab, setCommentTab] = useState<CommentTab>("UNPUBLISHED");

  const [search, setSearch] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [activeTag, setActiveTag] = useState("All Tags");

  const [threads, setThreads] = useState<CommunitySummary[]>([]);
  const [threadLoading, setThreadLoading] = useState(true);
  const [threadPagination, setThreadPagination] = useState<PaginatedResponse<CommunitySummary>["pagination"]>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });
  const [threadPage, setThreadPage] = useState(1);

  const [comments, setComments] = useState<AdminComment[]>([]);
  const [commentLoading, setCommentLoading] = useState(false);
  const [commentPagination, setCommentPagination] = useState<PaginatedResponse<AdminComment>["pagination"]>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });
  const [commentStatusTotals, setCommentStatusTotals] = useState({ unpublished: 0, published: 0 });
  const [commentPage, setCommentPage] = useState(1);

  const [threadMenuOpenFor, setThreadMenuOpenFor] = useState<string | null>(null);
  const [commentMenuOpenFor, setCommentMenuOpenFor] = useState<string | null>(null);

  const [threadSelectMode, setThreadSelectMode] = useState(false);
  const [selectedThreadIds, setSelectedThreadIds] = useState<string[]>([]);
  const [commentSelectMode, setCommentSelectMode] = useState(false);
  const [selectedCommentIds, setSelectedCommentIds] = useState<string[]>([]);

  const isAuthenticated = Boolean(sessionUser);
  const isMember = sessionUser?.role === "MEMBER";
  const canDirectPublish = sessionUser?.role === "ADMIN" || sessionUser?.role === "MODERATOR";
  const canManageThreads = isAuthenticated && (!isMember || threadScope === "MY_THREADS");

  const [statusTotals, setStatusTotals] = useState({
    all: 0,
    draft: 0,
    scheduled: 0,
    unapproved: 0,
    published: 0,
  });

  const allTags = useMemo(() => {
    return ["All Tags", ...new Set(threads.flatMap((post) => post.tags))];
  }, [threads]);

  const filteredThreads = useMemo(() => {
    return threads.filter((post) => activeTag === "All Tags" || post.tags.includes(activeTag));
  }, [activeTag, threads]);

  useEffect(() => {
    let active = true;

    async function loadSession() {
      try {
        const response = await fetch("/api/auth/session", { cache: "no-store" });
        if (!active) {
          return;
        }

        if (!response.ok) {
          setSessionUser(null);
          return;
        }

        const payload = (await response.json()) as SessionUser;
        setSessionUser(payload);
      } catch {
        if (active) {
          setSessionUser(null);
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

  // `loadThreads` is declared below this effect and is memoized by its state inputs.
  /* eslint-disable react-hooks/exhaustive-deps */
  useEffect(() => {
    if (!sessionResolved) {
      return;
    }

    void loadThreads(1, threadTab, appliedSearch);
  }, [sessionResolved, isAuthenticated, threadTab, appliedSearch, threadScope, isMember]);
  /* eslint-enable react-hooks/exhaustive-deps */

  useEffect(() => {
    if (!isMember) {
      return;
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setThreadScope("ALL_THREADS");
    setThreadTab("ALL");
    setThreadSelectMode(false);
    setSelectedThreadIds([]);
    setThreadMenuOpenFor(null);
  }, [isMember]);

  useEffect(() => {
    if (!sessionResolved || !isAuthenticated || viewMode !== "COMMENTS") {
      return;
    }

    void loadComments(1, commentTab, appliedSearch);
  }, [sessionResolved, isAuthenticated, viewMode, commentTab, appliedSearch]);

  const loadThreads = useCallback(async (page: number, tab: ThreadTab, searchTerm: string) => {
    setThreadLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: "10" });
      if (searchTerm.trim()) {
        params.set("search", searchTerm.trim());
      }

      const useManagedEndpoint = isAuthenticated && (!isMember || threadScope === "MY_THREADS");

      if (useManagedEndpoint) {
        const status = statusByTab[tab];
        if (status) {
          params.set("status", status);
        }
      }

      const endpoint = useManagedEndpoint
        ? `/api/dashboard/community?${params.toString()}`
        : `/api/community?${params.toString()}`;
      const response = await getJson<PaginatedResponse<CommunitySummary>>(endpoint);
      setThreads(response.items);
      setThreadPagination(response.pagination);
      setThreadPage(page);

      if (useManagedEndpoint) {
        const totalForStatus = async (status?: CommunityStatus) => {
          const countParams = new URLSearchParams({ page: "1", limit: "1" });
          if (searchTerm.trim()) {
            countParams.set("search", searchTerm.trim());
          }
          if (status) {
            countParams.set("status", status);
          }
          const result = await getJson<PaginatedResponse<CommunitySummary>>(`/api/dashboard/community?${countParams.toString()}`);
          return result.pagination.total;
        };

        const [all, draft, scheduled, unapproved, published] = await Promise.all([
          totalForStatus(),
          totalForStatus("DRAFT"),
          totalForStatus("SCHEDULED"),
          totalForStatus("UNAPPROVED"),
          totalForStatus("PUBLISHED"),
        ]);
        setStatusTotals({ all, draft, scheduled, unapproved, published });
      } else {
        setStatusTotals({ all: response.pagination.total, draft: 0, scheduled: 0, unapproved: 0, published: response.pagination.total });
      }
      if (activeTag !== "All Tags") {
        const allValues = new Set(["All Tags", ...response.items.flatMap((post) => post.tags)]);
        if (!allValues.has(activeTag)) {
          setActiveTag("All Tags");
        }
      }
    } finally {
      setThreadLoading(false);
    }
  }, [activeTag, isAuthenticated, isMember, threadScope]);

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

      const response = await getJson<AdminCommentsResponse>(`/api/dashboard/community/comments?${params.toString()}`);
      setComments(response.items);
      setCommentPagination(response.pagination);
      setCommentStatusTotals(response.statusTotals);
      setCommentPage(page);
    } catch (error) {
      setComments([]);
      setCommentPagination({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 1,
      });
      setCommentStatusTotals({ unpublished: 0, published: 0 });
      const message = error instanceof Error ? error.message : "Unable to load comments.";
      toast.error(message);
    } finally {
      setCommentLoading(false);
    }
  }

  async function manageThreadStatus(
    threadId: string,
    action: "PUBLISH" | "REVERT_TO_DRAFT" | "UNPUBLISH",
    reason?: string,
  ) {
    try {
      await patchJson(`/api/dashboard/community/${threadId}/status`, { action, reason });
      toast.success(action === "PUBLISH" ? "Thread submitted successfully." : "Thread updated successfully.");
      await loadThreads(threadPage, threadTab, appliedSearch);
      setThreadMenuOpenFor(null);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to update thread.";
      toast.error(message);
    }
  }

  async function deleteThread(threadId: string) {
    const confirmed = await confirmation.confirm({
      title: "Delete thread?",
      description: "This action permanently deletes this thread and cannot be undone.",
      confirmLabel: "Delete",
      cancelLabel: "Cancel",
      destructive: true,
    });

    if (!confirmed) {
      return;
    }

    try {
      await fetch(`/api/dashboard/community/${threadId}`, { method: "DELETE" });
      toast.success("Thread deleted.");
      await loadThreads(threadPage, threadTab, appliedSearch);
      setThreadMenuOpenFor(null);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to delete thread.";
      toast.error(message);
    }
  }

  async function bulkDeleteThreads() {
    if (!selectedThreadIds.length) {
      return;
    }

    const confirmed = await confirmation.confirm({
      title: "Delete selected threads?",
      description: `Delete ${selectedThreadIds.length} selected thread(s) permanently?`,
      confirmLabel: "Delete",
      cancelLabel: "Cancel",
      destructive: true,
    });

    if (!confirmed) {
      return;
    }

    try {
      await Promise.all(selectedThreadIds.map((id) => fetch(`/api/dashboard/community/${id}`, { method: "DELETE" })));
      setSelectedThreadIds([]);
      setThreadSelectMode(false);
      toast.success("Selected threads deleted.");
      await loadThreads(threadPage, threadTab, appliedSearch);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to delete selected threads.";
      toast.error(message);
    }
  }

  async function moderateComment(commentId: string, action: "PUBLISH" | "UNPUBLISH" | "DELETE", reason?: string) {
    try {
      await patchJson(`/api/dashboard/community/comments/${commentId}`, { action, reason });
      toast.success(action === "DELETE" ? "Comment deleted." : "Comment updated.");
      await loadComments(commentPage, commentTab, appliedSearch);
      setCommentMenuOpenFor(null);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to update comment.";
      toast.error(message);
    }
  }

  async function bulkDeleteComments() {
    if (!selectedCommentIds.length) {
      return;
    }

    const confirmed = await confirmation.confirm({
      title: "Delete selected comments?",
      description: `Delete ${selectedCommentIds.length} selected comment(s) permanently?`,
      confirmLabel: "Delete",
      cancelLabel: "Cancel",
      destructive: true,
    });

    if (!confirmed) {
      return;
    }

    try {
      await patchJson("/api/dashboard/community/comments/bulk-delete", { ids: selectedCommentIds });
      setSelectedCommentIds([]);
      setCommentSelectMode(false);
      toast.success("Selected comments deleted.");
      await loadComments(commentPage, commentTab, appliedSearch);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to delete selected comments.";
      toast.error(message);
    }
  }

  const guestJoinLink = `/auth/sign-up?next=${encodeURIComponent("/community")}`;

  async function requestDisapprovalReason(kind: "thread" | "comment") {
    const answer = await confirmation.prompt({
      title: "Disapproval reason required",
      description: `Please provide a reason for disapproving this ${kind}.`,
      confirmLabel: "Submit",
      cancelLabel: "Cancel",
      placeholder: "Enter moderation reason",
      required: true,
    });

    if (!answer) {
      return null;
    }

    return answer;
  }

  return (
    <>
      <section className="mx-auto mt-12 w-full max-w-[1320px] px-4 md:mt-14 md:px-6 lg:px-8 xl:mt-16 xl:px-10 2xl:mt-20">
        <div className="flex justify-center gap-2">
          <button
            type="button"
            onClick={() => setViewMode("THREADS")}
            className={cn(
              "rounded-full border px-3 py-1 text-[11px] font-semibold",
              viewMode === "THREADS" ? "border-[#c99556] bg-[#d39a52] text-white" : "border-[var(--avad-border)] bg-[var(--avad-bg-elevated)] text-[var(--avad-text)]",
            )}
          >
            Threads
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

        <h1 className="mt-3 text-center font-serif text-[clamp(2.4rem,5vw,3.6rem)] font-bold text-[var(--avad-text-strong)]">Our Community</h1>

        <div className="mx-auto mt-4 flex max-w-[560px] rounded-xl bg-[var(--avad-bg-elevated)] p-1.5 shadow-sm">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                setAppliedSearch(search);
              }
            }}
            placeholder="Search by title, content, author, or tags"
            className="h-10 flex-1 rounded-lg bg-transparent px-3 text-sm text-[var(--avad-text)] outline-none"
          />
          <button
            type="button"
            onClick={() => setAppliedSearch(search)}
            className="h-10 cursor-pointer rounded-lg bg-[#725980] px-7 text-xs font-semibold text-white"
          >
            Search
          </button>
        </div>
      </section>

      <section className="mx-auto mt-14 w-full max-w-[1320px] px-4 md:mt-16 md:px-6 lg:px-8 xl:mt-20 xl:px-10 2xl:mt-24">
        {viewMode === "THREADS" ? (
          <>
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--avad-border)] pb-2">
              <div className="flex flex-wrap gap-5 text-sm text-[var(--avad-text)]">
                <button
                  className={cn("border-b pb-2", threadTab === "ALL" ? "border-[var(--avad-ring)]" : "border-transparent")}
                  onClick={() => setThreadTab("ALL")}
                >
                  All ({statusTotals.all})
                </button>

                {canManageThreads ? (
                  <>
                    <button className={cn("border-b pb-2", threadTab === "DRAFT" ? "border-[var(--avad-ring)]" : "border-transparent")} onClick={() => setThreadTab("DRAFT")}>Drafts ({statusTotals.draft})</button>
                    <button className={cn("border-b pb-2", threadTab === "SCHEDULED" ? "border-[var(--avad-ring)]" : "border-transparent")} onClick={() => setThreadTab("SCHEDULED")}>Scheduled ({statusTotals.scheduled})</button>
                    <button className={cn("border-b pb-2", threadTab === "UNAPPROVED" ? "border-[var(--avad-ring)]" : "border-transparent")} onClick={() => setThreadTab("UNAPPROVED")}>Unapproved ({statusTotals.unapproved})</button>
                    <button className={cn("border-b pb-2", threadTab === "PUBLISHED" ? "border-[var(--avad-ring)]" : "border-transparent")} onClick={() => setThreadTab("PUBLISHED")}>Published ({statusTotals.published})</button>
                  </>
                ) : null}
              </div>

              <div className="flex items-center gap-2">
                {isMember ? (
                  <button
                    type="button"
                    onClick={() => {
                      setThreadScope((value) => (value === "ALL_THREADS" ? "MY_THREADS" : "ALL_THREADS"));
                      setThreadTab("ALL");
                      setThreadSelectMode(false);
                      setSelectedThreadIds([]);
                      setThreadMenuOpenFor(null);
                    }}
                    className={cn(
                      "h-9 rounded-full border px-3 text-sm",
                      threadScope === "MY_THREADS"
                        ? "border-[#c58d42] bg-[#d39a52] text-white"
                        : "border-[var(--avad-border)] text-[var(--avad-text)]",
                    )}
                  >
                    {threadScope === "MY_THREADS" ? "View All Threads" : "My Threads"}
                  </button>
                ) : null}

                {canManageThreads ? (
                  <button
                    type="button"
                    onClick={() => {
                      setThreadSelectMode((value) => !value);
                      setSelectedThreadIds([]);
                    }}
                    className={cn(
                      "h-9 rounded-full border px-3 text-sm",
                      threadSelectMode ? "border-[#c58d42] bg-[#d39a52] text-white" : "border-[var(--avad-border)] text-[var(--avad-text)]",
                    )}
                  >
                    {threadSelectMode ? "Deselect" : "Select"}
                  </button>
                ) : null}

                {isAuthenticated ? (
                  <Link href="/community/new-thread" className="inline-flex h-9 items-center gap-1 rounded-full bg-gradient-to-b from-[#c99556] to-[#3a1a56] px-3 text-sm text-white">
                    <Plus size={14} />
                    New Thread
                  </Link>
                ) : null}
              </div>
            </div>

            <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                {allTags.map((tag) => {
                  const active = tag === activeTag;
                  return (
                    <button
                      key={tag}
                      onClick={() => setActiveTag(tag)}
                      className={cn(
                        "rounded-full border px-3 py-1 text-[11px]",
                        active
                          ? "border-[#311048] bg-[#311048] text-white"
                          : "border-[var(--avad-border)] bg-[var(--avad-bg-elevated)] text-[var(--avad-text)]",
                      )}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
              <button className="inline-flex h-8 items-center gap-2 rounded-full border border-[var(--avad-border)] px-3 text-xs text-[var(--avad-text)]">
                <Share2 size={12} /> Sort & View
              </button>
            </div>

            {threadSelectMode && canManageThreads ? (
              <div className="mt-3 flex items-center justify-between rounded-2xl border border-[var(--avad-border)] bg-[var(--avad-bg-elevated)] px-3 py-2">
                <label className="inline-flex items-center gap-2 text-sm text-[var(--avad-text)]">
                  <input
                    type="checkbox"
                    checked={filteredThreads.length > 0 && selectedThreadIds.length === filteredThreads.length}
                    onChange={(event) => {
                      if (event.target.checked) {
                        setSelectedThreadIds(filteredThreads.map((item) => item.id));
                      } else {
                        setSelectedThreadIds([]);
                      }
                    }}
                    className="size-4"
                  />
                  Select All
                </label>

                {selectedThreadIds.length > 0 ? (
                  <button onClick={() => void bulkDeleteThreads()} className="rounded-full bg-[#ff3f00] px-3 py-1 text-xs text-white">
                    Delete All ({selectedThreadIds.length})
                  </button>
                ) : null}
              </div>
            ) : null}

            <div className="mt-4 space-y-4">
              {threadLoading ? <p className="py-8 text-sm text-[var(--avad-text-soft)]">Loading threads...</p> : null}

              {!threadLoading && filteredThreads.length === 0 ? (
                <div className="rounded-3xl border border-[var(--avad-border)] bg-[var(--avad-bg-elevated)] p-8 text-center">
                  <p className="text-sm text-[var(--avad-text-soft)]">
                    {isMember && threadScope === "MY_THREADS"
                      ? "You have not created any threads yet."
                      : "No published threads matched your filters. New discussions will appear here when they are published."}
                  </p>
                  {isAuthenticated ? (
                    <Link href="/community/new-thread" className="mt-3 inline-flex h-8 items-center rounded-full bg-gradient-to-b from-[#c99556] to-[#3a1a56] px-4 text-xs text-white">
                      Start A New Thread
                    </Link>
                  ) : null}
                </div>
              ) : null}

              {filteredThreads.map((post) => {
                const statusLabel =
                  post.status === "UNAPPROVED"
                    ? "Unapproved"
                    : post.status === "SCHEDULED"
                      ? "Scheduled"
                      : post.status === "PUBLISHED"
                        ? "Published"
                        : "Draft";

                const isSelected = selectedThreadIds.includes(post.id);
                const threadHref = post.status === "PUBLISHED"
                  ? `/community/thread/${post.slug}`
                  : `/community/manage/${post.id}/preview`;

                return (
                  <article
                    key={post.id}
                    className={cn(
                      "relative rounded-3xl border border-[var(--avad-border)] bg-transparent p-2 shadow-none transition-all duration-200",
                      "hover:-translate-y-[2px] hover:border-[var(--avad-border)] hover:bg-[var(--avad-bg-elevated)] hover:p-3 hover:shadow-sm",
                      !threadSelectMode && "cursor-pointer",
                      threadMenuOpenFor === post.id && "z-30",
                      isSelected && "border-[#d39a52] bg-[var(--avad-bg-elevated)] p-3 ring-1 ring-[#d39a52] shadow-sm",
                    )}
                  >
                      <div className="flex min-w-0 items-start gap-2 sm:gap-3 md:items-center">
                      {threadSelectMode && canManageThreads ? (
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedThreadIds((prev) =>
                              prev.includes(post.id) ? prev.filter((id) => id !== post.id) : [...prev, post.id],
                            );
                          }}
                          className={cn(
                            "relative z-20 grid size-6 place-items-center rounded-md border text-xs",
                            isSelected ? "border-[#d39a52] bg-[#d39a52] text-white" : "border-[var(--avad-border)] text-transparent",
                          )}
                        >
                          <Check size={12} />
                        </button>
                      ) : null}

                      <Link href={threadHref} className="relative block h-[96px] w-[96px] shrink-0 overflow-hidden rounded-xl sm:h-[110px] sm:w-[110px] md:h-[110px] md:w-[170px]">
                        <Image src={safeThumbnailSrc(post.thumbnail, post.title)} alt={post.title} fill sizes="(max-width: 640px) 96px, (max-width: 768px) 110px, 170px" className="object-cover" />
                      </Link>

                      <div className="min-w-0 flex-1">
                        <div className="mb-2 flex flex-wrap items-center gap-2">
                          <span className="inline-flex rounded-full bg-[#311048] px-3 py-1 text-[11px] text-[var(--avad-gold)]">{statusLabel}</span>
                          {post.tags.slice(0, 4).map((tag) => (
                            <span key={`${post.id}-${tag}`} className="rounded-full border border-[var(--avad-border)] px-2 py-1 text-[10px] text-[var(--avad-text)]">#{tag}</span>
                          ))}
                        </div>
                        <h2 className="font-serif text-[21px] font-bold leading-[1.08] text-[var(--avad-text-strong)] md:text-[24px]">
                          <Link href={threadHref}>{post.title}</Link>
                        </h2>
                        <p className="mt-2 text-[13px] leading-5 text-[var(--avad-text-soft)]">
                          {post.excerpt || stripHtml(post.content).slice(0, 180)}...
                        </p>
                        <p className="mt-2 text-xs text-[var(--avad-text-soft)]">By {post.authorName || "Unknown"}</p>
                        {post.status === "DRAFT" && post.moderationReason ? (
                          <p className="mt-2 rounded-lg border border-[#f0d7d2] bg-[#fff2ef] px-3 py-2 text-xs text-[#8e2f19]">
                            Moderator feedback — revise and resubmit: {post.moderationReason}
                          </p>
                        ) : null}
                        <div className="mt-3 flex flex-wrap items-center gap-4 text-[12px] text-[var(--avad-text)]">
                          <span className="inline-flex items-center gap-1"><Clock3 size={13} /> {estimateReadTimeFromContent(post.content)} Min</span>
                          <span className="inline-flex items-center gap-1"><Calendar size={13} /> {formatCommunityDate(post.publishedAt ?? post.createdAt)}</span>
                          <span className="inline-flex items-center gap-1"><Eye size={13} /> {post.views}</span>
                          <span className="inline-flex items-center gap-1"><MessageCircle size={13} /> {post.commentsCount}</span>
                        </div>
                      </div>

                      {canManageThreads && !threadSelectMode ? (
                        <div className="relative z-20 shrink-0">
                          <ActionMenu
                            open={threadMenuOpenFor === post.id}
                            onToggle={() => setThreadMenuOpenFor((value) => (value === post.id ? null : post.id))}
                            menuClassName="w-[190px] rounded-xl p-1.5"
                          >
                              {post.status === "DRAFT" || (canDirectPublish && post.status === "SCHEDULED") ? (
                                <button className="block w-full rounded-md px-2 py-1.5 text-left text-xs hover:bg-[var(--avad-bg-soft)]" onClick={() => void manageThreadStatus(post.id, "PUBLISH")}>
                                  {post.status === "DRAFT" && post.moderationReason ? "Resubmit for Approval" : canDirectPublish ? "Publish Thread" : "Submit for Approval"}
                                </button>
                              ) : null}
                              <Link href={`/community/manage/${post.id}/edit`} className="block rounded-md px-2 py-1.5 text-xs hover:bg-[var(--avad-bg-soft)]">Edit Thread</Link>
                              <Link href={`/community/manage/${post.id}/preview`} className="block rounded-md px-2 py-1.5 text-xs hover:bg-[var(--avad-bg-soft)]">Preview</Link>
                              <Link href={`/community/thread/${post.slug}`} className="block rounded-md px-2 py-1.5 text-xs hover:bg-[var(--avad-bg-soft)]">View</Link>
                              {post.status === "PUBLISHED" || canDirectPublish ? (
                                <button
                                  className="block w-full rounded-md px-2 py-1.5 text-left text-xs hover:bg-[var(--avad-bg-soft)]"
                                  onClick={() => {
                                    void (async () => {
                                      if (post.status === "UNAPPROVED") {
                                        const reason = await requestDisapprovalReason("thread");
                                        if (!reason) {
                                          return;
                                        }
                                        await manageThreadStatus(post.id, "REVERT_TO_DRAFT", reason);
                                        return;
                                      }

                                      await manageThreadStatus(post.id, "REVERT_TO_DRAFT");
                                    })();
                                  }}
                                >
                                  Revert to Draft
                                </button>
                              ) : null}
                              {canDirectPublish && post.status === "PUBLISHED" ? (
                                <button className="block w-full rounded-md px-2 py-1.5 text-left text-xs hover:bg-[var(--avad-bg-soft)]" onClick={() => void manageThreadStatus(post.id, "UNPUBLISH")}>Unpublish Thread</button>
                              ) : null}
                              <button className="block w-full rounded-md px-2 py-1.5 text-left text-xs text-[#db2222] hover:bg-[var(--avad-bg-soft)]" onClick={() => void deleteThread(post.id)}>
                                {post.status === "DRAFT" ? "Discard Draft" : "Delete Thread"}
                              </button>
                          </ActionMenu>
                        </div>
                      ) : null}
                    </div>

                    {!threadSelectMode ? (
                      <Link href={threadHref} aria-label={`Open thread: ${post.title}`} className="absolute inset-0 z-10 rounded-3xl cursor-pointer" />
                    ) : null}
                  </article>
                );
              })}
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-[var(--avad-border)] pt-3 text-sm text-[var(--avad-text-soft)]">
              <p>
                Showing {filteredThreads.length} thread(s) of {threadPagination.total}
              </p>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const next = Math.max(1, threadPage - 1);
                    void loadThreads(next, threadTab, appliedSearch);
                  }}
                  disabled={threadPage <= 1}
                  className="disabled:opacity-40"
                >
                  Back
                </button>
                <button
                  onClick={() => {
                    const next = Math.min(threadPagination.totalPages, threadPage + 1);
                    void loadThreads(next, threadTab, appliedSearch);
                  }}
                  disabled={threadPage >= threadPagination.totalPages}
                  className="disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>

            {!isAuthenticated ? (
              <section className="mt-8">
                <div className="grid overflow-hidden rounded-[26px] bg-[var(--avad-purple)] md:grid-cols-2">
                  <div className="p-7 md:p-9">
                    <h2 className="max-w-[430px] font-serif text-[clamp(1.6rem,2.7vw,2.5rem)] font-bold leading-[1.08] text-[var(--avad-gold)]">
                      Join Our Community to Be Able to Interact on Threads and Posts
                    </h2>
                    <p className="mt-3 max-w-[430px] text-base leading-6 text-[#f0e8f6] md:text-lg md:leading-7">
                      Become part of a Christ-centered community focused on righteousness, devotion, and kingdom impact.
                    </p>
                    <Link href={guestJoinLink} className="mt-6 inline-flex h-10 items-center rounded-xl bg-[var(--avad-gold)] px-5 text-sm font-semibold text-[#2d0f43]">
                      Become a Member
                    </Link>
                  </div>
                  <div className="relative min-h-[220px]">
                    <Image src="/placeholders/community.png" alt="Community and fellowship visual" fill sizes="(max-width: 768px) 100vw, 50vw" loading="eager" className="object-cover" />
                  </div>
                </div>
              </section>
            ) : null}
          </>
        ) : (
          <>
            {!isAuthenticated ? (
              <div className="mt-6 rounded-3xl border border-[var(--avad-border)] bg-[var(--avad-bg-elevated)] py-24 text-center">
                <p className="text-2xl font-semibold text-[var(--avad-text-strong)]">There are no comments here yet.</p>
                <p className="mt-2 text-sm text-[var(--avad-text-soft)]">When your audience makes a comment, you will see them here.</p>
                <Link href={guestJoinLink} className="mt-5 inline-flex h-9 items-center rounded-full bg-gradient-to-b from-[#c99556] to-[#3a1a56] px-4 text-xs text-white">
                  Sign Up
                </Link>
              </div>
            ) : (
              <>
                <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-b border-[var(--avad-border)] pb-2">
                  <div className="flex gap-4 text-sm">
                    <button className={cn("border-b pb-2", commentTab === "UNPUBLISHED" ? "border-[var(--avad-ring)]" : "border-transparent")} onClick={() => setCommentTab("UNPUBLISHED")}>Unpublished Comments ({commentStatusTotals.unpublished})</button>
                    <button className={cn("border-b pb-2", commentTab === "PUBLISHED" ? "border-[var(--avad-ring)]" : "border-transparent")} onClick={() => setCommentTab("PUBLISHED")}>Published Comments ({commentStatusTotals.published})</button>
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

                    {selectedCommentIds.length > 0 ? (
                      <button onClick={() => void bulkDeleteComments()} className="rounded-full bg-[#ff3f00] px-3 py-1 text-xs text-white">
                        Delete All ({selectedCommentIds.length})
                      </button>
                    ) : null}
                  </div>
                ) : null}

                <div className="mt-4 space-y-3">
                  {commentLoading ? <p className="py-8 text-sm text-[var(--avad-text-soft)]">Loading comments...</p> : null}

                  {!commentLoading && comments.length === 0 ? (
                    <div className="rounded-3xl border border-[var(--avad-border)] bg-[var(--avad-bg-elevated)] py-20 text-center">
                      <p className="text-sm text-[var(--avad-text-soft)]">There are no comments here yet.</p>
                    </div>
                  ) : null}

                  {comments.map((comment) => (
                    <article
                      key={comment.id}
                      className={cn(
                        "relative rounded-2xl border border-[var(--avad-border)] bg-[var(--avad-bg-elevated)] px-4 py-4",
                        commentMenuOpenFor === comment.id && "z-30",
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
                            <h3 className="text-lg font-semibold text-[var(--avad-text-strong)]">{comment.authorName}</h3>
                            <span className={cn("rounded-full px-2 py-1 text-[10px]", comment.status === "PUBLISHED" ? "bg-[#cdeecf] text-[#1e7d2f]" : "bg-[#ffe2dc] text-[#b3421d]")}>{comment.status === "PUBLISHED" ? "Accepted Response" : "Unaccepted Response"}</span>
                            <span className="text-xs text-[var(--avad-text-soft)]">{formatCommunityDate(comment.createdAt)}</span>
                          </div>
                          <p className="mt-2 text-sm text-[var(--avad-text)]">{comment.message}</p>
                          {comment.status === "UNPUBLISHED" && comment.moderationReason ? (
                            <p className="mt-2 rounded-lg border border-[#f0d7d2] bg-[#fff2ef] px-3 py-2 text-xs text-[#8e2f19]">
                              Moderator feedback: {comment.moderationReason}
                            </p>
                          ) : null}
                          <div className="mt-3 flex items-center justify-between">
                            <Link href={comment.community ? `/community/thread/${comment.community.slug}` : "/community"} className="text-xs font-semibold text-[var(--avad-text)] underline-offset-2 hover:underline">Show More</Link>
                          </div>
                        </div>

                        {!commentSelectMode ? (
                          <ActionMenu
                            open={commentMenuOpenFor === comment.id}
                            onToggle={() => setCommentMenuOpenFor((value) => (value === comment.id ? null : comment.id))}
                            iconSize={14}
                            menuClassName="w-[180px] rounded-xl p-1.5"
                          >
                                <button
                                  className="block w-full rounded-md px-2 py-1.5 text-left text-xs hover:bg-[var(--avad-bg-soft)]"
                                  onClick={() => {
                                    void (async () => {
                                      if (comment.status === "PUBLISHED") {
                                        const reason = await requestDisapprovalReason("comment");
                                        if (!reason) {
                                          return;
                                        }
                                        await moderateComment(comment.id, "UNPUBLISH", reason);
                                        return;
                                      }

                                      await moderateComment(comment.id, "PUBLISH");
                                    })();
                                  }}
                                >
                                  {comment.status === "PUBLISHED" ? "Unpublish Comment" : "Publish Comment"}
                                </button>
                                <button className="block w-full rounded-md px-2 py-1.5 text-left text-xs text-[#db2222] hover:bg-[var(--avad-bg-soft)]" onClick={() => void moderateComment(comment.id, "DELETE")}>Delete Comment</button>
                          </ActionMenu>
                        ) : null}
                      </div>
                    </article>
                  ))}
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-[var(--avad-border)] pt-3 text-sm text-[var(--avad-text-soft)]">
                  <p>
                    Showing {comments.length} comment(s) of {commentPagination.total}
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        const next = Math.max(1, commentPage - 1);
                        void loadComments(next, commentTab, appliedSearch);
                      }}
                      disabled={commentPage <= 1}
                      className="disabled:opacity-40"
                    >
                      Back
                    </button>
                    <button
                      onClick={() => {
                        const next = Math.min(commentPagination.totalPages, commentPage + 1);
                        void loadComments(next, commentTab, appliedSearch);
                      }}
                      disabled={commentPage >= commentPagination.totalPages}
                      className="disabled:opacity-40"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </section>

      <NewsletterSection className="mt-14 md:mt-16 xl:mt-20 2xl:mt-24" />
    </>
  );
}
