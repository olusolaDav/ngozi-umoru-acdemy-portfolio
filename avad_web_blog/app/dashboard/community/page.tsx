"use client";

import { Eye, MessageCircle, Plus, RefreshCw, Search } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useConfirmationDialog } from "@/components/ui/confirmation-dialog-provider";
import { ActionMenu } from "@/components/ui/action-menu";

import { formatCommunityDate, safeThumbnailSrc, type CommunityStatus, type CommunitySubmissionRevision, type CommunitySummary, type PaginatedResponse } from "@/lib/community";
import { getJson, patchJson } from "@/lib/http";
import { cn } from "@/lib/utils";

type SessionUser = {
  id: string;
  fullName: string;
  role: "ADMIN" | "MODERATOR" | "BLOGGER" | "MEMBER";
};

type AdminListScope = "ALL" | "CONTENT" | "CONTRIBUTORS" | "SUBMISSIONS";
type SubmissionState = "PENDING" | "DISAPPROVED" | "APPROVED";

type TabKey =
  | "ALL"
  | "STAFF_PUBLISHED"
  | "STAFF_DRAFT"
  | "STAFF_SCHEDULED"
  | "ALL_PUBLISHED"
  | "MEMBER_THREADS"
  | "UNAPPROVED"
  | "PENDING_THREADS"
  | "DISAPPROVED_THREADS"
  | "APPROVED_THREADS";

const tabMap: Partial<Record<TabKey, CommunityStatus | undefined>> = {
  ALL: undefined,
  STAFF_PUBLISHED: "PUBLISHED",
  STAFF_DRAFT: "DRAFT",
  STAFF_SCHEDULED: "SCHEDULED",
  UNAPPROVED: "UNAPPROVED",
  ALL_PUBLISHED: "PUBLISHED",
};

type TabCounts = {
  all: number;
  staffPublished: number;
  staffDraft: number;
  staffScheduled: number;
  memberThreads: number;
  unapproved: number;
  allPublished: number;
  pendingThreads: number;
  disapprovedThreads: number;
  approvedThreads: number;
};

const initialTabCounts: TabCounts = {
  all: 0,
  staffPublished: 0,
  staffDraft: 0,
  staffScheduled: 0,
  memberThreads: 0,
  unapproved: 0,
  allPublished: 0,
  pendingThreads: 0,
  disapprovedThreads: 0,
  approvedThreads: 0,
};

