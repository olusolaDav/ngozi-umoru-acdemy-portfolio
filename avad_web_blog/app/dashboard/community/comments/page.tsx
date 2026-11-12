"use client";

import { CalendarDays, RefreshCw } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

import { ActionMenu } from "@/components/ui/action-menu";
import { useConfirmationDialog } from "@/components/ui/confirmation-dialog-provider";
import { formatCommunityDate, type CommunityComment, type PaginatedResponse } from "@/lib/community";
import { getJson, patchJson } from "@/lib/http";
import { cn } from "@/lib/utils";

type AdminComment = Omit<CommunityComment, "replies"> & {
  community?: {
    id: string;
    title: string;
    slug: string;
    authorId: string | null;
  };
  repliesCount: number;
  replies: AdminComment[];
};

type AdminCommentsResponse = PaginatedResponse<AdminComment> & {
  statusTotals: {
    unpublished: number;
    published: number;
  };
};

type CommentTab = "UNPUBLISHED" | "PUBLISHED";

function DashboardCommunityCommentsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const confirmation = useConfirmationDialog();
  const preselectedCommunityId = searchParams.get("communityId");

  const [tab, setTab] = useState<CommentTab>("UNPUBLISHED");
  const [search, setSearch] = useState("");
  const [comments, setComments] = useState<AdminComment[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectMode, setSelectMode] = useState(false);
  const [menuFor, setMenuFor] = useState<string | null>(null);
  const [expandedThreads, setExpandedThreads] = useState<Record<string, boolean>>({});
  const [pagination, setPagination] = useState<PaginatedResponse<AdminComment>["pagination"]>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });
  const [statusTotals, setStatusTotals] = useState({ unpublished: 0, published: 0 });

  const allChecked = comments.length > 0 && selectedIds.length === comments.length;

  async function loadComments(nextPage = pagination.page, nextTab = tab, nextSearch = search) {
    const params = new URLSearchParams({
      page: String(nextPage),
      limit: "10",
      status: nextTab,
    });
    if (preselectedCommunityId) {
      params.set("communityId", preselectedCommunityId);
    }
    if (nextSearch.trim()) {
      params.set("search", nextSearch.trim());
    }
    const data = await getJson<AdminCommentsResponse>(`/api/dashboard/community/comments?${params.toString()}`);
    setComments(data.items);
    setPagination(data.pagination);
    setStatusTotals(data.statusTotals);
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadComments(1, tab, search);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  async function moderate(id: string, action: "PUBLISH" | "UNPUBLISH" | "DELETE", reason?: string) {
    await patchJson(`/api/dashboard/community/comments/${id}`, { action, reason });
    await loadComments(pagination.page, tab, search);
  }

  async function bulkDelete() {
    await patchJson("/api/dashboard/community/comments/bulk-delete", { ids: selectedIds });
    setSelectedIds([]);
    setSelectMode(false);
    await loadComments(pagination.page, tab, search);
  }

  async function bulkPublish() {
    await Promise.all(selectedIds.map((id) => patchJson(`/api/dashboard/community/comments/${id}`, { action: "PUBLISH" })));
    setSelectedIds([]);
    setSelectMode(false);
    await loadComments(pagination.page, tab, search);
  }

  function renderCommentThread(comment: AdminComment, depth = 0, inheritedCommunityTitle?: string) {
    const showMenu = menuFor === comment.id;
    const nestedOffset = depth > 0 ? "ml-8 border-l border-[var(--avad-border)] pl-4" : "";
    const hasReplies = Boolean(comment.replies?.length);
    const defaultExpanded = tab === "UNPUBLISHED";
    const isExpanded = expandedThreads[comment.id] ?? defaultExpanded;
    const communityTitle = comment.community?.title ?? inheritedCommunityTitle ?? "this post";

    return (
      <article key={comment.id} className={cn("relative py-4", nestedOffset, showMenu && "z-30")}>
        <div className="flex gap-3">
          {selectMode && depth === 0 ? (
            <button
              onClick={() =>
                setSelectedIds((prev) =>
                  prev.includes(comment.id) ? prev.filter((id) => id !== comment.id) : [...prev, comment.id],
                )
              }
              className={cn(
                "mt-1 grid size-6 place-items-center rounded-md border text-xs",
                selectedIds.includes(comment.id)
                  ? "border-[#d39a52] bg-[#d39a52] text-white"
                  : "border-[var(--avad-border)] text-transparent",
              )}
            >
              ✓
            </button>
          ) : null}

          <div className="size-10 rounded-xl bg-[var(--avad-bg-soft)]" />

          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2 text-[var(--avad-text)]">
              <p className="text-[22px] leading-none font-semibold">{comment.authorName}</p>
              <span className="text-sm text-[var(--avad-text-soft)]">commented on</span>
              <span className="text-[24px] font-semibold leading-none">&quot;{communityTitle}&quot;</span>
              <span className="inline-flex items-center gap-1 text-xs text-[var(--avad-text-soft)]"><CalendarDays size={13} />{formatCommunityDate(comment.createdAt)}</span>
            </div>
            <p className="mt-2 max-w-[860px] text-[18px] leading-[1.5] text-[var(--avad-text)]">{comment.message}</p>
            {comment.status === "UNPUBLISHED" && comment.moderationReason ? (
              <p className="mt-2 max-w-[860px] rounded-lg border border-[#f0d7d2] bg-[#fff2ef] px-3 py-2 text-xs text-[#8e2f19]">
                Moderator feedback: {comment.moderationReason}
              </p>
            ) : null}
          </div>

          {!selectMode ? (
            <ActionMenu
              open={showMenu}
              onToggle={() => setMenuFor((prev) => (prev === comment.id ? null : comment.id))}
              iconSize={14}
              menuClassName="top-12 w-[190px]"
            >
                  <button
                    onClick={() => {
                      void (async () => {
                        if (comment.status === "PUBLISHED") {
                          const reason = await confirmation.prompt({
                            title: "Disapproval reason required",
                            description: "Please provide a reason for disapproving this comment.",
                            confirmLabel: "Submit",
                            cancelLabel: "Cancel",
                            placeholder: "Enter moderation reason",
                            required: true,
                          });

                          if (!reason) {
                            return;
                          }

                          await moderate(comment.id, "UNPUBLISH", reason);
                          return;
                        }

                        await moderate(comment.id, "PUBLISH");
                      })();
                    }}
                    className="block w-full rounded px-2 py-1.5 text-left text-xs hover:bg-[var(--avad-bg-soft)]"
                  >
                    {comment.status === "PUBLISHED" ? "Unpublish Comment" : "Publish Comment"}
                  </button>
                  <button onClick={() => void moderate(comment.id, "DELETE")} className="block w-full rounded px-2 py-1.5 text-left text-xs text-[#db2222] hover:bg-[var(--avad-bg-soft)]">
                    Delete Comment
                  </button>
            </ActionMenu>
          ) : null}
        </div>

        {hasReplies ? (
          <div className="mt-3">
            <button
              type="button"
              onClick={() =>
                setExpandedThreads((prev) => ({
                  ...prev,
                  [comment.id]: !(prev[comment.id] ?? defaultExpanded),
                }))
              }
              className="rounded-full border border-[var(--avad-border)] px-3 py-1 text-[11px] font-semibold text-[var(--avad-text)] transition hover:bg-[var(--avad-bg-soft)]"
            >
              {isExpanded ? "Hide Replies" : `Show Replies (${comment.replies.length})`}
            </button>

            {isExpanded ? (
              <div className="mt-2 space-y-2">
                {comment.replies.map((reply) => renderCommentThread(reply, depth + 1, communityTitle))}
              </div>
            ) : null}
          </div>
        ) : null}
      </article>
    );
  }

  return (
    <section className="rounded-[24px] border border-[var(--avad-border)] bg-[var(--avad-bg-elevated)] pb-4">
      <div className="border-b border-[var(--avad-border)] px-4 py-4 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="font-serif text-[36px] leading-none text-[var(--avad-text-strong)]">Community Comment</h1>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => void loadComments(pagination.page, tab, search)}
              className="inline-flex h-9 items-center gap-1 rounded-full border border-[var(--avad-border)] bg-[var(--avad-bg-soft)] px-3 text-sm text-[var(--avad-text)]"
            >
              <RefreshCw size={14} />
              Refresh
            </button>

            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  void loadComments(1, tab, search);
                }
              }}
              placeholder="Search by name"
              className="h-9 rounded-full border border-[var(--avad-border)] bg-[var(--avad-bg-soft)] px-3 text-sm text-[var(--avad-text)] outline-none"
            />
            <button
              onClick={() => {
                setSelectMode((prev) => !prev);
                setSelectedIds([]);
              }}
              className={cn(
                "h-9 rounded-full border px-3 text-sm",
                selectMode ? "border-[#c58d42] bg-[#d39a52] text-white" : "border-[var(--avad-border)] text-[var(--avad-text)]",
              )}
            >
              {selectMode ? "Deselect" : "Select"}
            </button>
            <button onClick={() => router.push("/dashboard/community")} className="h-9 rounded-full border border-[var(--avad-border)] bg-[var(--avad-bg-soft)] px-3 text-sm text-[var(--avad-text)]">
              Community Post
            </button>
            <button onClick={() => router.push("/dashboard/community/new")} className="h-9 rounded-full bg-gradient-to-b from-[#c99556] to-[#3a1a56] px-3 text-sm text-white">
              + New Post
            </button>
          </div>
        </div>

        <div className="mt-4 flex gap-4 text-sm">
          <button
            onClick={() => setTab("UNPUBLISHED")}
            className={cn("border-b pb-2", tab === "UNPUBLISHED" ? "border-[var(--avad-ring)]" : "border-transparent")}
          >
            Unpublished Comments ({statusTotals.unpublished})
          </button>
          <button
            onClick={() => setTab("PUBLISHED")}
            className={cn("border-b pb-2", tab === "PUBLISHED" ? "border-[var(--avad-ring)]" : "border-transparent")}
          >
            Published Comments ({statusTotals.published})
          </button>
        </div>
      </div>

      {selectMode ? (
        <div className="flex items-center justify-between border-b border-[var(--avad-border)] px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSelectedIds(allChecked ? [] : comments.map((comment) => comment.id))}
              className={cn(
                "grid size-5 place-items-center rounded-md border text-xs",
                allChecked ? "border-[#d39a52] bg-[#d39a52] text-white" : "border-[var(--avad-border)] text-transparent",
              )}
            >
              ✓
            </button>
            <span className="text-sm">Select All</span>
          </div>
          <div className="flex items-center gap-2">
            {selectedIds.length > 0 ? (
              <button onClick={() => void bulkPublish()} className="rounded-full border border-[var(--avad-border)] bg-[var(--avad-bg-soft)] px-3 py-1 text-xs text-[var(--avad-text)]">
                Publish Comment
              </button>
            ) : null}
            {selectedIds.length > 0 ? (
              <button onClick={() => void bulkDelete()} className="rounded-full bg-[#ff3f00] px-3 py-1 text-xs text-white">
                Delete Comment
              </button>
            ) : null}
          </div>
        </div>
      ) : null}

      <div className="divide-y divide-[var(--avad-border)] px-4 sm:px-6">
        {comments.map((comment) => renderCommentThread(comment))}

        {comments.length === 0 ? <p className="py-16 text-center text-sm text-[var(--avad-text-soft)]">There are no comments here yet.</p> : null}
      </div>

      <div className="border-t border-[var(--avad-border)] px-4 py-3 text-sm text-[var(--avad-text-soft)] sm:px-6">
        Showing {comments.length} comment(s) of {pagination.total}
      </div>
    </section>
  );
}

export default function DashboardCommunityCommentsPage() {
  return <Suspense fallback={null}><DashboardCommunityCommentsContent /></Suspense>;
}
