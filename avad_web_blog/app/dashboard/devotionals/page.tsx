"use client";

import { Eye, MessageCircle, Plus, RefreshCw, Search } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useConfirmationDialog } from "@/components/ui/confirmation-dialog-provider";
import { ActionMenu } from "@/components/ui/action-menu";

import { formatDevotionalDate, safeThumbnailSrc, type DevotionalStatus, type DevotionalSummary, type PaginatedResponse } from "@/lib/devotional";
import { getJson, patchJson } from "@/lib/http";
import { cn } from "@/lib/utils";

type SessionUser = {
  id: string;
  fullName: string;
  role: "ADMIN" | "MODERATOR" | "BLOGGER" | "MEMBER";
};

type TabKey = "ALL" | "DRAFT" | "SCHEDULED" | "PUBLISHED";

const tabMap: Record<TabKey, DevotionalStatus | undefined> = {
  ALL: undefined,
  DRAFT: "DRAFT",
  SCHEDULED: "SCHEDULED",
  PUBLISHED: "PUBLISHED",
};

export default function DashboardDevotionalsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabKey>("ALL");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [posts, setPosts] = useState<DevotionalSummary[]>([]);
  const [pagination, setPagination] = useState<PaginatedResponse<DevotionalSummary>["pagination"]>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });
  const [session, setSession] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [menuOpenFor, setMenuOpenFor] = useState<string | null>(null);
  const [selectMode, setSelectMode] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const confirmation = useConfirmationDialog();

  const counts = useMemo(() => {
    const draft = posts.filter((post) => post.status === "DRAFT").length;
    const scheduled = posts.filter((post) => post.status === "SCHEDULED").length;
    const published = posts.filter((post) => post.status === "PUBLISHED").length;
    return {
      all: pagination.total,
      draft,
      scheduled,
      published,
    };
  }, [posts, pagination.total]);

  async function loadSession() {
    const user = await getJson<SessionUser>("/api/auth/session");
    setSession(user);
  }

  async function loadPosts(nextPage = page, nextTab = activeTab, nextSearch = search) {
    setLoading(true);
    const params = new URLSearchParams({
      page: String(nextPage),
      limit: "10",
    });
    const status = tabMap[nextTab];
    if (status) {
      params.set("status", status);
    }
    if (nextSearch.trim()) {
      params.set("search", nextSearch.trim());
    }

    const data = await getJson<PaginatedResponse<DevotionalSummary>>(`/api/dashboard/devotionals?${params.toString()}`);
    setPosts(data.items);
    setPagination(data.pagination);
    setLoading(false);
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadSession();
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadPosts(page, activeTab, search);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, activeTab]);

  async function refresh() {
    await loadPosts(page, activeTab, search);
  }

  async function handleStatusAction(
    devotionalId: string,
    action: "PUBLISH" | "SCHEDULE" | "UNPUBLISH" | "REVERT_TO_DRAFT" | "RECOMMEND" | "UNRECOMMEND",
    scheduledAt?: string,
  ) {
    await patchJson(`/api/dashboard/devotionals/${devotionalId}/status`, {
      action,
      scheduledAt,
    });
    await loadPosts(page, activeTab, search);
  }

  async function confirmStatusAction(
    devotionalId: string,
    action: "UNPUBLISH" | "REVERT_TO_DRAFT" | "RECOMMEND" | "UNRECOMMEND",
  ) {
    const actionMeta = {
      UNPUBLISH: {
        title: "Unpublish this devotional?",
        description: "The devotional will be removed from public view.",
        confirmLabel: "Unpublish",
        destructive: true,
      },
      REVERT_TO_DRAFT: {
        title: "Revert devotional to draft?",
        description: "The published devotional will no longer be publicly visible.",
        confirmLabel: "Revert",
        destructive: true,
      },
      RECOMMEND: {
        title: "Recommend this devotional?",
        description: "This devotional will appear in recommended sections.",
        confirmLabel: "Recommend",
        destructive: false,
      },
      UNRECOMMEND: {
        title: "Remove recommendation?",
        description: "This devotional will no longer be marked as recommended.",
        confirmLabel: "Remove",
        destructive: false,
      },
    } as const;

    const selectedMeta = actionMeta[action];
    const confirmed = await confirmation.confirm({
      title: selectedMeta.title,
      description: selectedMeta.description,
      confirmLabel: selectedMeta.confirmLabel,
      cancelLabel: "Cancel",
      destructive: selectedMeta.destructive,
    });
    if (!confirmed) {
      return;
    }

    await handleStatusAction(devotionalId, action);
  }

  async function handleDelete(devotionalId: string) {
    await fetch(`/api/dashboard/devotionals/${devotionalId}`, { method: "DELETE" });
    await loadPosts(page, activeTab, search);
  }

  async function handleShare(post: DevotionalSummary) {
    const shareUrl = `${window.location.origin}/devotionals/${post.slug}`;
    if (navigator.share) {
      await navigator.share({
        title: post.title,
        text: post.excerpt,
        url: shareUrl,
      });
      return;
    }

    await navigator.clipboard.writeText(shareUrl);
  }

  async function bulkRecommendSelected() {
    const selectedPublishedIds = posts
      .filter((post) => selected.includes(post.id) && post.status === "PUBLISHED" && !post.isRecommended)
      .map((post) => post.id);
    if (!selectedPublishedIds.length) {
      return;
    }

    const confirmed = await confirmation.confirm({
      title: "Recommend selected devotionals?",
      description: "All selected published devotionals will be marked as recommended.",
      confirmLabel: "Recommend",
      cancelLabel: "Cancel",
    });
    if (!confirmed) {
      return;
    }

    await Promise.all(selectedPublishedIds.map((id) => patchJson(`/api/dashboard/devotionals/${id}/status`, { action: "RECOMMEND" })));
    setSelected([]);
    setSelectMode(false);
    await loadPosts(page, activeTab, search);
  }

  async function bulkUnrecommendSelected() {
    const selectedPublishedIds = posts
      .filter((post) => selected.includes(post.id) && post.status === "PUBLISHED" && post.isRecommended)
      .map((post) => post.id);
    if (!selectedPublishedIds.length) {
      return;
    }

    const confirmed = await confirmation.confirm({
      title: "Remove recommendations from selected devotionals?",
      description: "Selected recommended devotionals will no longer be marked as recommended.",
      confirmLabel: "Remove",
      cancelLabel: "Cancel",
    });
    if (!confirmed) {
      return;
    }

    await Promise.all(selectedPublishedIds.map((id) => patchJson(`/api/dashboard/devotionals/${id}/status`, { action: "UNRECOMMEND" })));
    setSelected([]);
    setSelectMode(false);
    await loadPosts(page, activeTab, search);
  }

  async function bulkPublishSelected() {
    const selectedPublishableIds = posts
      .filter((post) => selected.includes(post.id) && post.status !== "PUBLISHED")
      .map((post) => post.id);
    if (!selectedPublishableIds.length) {
      return;
    }

    const confirmed = await confirmation.confirm({
      title: "Publish selected devotionals?",
      description: "Selected draft or scheduled devotionals will be published immediately.",
      confirmLabel: "Publish",
      cancelLabel: "Cancel",
    });
    if (!confirmed) {
      return;
    }

    await Promise.all(selectedPublishableIds.map((id) => patchJson(`/api/dashboard/devotionals/${id}/status`, { action: "PUBLISH" })));
    setSelected([]);
    setSelectMode(false);
    await loadPosts(page, activeTab, search);
  }

  async function bulkUnpublishSelected() {
    const selectedPublishedIds = posts.filter((post) => selected.includes(post.id) && post.status === "PUBLISHED").map((post) => post.id);
    if (!selectedPublishedIds.length) {
      return;
    }

    const confirmed = await confirmation.confirm({
      title: "Unpublish selected devotionals?",
      description: "Selected published devotionals will be removed from public view.",
      confirmLabel: "Unpublish",
      cancelLabel: "Cancel",
      destructive: true,
    });
    if (!confirmed) {
      return;
    }

    await Promise.all(selectedPublishedIds.map((id) => patchJson(`/api/dashboard/devotionals/${id}/status`, { action: "UNPUBLISH" })));
    setSelected([]);
    setSelectMode(false);
    await loadPosts(page, activeTab, search);
  }

  async function bulkRevertSelected() {
    const selectedPublishedIds = posts.filter((post) => selected.includes(post.id) && post.status === "PUBLISHED").map((post) => post.id);
    if (!selectedPublishedIds.length) {
      return;
    }

    const confirmed = await confirmation.confirm({
      title: "Revert selected devotionals to draft?",
      description: "Selected published devotionals will be removed from public view.",
      confirmLabel: "Revert",
      cancelLabel: "Cancel",
      destructive: true,
    });
    if (!confirmed) {
      return;
    }

    await Promise.all(selectedPublishedIds.map((id) => patchJson(`/api/dashboard/devotionals/${id}/status`, { action: "REVERT_TO_DRAFT" })));
    setSelected([]);
    setSelectMode(false);
    await loadPosts(page, activeTab, search);
  }

  async function bulkDeleteSelected() {
    if (!selected.length) {
      return;
    }

    await Promise.all(selected.map((id) => fetch(`/api/dashboard/devotionals/${id}`, { method: "DELETE" })));
    setSelected([]);
    setSelectMode(false);
    await loadPosts(page, activeTab, search);
  }

  async function confirmBulkDeleteSelected() {
    const confirmed = await confirmation.confirm({
      title: "Delete selected posts?",
      description: "These devotionals will be permanently deleted.",
      confirmLabel: "Delete",
      cancelLabel: "Cancel",
      destructive: true,
    });
    if (!confirmed) {
      return;
    }

    await bulkDeleteSelected();
  }

  async function confirmDeletePost(postId: string) {
    const confirmed = await confirmation.confirm({
      title: "Delete this post?",
      description: "This action cannot be undone.",
      confirmLabel: "Delete",
      cancelLabel: "Cancel",
      destructive: true,
    });
    if (!confirmed) {
      return;
    }

    await handleDelete(postId);
  }

  function toggleSelect(id: string) {
    setSelected((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  }

  function handleCardClick(event: React.MouseEvent<HTMLElement>, postId: string) {
    if (selectMode) {
      return;
    }

    const target = event.target as HTMLElement;
    if (target.closest("button, a, input, textarea, select, [role='button']")) {
      return;
    }

    router.push(`/dashboard/devotionals/${postId}/edit`);
  }

  const allChecked = posts.length > 0 && selected.length === posts.length;
  const selectedPosts = useMemo(() => posts.filter((post) => selected.includes(post.id)), [posts, selected]);
  const publishableCount = selectedPosts.filter((post) => post.status !== "PUBLISHED").length;
  const revertableCount = selectedPosts.filter((post) => post.status === "PUBLISHED").length;
  const unpublishableCount = revertableCount;
  const recommendableCount = selectedPosts.filter((post) => post.status === "PUBLISHED" && !post.isRecommended).length;
  const unrecommendableCount = selectedPosts.filter((post) => post.status === "PUBLISHED" && post.isRecommended).length;
  const canPublishSelected = selectedPosts.some((post) => post.status !== "PUBLISHED");
  const canRevertSelected = selectedPosts.some((post) => post.status === "PUBLISHED");
  const canUnpublishSelected = selectedPosts.some((post) => post.status === "PUBLISHED");
  const canRecommendSelected = selectedPosts.some((post) => post.status === "PUBLISHED" && !post.isRecommended);
  const canUnrecommendSelected = selectedPosts.some((post) => post.status === "PUBLISHED" && post.isRecommended);

  return (
    <section className="rounded-[24px] border border-[#ece3f4] bg-white pb-4">
      <div className="border-b border-[#efe6f6] px-4 py-4 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="font-serif text-[36px] leading-none text-[#2a1a3f]">Devotionals</h1>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative min-w-0 flex-1 basis-full sm:basis-auto sm:min-w-[280px] lg:min-w-[360px]">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7a6f89]" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    setPage(1);
                    void loadPosts(1, activeTab, search);
                  }
                }}
                placeholder="Search by name"
                className="h-9 w-full rounded-full border border-[#e9dff1] pl-9 pr-3 text-sm outline-none"
              />
            </div>

            <button
              onClick={() => void refresh()}
              className="inline-flex h-9 items-center gap-1 rounded-full border border-[#ece3f4] px-3 text-sm text-[#3a2a53]"
            >
              <RefreshCw size={14} />
              Refresh
            </button>

            <button
              onClick={() => {
                setSelectMode((prev) => !prev);
                setSelected([]);
              }}
              className={cn(
                "h-9 rounded-full border px-3 text-sm",
                selectMode ? "border-[#c58d42] bg-[#d39a52] text-white" : "border-[#ece3f4] text-[#3a2a53]",
              )}
            >
              {selectMode ? "Deselect" : "Select"}
            </button>

            <Link href="/dashboard/devotionals/comments" className="h-9 rounded-full border border-[#ece3f4] px-3 text-sm leading-9 text-[#3a2a53]">
              Comments
            </Link>

            <button
              onClick={() => router.push("/dashboard/devotionals/new")}
              className="inline-flex h-9 items-center gap-1 rounded-full bg-gradient-to-b from-[#c99556] to-[#3a1a56] px-3 text-sm text-white"
            >
              <Plus size={14} />
              New Post
            </button>
          </div>
        </div>

        <div className="mt-4 flex gap-5 text-sm text-[#3f3156]">
          {([
            ["ALL", `All Devotionals (${counts.all})`],
            ["DRAFT", `Unpublished Devotionals (${counts.draft})`],
            ["SCHEDULED", `Scheduled (${counts.scheduled})`],
            ["PUBLISHED", `Published Devotionals (${counts.published})`],
          ] as const).map(([key, label]) => (
            <button
              key={key}
              onClick={() => {
                setActiveTab(key);
                setPage(1);
              }}
              className={cn(
                "border-b pb-2",
                activeTab === key ? "border-[#8a7f99] text-[#26173a]" : "border-transparent text-[#5f5278]",
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {selectMode ? (
        <div className="flex items-center justify-between gap-3 border-b border-[#f3edf8] px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSelected(allChecked ? [] : posts.map((post) => post.id))}
              className={cn(
                "grid size-5 place-items-center rounded-md border text-xs",
                allChecked ? "border-[#d39a52] bg-[#d39a52] text-white" : "border-[#ddd1ea] text-transparent",
              )}
            >
              ✓
            </button>
            <span className="text-sm text-[#35254b]">Select All</span>
          </div>

          <div className="flex items-center gap-2">
            {selected.length > 0 && canPublishSelected ? (
              <button onClick={() => void bulkPublishSelected()} className="rounded-full border border-[#d8cfeb] px-3 py-1 text-xs text-[#3a2a53]">
                Publish Post ({publishableCount})
              </button>
            ) : null}
            {selected.length > 0 && canRevertSelected ? (
              <button onClick={() => void bulkRevertSelected()} className="rounded-full border border-[#d8cfeb] px-3 py-1 text-xs text-[#3a2a53]">
                Revert to Draft ({revertableCount})
              </button>
            ) : null}
            {selected.length > 0 && canUnpublishSelected ? (
              <button onClick={() => void bulkUnpublishSelected()} className="rounded-full border border-[#d8cfeb] px-3 py-1 text-xs text-[#3a2a53]">
                Unpublish Post ({unpublishableCount})
              </button>
            ) : null}
            {selected.length > 0 && canRecommendSelected ? (
              <button onClick={() => void bulkRecommendSelected()} className="rounded-full border border-[#d8cfeb] px-3 py-1 text-xs text-[#3a2a53]">
                Recommend Post ({recommendableCount})
              </button>
            ) : null}
            {selected.length > 0 && canUnrecommendSelected ? (
              <button onClick={() => void bulkUnrecommendSelected()} className="rounded-full border border-[#d8cfeb] px-3 py-1 text-xs text-[#3a2a53]">
                Remove Recommendation ({unrecommendableCount})
              </button>
            ) : null}
            {selected.length > 0 ? (
              <button
                onClick={() => {
                  void confirmBulkDeleteSelected();
                }}
                className="rounded-full bg-[#ff3f00] px-3 py-1 text-xs text-white"
              >
                Delete Post ({selected.length})
              </button>
            ) : null}
          </div>
        </div>
      ) : null}

      <div className="space-y-3 px-4 py-3 sm:px-6">
        {loading ? <p className="py-8 text-sm text-[#7a6f89]">Loading posts...</p> : null}

        {!loading && posts.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#e6daee] p-8 text-center text-sm text-[#75698b]">
            There are no devotionals here yet.
          </div>
        ) : null}

        {!loading
          ? posts.map((post) => {
              const showMenu = menuOpenFor === post.id;

              return (
                <article
                  key={post.id}
                  onClick={(event) => handleCardClick(event, post.id)}
                  className={cn(
                    "relative grid grid-cols-[auto_1fr_auto] items-center gap-3 rounded-2xl border border-[#f2e8f8] bg-[#fdf9ff] px-3 py-3 transition",
                    "hover:border-[#d5a774] hover:shadow-[0_0_0_1px_#3b1f59_inset]",
                    "dark:border-[#3f3450] dark:bg-[#23182f] dark:hover:border-[#8a6a3f] dark:hover:shadow-[0_0_0_1px_#8a6a3f_inset]",
                    !selectMode && "cursor-pointer",
                    showMenu && "z-30",
                  )}
                >
                  {selectMode ? (
                    <button
                      onClick={() => toggleSelect(post.id)}
                      className={cn(
                        "grid size-6 place-items-center rounded-md border text-xs",
                        selected.includes(post.id)
                          ? "border-[#d39a52] bg-[#d39a52] text-white"
                          : "border-[#e2d8ee] text-transparent",
                      )}
                    >
                      ✓
                    </button>
                  ) : null}

                  <Image
                    src={safeThumbnailSrc(post.thumbnail, post.title)}
                    alt={post.title}
                    width={68}
                    height={54}
                    className="h-[54px] w-[68px] rounded-xl object-cover"
                  />

                  <div>
                    <p className="font-serif text-[18px] leading-[1.15] text-[#2a1a3f] md:text-[19px]">{post.title}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-[#564a6d]">
                      <span>{post.status === "PUBLISHED" ? "Published" : post.status === "SCHEDULED" ? "Scheduled" : "Draft"}</span>
                      {post.isRecommended ? (
                        <>
                          <span>•</span>
                          <span className="rounded-full border border-[#e4cfb2] bg-[#fff5e7] px-2 py-0.5 text-[#b86d1f]">Recommended</span>
                        </>
                      ) : null}
                      <span>•</span>
                      <span>{formatDevotionalDate(post.devotionalDate)}</span>
                      {post.tags.slice(0, 2).map((tag) => (
                        <span key={tag} className="rounded-full border border-[#e4cfb2] px-2 py-0.5 text-[#ce8a38]">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 pr-2 text-sm text-[#2f2345]">
                    {post.status === "PUBLISHED" ? (
                      <>
                        <span className="inline-flex items-center gap-1 text-xs"><Eye size={14} /> {post.views}</span>
                        <span className="inline-flex items-center gap-1 text-xs"><MessageCircle size={14} /> {post.commentsCount}</span>
                      </>
                    ) : null}

                    {!selectMode ? (
                      <ActionMenu
                        open={showMenu}
                        onToggle={() => setMenuOpenFor((prev) => (prev === post.id ? null : post.id))}
                        menuClassName="right-2 top-12 w-[210px] border-[#efe6f6] bg-white p-2 text-sm text-[#2c1b42] dark:border-[#3f3450] dark:bg-[#241b31] dark:text-[#f3eafe]"
                      >
                        {post.status === "PUBLISHED" ? (
                          <>
                            <MenuAction label="Edit Post" onClick={() => router.push(`/dashboard/devotionals/${post.id}/edit`)} />
                            <MenuAction label="View Post" onClick={() => router.push(`/devotionals/${post.slug}`)} />
                            <MenuAction label="Preview Post" onClick={() => router.push(`/dashboard/devotionals/${post.id}/preview`)} />
                            <MenuAction label="Unpublish Post" onClick={() => void confirmStatusAction(post.id, "UNPUBLISH")} />
                            <MenuAction label="Revert to Draft" onClick={() => void confirmStatusAction(post.id, "REVERT_TO_DRAFT")} />
                            <MenuAction label="Share" onClick={() => void handleShare(post)} />
                            <MenuAction label="View Comments" onClick={() => router.push(`/dashboard/devotionals/comments?devotionalId=${post.id}`)} />
                            <MenuAction label="Add Tags" onClick={() => router.push(`/dashboard/devotionals/${post.id}/edit#tags`)} />
                            <MenuAction
                              label={post.isRecommended ? "Remove Recommendation" : "Recommend Post"}
                              onClick={() => void confirmStatusAction(post.id, post.isRecommended ? "UNRECOMMEND" : "RECOMMEND")}
                            />
                            <MenuAction
                              label="Delete Post"
                              danger
                              onClick={() => {
                                void confirmDeletePost(post.id);
                              }}
                            />
                          </>
                        ) : (
                          <>
                            <MenuAction label="Edit Post" onClick={() => router.push(`/dashboard/devotionals/${post.id}/edit`)} />
                            <MenuAction label="Preview Post" onClick={() => router.push(`/dashboard/devotionals/${post.id}/preview`)} />
                            {session?.role !== "BLOGGER" ? (
                              <MenuAction label="Publish Post" onClick={() => router.push(`/dashboard/devotionals/${post.id}/publish`)} />
                            ) : null}
                            <MenuAction label="Add Tags" onClick={() => router.push(`/dashboard/devotionals/${post.id}/edit#tags`)} />
                            <MenuAction
                              label={post.status === "DRAFT" ? "Discard Draft" : "Delete Post"}
                              danger
                              onClick={() => {
                                void confirmDeletePost(post.id);
                              }}
                            />
                          </>
                        )}
                      </ActionMenu>
                    ) : null}
                  </div>
                </article>
              );
            })
          : null}
      </div>

      <div className="flex items-center justify-between border-t border-[#efe6f6] px-4 py-3 text-sm text-[#4c3f63] sm:px-6">
        <p>
          Showing {posts.length} post(s) of {pagination.total}
        </p>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPage((prev) => Math.max(1, prev - 1))}
            disabled={page <= 1}
            className="disabled:opacity-40"
          >
            Back
          </button>
          {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, index) => index + 1).map((value) => (
            <button
              key={value}
              onClick={() => setPage(value)}
              className={cn(
                "grid size-6 place-items-center rounded-full text-xs",
                page === value ? "bg-gradient-to-b from-[#c99556] to-[#3a1a56] text-white" : "text-[#3d3051]",
              )}
            >
              {value}
            </button>
          ))}
          <button
            onClick={() => setPage((prev) => Math.min(pagination.totalPages, prev + 1))}
            disabled={page >= pagination.totalPages}
            className="disabled:opacity-40"
          >
            Next
          </button>
        </div>
      </div>
    </section>
  );
}

function MenuAction({ label, onClick, danger }: { label: string; onClick: () => void; danger?: boolean }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "block w-full rounded-md px-2 py-1.5 text-left transition hover:bg-[#f8f1ff] dark:hover:bg-[#342744]",
        danger ? "text-[#db2222]" : "text-[#2f2345] dark:text-[#f3eafe]",
      )}
    >
      {label}
    </button>
  );
}