export default function DashboardCommunityPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabKey>("ALL");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [posts, setPosts] = useState<CommunitySummary[]>([]);
  const [pagination, setPagination] = useState<PaginatedResponse<CommunitySummary>["pagination"]>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });
  const [session, setSession] = useState<SessionUser | null>(null);
  const [tabCounts, setTabCounts] = useState<TabCounts>(initialTabCounts);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [menuOpenFor, setMenuOpenFor] = useState<string | null>(null);
  const [selectMode, setSelectMode] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [disapprovalModalPost, setDisapprovalModalPost] = useState<CommunitySummary | null>(null);
  const [disapprovalReason, setDisapprovalReason] = useState("");
  const [disapprovalError, setDisapprovalError] = useState<string | null>(null);
  const [submittingDisapproval, setSubmittingDisapproval] = useState(false);
  const [submissionHistory, setSubmissionHistory] = useState<Record<string, CommunitySubmissionRevision[]>>({});
  const confirmation = useConfirmationDialog();

  async function loadSession() {
    const user = await getJson<SessionUser>("/api/auth/session");
    setSession(user);
  }

  const isPrivilegedSession = session?.role === "ADMIN" || session?.role === "MODERATOR";

  function isSubmissionTab(tab: TabKey) {
    return tab === "PENDING_THREADS" || tab === "DISAPPROVED_THREADS" || tab === "APPROVED_THREADS";
  }

  function tabQuery(tab: TabKey, role?: SessionUser["role"]) {
    const privileged = role === "ADMIN" || role === "MODERATOR";
    if (privileged) {
      if (tab === "PENDING_THREADS") {
        return { scope: "SUBMISSIONS" as AdminListScope, submissionState: "PENDING" as SubmissionState };
      }

      if (tab === "DISAPPROVED_THREADS") {
        return { scope: "SUBMISSIONS" as AdminListScope, submissionState: "DISAPPROVED" as SubmissionState };
      }

      if (tab === "APPROVED_THREADS") {
        return { scope: "SUBMISSIONS" as AdminListScope, submissionState: "APPROVED" as SubmissionState };
      }

      if (tab === "STAFF_PUBLISHED" || tab === "STAFF_DRAFT" || tab === "STAFF_SCHEDULED") {
        return { scope: "CONTENT" as AdminListScope, status: tabMap[tab] };
      }

      if (tab === "MEMBER_THREADS") {
        return { scope: "CONTRIBUTORS" as AdminListScope };
      }

      return { scope: "ALL" as AdminListScope, status: tabMap[tab] };
    }

    return {
      scope: "ALL" as AdminListScope,
      status: tabMap[tab],
    };
  }

  function isSubmissionThread(post: CommunitySummary) {
    return (post.authorRole === "BLOGGER" || post.authorRole === "MEMBER") && post.submissionCount > 0;
  }

  async function loadTabCounts(role = session?.role, nextSearch = search) {
    if (!role) {
      setTabCounts(initialTabCounts);
      return;
    }

    const buildCountRequest = async (options: {
      scope: AdminListScope;
      status?: CommunityStatus;
      submissionState?: SubmissionState;
    }) => {
      const params = new URLSearchParams({
        page: "1",
        limit: "1",
        scope: options.scope,
      });
      if (options.status) {
        params.set("status", options.status);
      }
      if (options.submissionState) {
        params.set("submissionState", options.submissionState);
      }
      if (nextSearch.trim()) {
        params.set("search", nextSearch.trim());
      }

      const data = await getJson<PaginatedResponse<CommunitySummary>>(`/api/dashboard/community?${params.toString()}`);
      return data.pagination.total;
    };

    if (role === "ADMIN" || role === "MODERATOR") {
      const [all, staffPublished, staffDraft, staffScheduled, memberThreads, allPublished, pendingThreads, disapprovedThreads, approvedThreads] = await Promise.all([
        buildCountRequest({ scope: "ALL" }),
        buildCountRequest({ scope: "CONTENT", status: "PUBLISHED" }),
        buildCountRequest({ scope: "CONTENT", status: "DRAFT" }),
        buildCountRequest({ scope: "CONTENT", status: "SCHEDULED" }),
        buildCountRequest({ scope: "CONTRIBUTORS" }),
        buildCountRequest({ scope: "ALL", status: "PUBLISHED" }),
        buildCountRequest({ scope: "SUBMISSIONS", submissionState: "PENDING" }),
        buildCountRequest({ scope: "SUBMISSIONS", submissionState: "DISAPPROVED" }),
        buildCountRequest({ scope: "SUBMISSIONS", submissionState: "APPROVED" }),
      ]);

      setTabCounts({
        all,
        staffPublished,
        staffDraft,
        staffScheduled,
        memberThreads,
        unapproved: 0,
        allPublished,
        pendingThreads,
        disapprovedThreads,
        approvedThreads,
      });
      return;
    }

    const [all, unapproved, allPublished] = await Promise.all([
      buildCountRequest({ scope: "ALL" }),
      buildCountRequest({ scope: "ALL", status: "UNAPPROVED" }),
      buildCountRequest({ scope: "ALL", status: "PUBLISHED" }),
    ]);

    setTabCounts({
      all,
      staffPublished: 0,
      staffDraft: 0,
      staffScheduled: 0,
      memberThreads: 0,
      unapproved,
      allPublished,
      pendingThreads: 0,
      disapprovedThreads: 0,
      approvedThreads: 0,
    });
  }

  async function loadPosts(nextPage = page, nextTab = activeTab, nextSearch = search, role = session?.role) {
    setLoading(true);
    setLoadError(null);
    const query = tabQuery(nextTab, role);
    const submissionTab = isSubmissionTab(nextTab);
    const params = new URLSearchParams({
      page: String(nextPage),
      limit: "10",
      scope: query.scope,
    });
    if (query.status) {
      params.set("status", query.status);
    }
    if (query.submissionState) {
      params.set("submissionState", query.submissionState);
    }
    if (nextSearch.trim()) {
      params.set("search", nextSearch.trim());
    }

    try {
      const data = await getJson<PaginatedResponse<CommunitySummary>>(`/api/dashboard/community?${params.toString()}`);
      if (submissionTab && query.submissionState) {
        const histories = await Promise.all(
          data.items.map(async (post) => {
            const history = await getJson<CommunitySubmissionRevision[]>(`/api/dashboard/community/${post.id}/submissions`).catch(() => []);
            return [post.id, history] as const;
          }),
        );
        setSubmissionHistory(Object.fromEntries(histories));
        setPosts(data.items);
        setPagination(data.pagination);
      } else {
        setPosts(data.items);
        setPagination(data.pagination);
      }
    } catch (error) {
      setPosts([]);
      setPagination({
        page: nextPage,
        limit: 10,
        total: 0,
        totalPages: 1,
      });
      const message = error instanceof Error ? error.message : "Unable to load posts right now.";
      setLoadError(message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadSession();
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadPosts(page, activeTab, search, session?.role);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, activeTab, session?.role]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadTabCounts(session?.role, search);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.role]);

  useEffect(() => {
    if (!isPrivilegedSession && isSubmissionTab(activeTab)) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setActiveTab("ALL");
      setPage(1);
    }
  }, [activeTab, isPrivilegedSession]);

  async function refresh() {
    await Promise.all([loadPosts(page, activeTab, search), loadTabCounts(session?.role, search)]);
  }

  async function handleStatusAction(
    communityId: string,
    action: "PUBLISH" | "SCHEDULE" | "UNPUBLISH" | "REVERT_TO_DRAFT" | "RECOMMEND" | "UNRECOMMEND",
    scheduledAt?: string,
    reason?: string,
  ) {
    await patchJson(`/api/dashboard/community/${communityId}/status`, {
      action,
      scheduledAt,
      reason,
    });
    await Promise.all([loadPosts(page, activeTab, search), loadTabCounts(session?.role, search)]);
  }

  function openDisapprovalModal(post: CommunitySummary) {
    setMenuOpenFor(null);
    setDisapprovalModalPost(post);
    setDisapprovalReason(post.moderationReason ?? "");
    setDisapprovalError(null);
  }

  function closeDisapprovalModal() {
    if (submittingDisapproval) {
      return;
    }
    setDisapprovalModalPost(null);
    setDisapprovalReason("");
    setDisapprovalError(null);
  }

  async function submitDisapproval() {
    if (!disapprovalModalPost) {
      return;
    }

    const normalizedReason = disapprovalReason.trim();
    if (normalizedReason.length < 10) {
      setDisapprovalError("Please enter a clear reason with at least 10 characters.");
      return;
    }

    setDisapprovalError(null);
    setSubmittingDisapproval(true);

    try {
      await handleStatusAction(disapprovalModalPost.id, "REVERT_TO_DRAFT", undefined, normalizedReason);
      setDisapprovalModalPost(null);
      setDisapprovalReason("");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to disapprove this thread right now.";
      setDisapprovalError(message);
    } finally {
      setSubmittingDisapproval(false);
    }
  }

  async function confirmStatusAction(
    communityId: string,
    action: "UNPUBLISH" | "REVERT_TO_DRAFT" | "RECOMMEND" | "UNRECOMMEND",
  ) {
    const actionMeta = {
      UNPUBLISH: {
        title: "Unpublish this community?",
        description: "The community will be removed from public view.",
        confirmLabel: "Unpublish",
        destructive: true,
      },
      REVERT_TO_DRAFT: {
        title: "Revert community to draft?",
        description: "The published community will no longer be publicly visible.",
        confirmLabel: "Revert",
        destructive: true,
      },
      RECOMMEND: {
        title: "Recommend this community?",
        description: "This community will appear in recommended sections.",
        confirmLabel: "Recommend",
        destructive: false,
      },
      UNRECOMMEND: {
        title: "Remove recommendation?",
        description: "This community will no longer be marked as recommended.",
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

    await handleStatusAction(communityId, action);
  }

  async function handleDelete(communityId: string) {
    await fetch(`/api/dashboard/community/${communityId}`, { method: "DELETE" });
    await Promise.all([loadPosts(page, activeTab, search), loadTabCounts(session?.role, search)]);
  }

  async function handleShare(post: CommunitySummary) {
    const shareUrl = `${window.location.origin}/community/thread/${post.slug}`;
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
      title: "Recommend selected community?",
      description: "All selected published community will be marked as recommended.",
      confirmLabel: "Recommend",
      cancelLabel: "Cancel",
    });
    if (!confirmed) {
      return;
    }

    await Promise.all(selectedPublishedIds.map((id) => patchJson(`/api/dashboard/community/${id}/status`, { action: "RECOMMEND" })));
    setSelected([]);
    setSelectMode(false);
    await Promise.all([loadPosts(page, activeTab, search), loadTabCounts(session?.role, search)]);
  }

  async function bulkUnrecommendSelected() {
    const selectedPublishedIds = posts
      .filter((post) => selected.includes(post.id) && post.status === "PUBLISHED" && post.isRecommended)
      .map((post) => post.id);
    if (!selectedPublishedIds.length) {
      return;
    }

    const confirmed = await confirmation.confirm({
      title: "Remove recommendations from selected community?",
      description: "Selected recommended community will no longer be marked as recommended.",
      confirmLabel: "Remove",
      cancelLabel: "Cancel",
    });
    if (!confirmed) {
      return;
    }

    await Promise.all(selectedPublishedIds.map((id) => patchJson(`/api/dashboard/community/${id}/status`, { action: "UNRECOMMEND" })));
    setSelected([]);
    setSelectMode(false);
    await Promise.all([loadPosts(page, activeTab, search), loadTabCounts(session?.role, search)]);
  }

  async function bulkPublishSelected() {
    const selectedPublishableIds = posts
      .filter((post) => selected.includes(post.id) && post.status !== "PUBLISHED")
      .map((post) => post.id);
    if (!selectedPublishableIds.length) {
      return;
    }

    const confirmed = await confirmation.confirm({
      title: "Publish selected community?",
      description: "Selected draft or scheduled community will be published immediately.",
      confirmLabel: "Publish",
      cancelLabel: "Cancel",
    });
    if (!confirmed) {
      return;
    }

    await Promise.all(selectedPublishableIds.map((id) => patchJson(`/api/dashboard/community/${id}/status`, { action: "PUBLISH" })));
    setSelected([]);
    setSelectMode(false);
    await Promise.all([loadPosts(page, activeTab, search), loadTabCounts(session?.role, search)]);
  }

  async function bulkUnpublishSelected() {
    const selectedPublishedIds = posts.filter((post) => selected.includes(post.id) && post.status === "PUBLISHED").map((post) => post.id);
    if (!selectedPublishedIds.length) {
      return;
    }

    const confirmed = await confirmation.confirm({
      title: "Unpublish selected community?",
      description: "Selected published community will be removed from public view.",
      confirmLabel: "Unpublish",
      cancelLabel: "Cancel",
      destructive: true,
    });
    if (!confirmed) {
      return;
    }

    await Promise.all(selectedPublishedIds.map((id) => patchJson(`/api/dashboard/community/${id}/status`, { action: "UNPUBLISH" })));
    setSelected([]);
    setSelectMode(false);
    await Promise.all([loadPosts(page, activeTab, search), loadTabCounts(session?.role, search)]);
  }

  async function bulkRevertSelected() {
    const selectedPublishedIds = posts.filter((post) => selected.includes(post.id) && post.status === "PUBLISHED").map((post) => post.id);
    if (!selectedPublishedIds.length) {
      return;
    }

    const confirmed = await confirmation.confirm({
      title: "Revert selected community to draft?",
      description: "Selected published community will be removed from public view.",
      confirmLabel: "Revert",
      cancelLabel: "Cancel",
      destructive: true,
    });
    if (!confirmed) {
      return;
    }

    await Promise.all(selectedPublishedIds.map((id) => patchJson(`/api/dashboard/community/${id}/status`, { action: "REVERT_TO_DRAFT" })));
    setSelected([]);
    setSelectMode(false);
    await Promise.all([loadPosts(page, activeTab, search), loadTabCounts(session?.role, search)]);
  }

  async function bulkDeleteSelected() {
    if (!selected.length) {
      return;
    }

    await Promise.all(selected.map((id) => fetch(`/api/dashboard/community/${id}`, { method: "DELETE" })));
    setSelected([]);
    setSelectMode(false);
    await Promise.all([loadPosts(page, activeTab, search), loadTabCounts(session?.role, search)]);
  }

  async function confirmBulkDeleteSelected() {
    const confirmed = await confirmation.confirm({
      title: "Delete selected posts?",
      description: "These community will be permanently deleted.",
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

    router.push(`/dashboard/community/${postId}/edit`);
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

  function formatRole(role: CommunitySummary["authorRole"]) {
    if (!role) {
      return "";
    }

    return role[0] + role.slice(1).toLowerCase();
  }

  return (
    <section className="rounded-[24px] border border-[#ece3f4] bg-white pb-4">
      <div className="border-b border-[#efe6f6] px-4 py-4 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="font-serif text-[36px] leading-none text-[#2a1a3f]">Community</h1>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative min-w-0 flex-1 basis-full sm:basis-auto sm:min-w-[280px] lg:min-w-[360px]">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7a6f89]" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    setPage(1);
                    void Promise.all([loadPosts(1, activeTab, search), loadTabCounts(session?.role, search)]);
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

            <Link href="/dashboard/community/comments" className="h-9 rounded-full border border-[#ece3f4] px-3 text-sm leading-9 text-[#3a2a53]">
              Comments
            </Link>

            <button
              onClick={() => router.push("/dashboard/community/new")}
              className="inline-flex h-9 items-center gap-1 rounded-full bg-gradient-to-b from-[#c99556] to-[#3a1a56] px-3 text-sm text-white"
            >
              <Plus size={14} />
              New Thread
            </button>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-5 text-sm text-[#3f3156]">
          {([
            ["ALL", `All Threads (${tabCounts.all})`],
            ...(isPrivilegedSession
              ? ([
                  ["STAFF_PUBLISHED", `Staff Published Threads (${tabCounts.staffPublished})`],
                  ["STAFF_DRAFT", `Staff Drafts (${tabCounts.staffDraft})`],
                  ["STAFF_SCHEDULED", `Staff Scheduled (${tabCounts.staffScheduled})`],
                  ["ALL_PUBLISHED", `All Published (${tabCounts.allPublished})`],
                  ["MEMBER_THREADS", `Members (${tabCounts.memberThreads})`],
                  ["PENDING_THREADS", `Pending (${tabCounts.pendingThreads})`],
                  ["DISAPPROVED_THREADS", `Disapproved (${tabCounts.disapprovedThreads})`],
                  ["APPROVED_THREADS", `Approved (${tabCounts.approvedThreads})`],
                ] as const)
              : ([
                  ["UNAPPROVED", `Unapproved (${tabCounts.unapproved})`],
                  ["ALL_PUBLISHED", `Published (${tabCounts.allPublished})`],
                ] as const)),
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

      {isPrivilegedSession && isSubmissionTab(activeTab) ? (
        <div className="border-b border-[#f3edf8] px-4 py-3 sm:px-6">
          <p className="text-sm text-[#6f6285]">
            Showing moderation threads submitted by bloggers and members only.
          </p>
        </div>
      ) : null}

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
          <div className="rounded-2xl border border-dashed border-[#e6daee] p-8 text-center">
            <p className="text-sm text-[#75698b]">
              {loadError ? "Could not load community posts right now." : "No community threads yet."}
            </p>
            <p className="mt-1 text-xs text-[#8e82a1]">
              {loadError ? loadError : "Create your first thread to get the conversation started."}
            </p>
            <button
              onClick={() => router.push("/dashboard/community/new")}
              className="mt-4 inline-flex h-9 items-center gap-1 rounded-full bg-gradient-to-b from-[#c99556] to-[#3a1a56] px-4 text-xs text-white"
            >
              <Plus size={13} />
              New Thread
            </button>
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
                      <span>
                        {post.status === "PUBLISHED"
                          ? "Published"
                          : post.status === "SCHEDULED"
                            ? "Scheduled"
                            : post.status === "UNAPPROVED"
                              ? "Unapproved"
                              : "Draft"}
                      </span>
                      {post.isRecommended ? (
                        <>
                          <span>•</span>
                          <span className="rounded-full border border-[#e4cfb2] bg-[#fff5e7] px-2 py-0.5 text-[#b86d1f]">Recommended</span>
                        </>
                      ) : null}
                      <span>•</span>
                      <span>{formatCommunityDate(post.communityDate)}</span>
                      {post.tags.slice(0, 2).map((tag) => (
                        <span key={tag} className="rounded-full border border-[#e4cfb2] px-2 py-0.5 text-[#ce8a38]">
                          {tag}
                        </span>
                      ))}
                    </div>
                    <p className="mt-1 text-xs text-[#6f6285]">
                      Posted by {post.authorName}
                      {post.authorRole ? ` (${formatRole(post.authorRole)})` : ""}
                      {isSubmissionThread(post)
                        ? post.submissionCount > 1
                          ? ` • Resubmission #${post.submissionCount}`
                          : " • First submission"
                        : ""}
                    </p>
                    {isSubmissionThread(post) && post.lastSubmittedAt ? (
                      <p className="mt-1 text-xs text-[#7d7092]">
                        Submitted {new Date(post.lastSubmittedAt).toLocaleString("en-GB")}
                      </p>
                    ) : null}
                    {isPrivilegedSession && isSubmissionThread(post) && submissionHistory[post.id]?.[0] ? (
                      <p className="mt-1 text-xs text-[#7d7092]">
                        {submissionHistory[post.id][0].submissionNumber > 1 ? "Latest changes: " : "Submission details: "}
                        {submissionHistory[post.id][0].changedFields.join(", ")}
                      </p>
                    ) : null}
                    {(post.status === "UNAPPROVED" || post.status === "DRAFT") && post.moderationReason ? (
                      <p className="mt-2 rounded-lg border border-[#f0d7d2] bg-[#fff2ef] px-3 py-1.5 text-xs text-[#8e2f19]">
                        {post.status === "DRAFT" ? "Disapproval reason" : "Last moderation feedback"}: {post.moderationReason}
                      </p>
                    ) : null}
                  </div>

                  <div className="flex items-center gap-3 pr-2 text-sm text-[#2f2345]">
                    {isPrivilegedSession && post.status === "UNAPPROVED" && isSubmissionThread(post) ? (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => router.push(`/dashboard/community/${post.id}/preview`)}
                          className="rounded-full border border-[#ddd1ea] px-3 py-1 text-xs text-[#3a2a53]"
                        >
                          Preview
                        </button>
                        <button
                          onClick={() => void handleStatusAction(post.id, "PUBLISH")}
                          className="rounded-full border border-[#b8d8c1] bg-[#e9f8ee] px-3 py-1 text-xs text-[#1f6e3c]"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => openDisapprovalModal(post)}
                          className="rounded-full border border-[#efcec7] bg-[#fff1ee] px-3 py-1 text-xs text-[#98331e]"
                        >
                          Disapprove
                        </button>
                      </div>
                    ) : null}

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
                            <MenuAction label="Edit Post" onClick={() => router.push(`/dashboard/community/${post.id}/edit`)} />
                            <MenuAction label="View Post" onClick={() => router.push(`/community/thread/${post.slug}`)} />
                            <MenuAction label="Preview Post" onClick={() => router.push(`/dashboard/community/${post.id}/preview`)} />
                            <MenuAction label="Unpublish Post" onClick={() => void confirmStatusAction(post.id, "UNPUBLISH")} />
                            <MenuAction label="Revert to Draft" onClick={() => void confirmStatusAction(post.id, "REVERT_TO_DRAFT")} />
                            <MenuAction label="Share" onClick={() => void handleShare(post)} />
                            <MenuAction label="View Comments" onClick={() => router.push(`/dashboard/community/comments?communityId=${post.id}`)} />
                            <MenuAction label="Add Tags" onClick={() => router.push(`/dashboard/community/${post.id}/edit#tags`)} />
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
                            <MenuAction label="Edit Post" onClick={() => router.push(`/dashboard/community/${post.id}/edit`)} />
                            <MenuAction label="Preview Post" onClick={() => router.push(`/dashboard/community/${post.id}/preview`)} />
                            {session?.role !== "BLOGGER" ? (
                              <MenuAction label="Publish Post" onClick={() => router.push(`/dashboard/community/${post.id}/publish`)} />
                            ) : null}
                            {post.status === "UNAPPROVED" && (session?.role === "ADMIN" || session?.role === "MODERATOR") ? (
                              <MenuAction label="Disapprove Thread" onClick={() => openDisapprovalModal(post)} />
                            ) : null}
                            <MenuAction label="Add Tags" onClick={() => router.push(`/dashboard/community/${post.id}/edit#tags`)} />
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

      {disapprovalModalPost ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#12091d]/55 p-4"
          onClick={() => closeDisapprovalModal()}
        >
          <div
            className="w-full max-w-md rounded-3xl border border-[var(--avad-border)] bg-[var(--avad-bg-elevated)] p-6 text-[var(--avad-text)] shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <h3 className="font-serif text-3xl text-[var(--avad-text-strong)]">Disapprove Thread</h3>
            <p className="mt-3 text-sm leading-6 text-[var(--avad-text-soft)]">
              Share a clear moderation reason for {disapprovalModalPost.authorName}. This reason will appear in-app and in email.
            </p>

            <label className="mt-4 block text-xs font-semibold uppercase tracking-wide text-[var(--avad-text-soft)]" htmlFor="thread-disapproval-reason">
              Moderation reason
            </label>
            <textarea
              id="thread-disapproval-reason"
              value={disapprovalReason}
              onChange={(event) => setDisapprovalReason(event.target.value)}
              rows={5}
              maxLength={500}
              placeholder="Example: Please revise the title and include scriptural references before resubmitting."
              className="mt-2 w-full rounded-xl border border-[#d8cae8] bg-white px-3 py-2 text-sm text-[#2a1a3f] outline-none focus:border-[#c99556]"
            />
            <div className="mt-1 text-right text-xs text-[#7d7092]">{disapprovalReason.trim().length}/500</div>
            {disapprovalError ? <p className="mt-2 text-xs text-[#b42318]">{disapprovalError}</p> : null}

            <div className="mt-6 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => closeDisapprovalModal()}
                disabled={submittingDisapproval}
                className="rounded-full border border-[#d7cde6] px-4 py-2 text-sm text-[#3a2a53] disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void submitDisapproval()}
                disabled={submittingDisapproval}
                className="rounded-full bg-[#b42318] px-4 py-2 text-sm text-white disabled:opacity-60"
              >
                {submittingDisapproval ? "Submitting..." : "Disapprove Thread"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
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
