"use client";

import { Plus, RefreshCw, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { ActionMenu } from "@/components/ui/action-menu";
import { useConfirmationDialog } from "@/components/ui/confirmation-dialog-provider";
import { formatScriptureDate, type DailyScriptureStatus, type DailyScriptureSummary, type PaginatedResponse } from "@/lib/daily-scripture";
import { getJson, patchJson } from "@/lib/http";
import { cn } from "@/lib/utils";

type TabKey = "ALL" | "DRAFT" | "SCHEDULED" | "PUBLISHED";

const tabMap: Record<TabKey, DailyScriptureStatus | undefined> = {
  ALL: undefined,
  DRAFT: "DRAFT",
  SCHEDULED: "SCHEDULED",
  PUBLISHED: "PUBLISHED",
};

export default function DashboardDailyScripturesPage() {
  const confirmation = useConfirmationDialog();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabKey>("ALL");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [posts, setPosts] = useState<DailyScriptureSummary[]>([]);
  const [pagination, setPagination] = useState<PaginatedResponse<DailyScriptureSummary>["pagination"]>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });
  const [loading, setLoading] = useState(true);
  const [menuOpenFor, setMenuOpenFor] = useState<string | null>(null);
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [schedulePostId, setSchedulePostId] = useState<string | null>(null);
  const [scheduleAtInput, setScheduleAtInput] = useState("");

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

    const data = await getJson<PaginatedResponse<DailyScriptureSummary>>(`/api/dashboard/daily-scriptures?${params.toString()}`);
    setPosts(data.items);
    setPagination(data.pagination);
    setLoading(false);
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      void loadPosts(page, activeTab, search);
    }, 0);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, activeTab]);

  async function refresh() {
    await loadPosts(page, activeTab, search);
  }

  async function handleStatusAction(
    scriptureId: string,
    action: "PUBLISH" | "SCHEDULE" | "UNPUBLISH" | "REVERT_TO_DRAFT",
    scheduledAt?: string,
  ) {
    await patchJson(`/api/dashboard/daily-scriptures/${scriptureId}/status`, {
      action,
      scheduledAt,
    });
    await loadPosts(page, activeTab, search);
  }

  async function handleDelete(scriptureId: string) {
    await fetch(`/api/dashboard/daily-scriptures/${scriptureId}`, { method: "DELETE" });
    await loadPosts(page, activeTab, search);
  }

  async function confirmStatusAction(scriptureId: string, action: "PUBLISH" | "REVERT_TO_DRAFT" | "UNPUBLISH") {
    const actionMeta = {
      PUBLISH: {
        title: "Publish this scripture now?",
        description: "This scripture will become publicly visible.",
        confirmLabel: "Publish",
        destructive: false,
      },
      REVERT_TO_DRAFT: {
        title: "Revert scripture to draft?",
        description: "The scripture will no longer be publicly visible.",
        confirmLabel: "Revert",
        destructive: true,
      },
      UNPUBLISH: {
        title: "Unpublish this scripture?",
        description: "This scripture will be removed from public view.",
        confirmLabel: "Unpublish",
        destructive: true,
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

    await handleStatusAction(scriptureId, action);
  }

  function openScheduleModal(scriptureId: string) {
    setSchedulePostId(scriptureId);
    setScheduleAtInput("");
    setScheduleModalOpen(true);
  }

  function closeScheduleModal() {
    setScheduleModalOpen(false);
    setSchedulePostId(null);
    setScheduleAtInput("");
  }

  async function submitSchedule() {
    if (!schedulePostId) {
      return;
    }

    if (!scheduleAtInput) {
      await confirmation.alert({
        title: "Schedule Required",
        description: "Please select a date and time before scheduling.",
      });
      return;
    }

    const date = new Date(scheduleAtInput);
    if (Number.isNaN(date.getTime())) {
      await confirmation.alert({
        title: "Invalid Date",
        description: "Please provide a valid schedule date/time.",
      });
      return;
    }

    const confirmed = await confirmation.confirm({
      title: "Schedule this scripture?",
      description: `This scripture will be scheduled for ${date.toLocaleString()}.`,
      confirmLabel: "Schedule",
      cancelLabel: "Cancel",
    });
    if (!confirmed) {
      return;
    }

    await handleStatusAction(schedulePostId, "SCHEDULE", date.toISOString());
    closeScheduleModal();
  }

  async function confirmDelete(scriptureId: string) {
    const confirmed = await confirmation.confirm({
      title: "Delete this scripture?",
      description: "This action cannot be undone.",
      confirmLabel: "Delete",
      cancelLabel: "Cancel",
      destructive: true,
    });
    if (!confirmed) {
      return;
    }

    await handleDelete(scriptureId);
  }

  function handleCardClick(event: React.MouseEvent<HTMLElement>, scriptureId: string) {
    const target = event.target as HTMLElement;
    if (target.closest("button, a, input, textarea, select, [role='button']")) {
      return;
    }

    router.push(`/dashboard/daily-scriptures/${scriptureId}/edit`);
  }

  return (
    <section className="rounded-[24px] border border-[#ece3f4] bg-white pb-4">
      <div className="border-b border-[#efe6f6] px-4 py-4 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="font-serif text-[36px] leading-none text-[#2a1a3f]">Daily Scripture</h1>

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
                placeholder="Search by verse or content"
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
              onClick={() => router.push("/dashboard/daily-scriptures/new")}
              className="inline-flex h-9 items-center gap-1 rounded-full bg-gradient-to-b from-[#c99556] to-[#3a1a56] px-3 text-sm text-white"
            >
              <Plus size={14} />
              New Scripture
            </button>
          </div>
        </div>

        <div className="mt-4 flex gap-5 text-sm text-[#3f3156]">
          {([
            ["ALL", `All Scriptures (${counts.all})`],
            ["DRAFT", `Draft (${counts.draft})`],
            ["SCHEDULED", `Scheduled (${counts.scheduled})`],
            ["PUBLISHED", `Published (${counts.published})`],
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

      <div className="space-y-3 px-4 py-3 sm:px-6">
        {loading ? <p className="py-8 text-sm text-[#7a6f89]">Loading scriptures...</p> : null}

        {!loading && posts.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#e6daee] p-8 text-center text-sm text-[#75698b]">
            There are no scriptures here yet.
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
                    "relative cursor-pointer rounded-2xl border border-[#f2e8f8] bg-[#fdf9ff] px-4 py-4 transition hover:border-[#d5a774] hover:shadow-[0_0_0_1px_#3b1f59_inset] dark:border-[#3f3450] dark:bg-[#23182f] dark:hover:border-[#8a6a3f] dark:hover:shadow-[0_0_0_1px_#8a6a3f_inset]",
                    showMenu && "z-30",
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-serif text-[24px] leading-[1.2] text-[#2a1a3f]">{post.verse}</p>
                      <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-[#564a6d]">
                        <span>{post.status === "PUBLISHED" ? "Published" : post.status === "SCHEDULED" ? "Scheduled" : "Draft"}</span>
                        <span>•</span>
                        <span>{formatScriptureDate(post.scriptureDate)}</span>
                      </div>
                    </div>

                    <ActionMenu
                      open={showMenu}
                      onToggle={() => setMenuOpenFor((prev) => (prev === post.id ? null : post.id))}
                      menuClassName="right-2 top-12 w-[210px] border-[#efe6f6] bg-white p-2 text-sm text-[#2c1b42] dark:border-[#3f3450] dark:bg-[#241b31] dark:text-[#f3eafe]"
                    >
                      <MenuAction label="Edit Scripture" onClick={() => router.push(`/dashboard/daily-scriptures/${post.id}/edit`)} />
                      {post.status === "PUBLISHED" ? (
                        <MenuAction label="Unpublish" onClick={() => void confirmStatusAction(post.id, "UNPUBLISH")} />
                      ) : (
                        <MenuAction label="Publish Now" onClick={() => void confirmStatusAction(post.id, "PUBLISH")} />
                      )}
                      {post.status !== "SCHEDULED" ? (
                        <MenuAction
                          label="Schedule"
                          onClick={() => openScheduleModal(post.id)}
                        />
                      ) : (
                        <MenuAction label="Unschedule" onClick={() => void confirmStatusAction(post.id, "UNPUBLISH")} />
                      )}
                      <MenuAction
                        label="Delete"
                        danger
                        onClick={() => {
                          void confirmDelete(post.id);
                        }}
                      />
                    </ActionMenu>
                  </div>

                  <p className="mt-3 line-clamp-3 text-sm leading-6 text-[#4f4265]">{post.excerpt || post.content}</p>

                </article>
              );
            })
          : null}

        {pagination.totalPages > 1 ? (
          <div className="mt-2 flex items-center justify-end gap-2 text-sm">
            <button
              onClick={() => setPage((value) => Math.max(1, value - 1))}
              disabled={page <= 1}
              className="rounded-full border border-[#e4d9ef] px-3 py-1 disabled:opacity-50"
            >
              Prev
            </button>
            <span className="text-[#5e5177]">
              Page {page} of {Math.max(1, pagination.totalPages)}
            </span>
            <button
              onClick={() => setPage((value) => Math.min(pagination.totalPages, value + 1))}
              disabled={page >= pagination.totalPages}
              className="rounded-full border border-[#e4d9ef] px-3 py-1 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        ) : null}
      </div>

      {scheduleModalOpen ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/30 p-4">
          <div className="w-full max-w-[420px] rounded-2xl border border-[#efe6f6] bg-white p-5 shadow-xl">
            <h3 className="font-serif text-[30px] leading-none text-[#2a1a3f]">Schedule Scripture</h3>
            <p className="mt-2 text-sm text-[#675d7c]">Select when this scripture should be published.</p>

            <input
              type="datetime-local"
              value={scheduleAtInput}
              onChange={(event) => setScheduleAtInput(event.target.value)}
              className="mt-4 h-10 w-full rounded-xl border border-[#ddd1ea] px-3 text-sm outline-none"
            />

            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                onClick={closeScheduleModal}
                className="rounded-full border border-[#d8cfeb] px-5 py-1.5 text-sm text-[#3a2a53]"
              >
                Cancel
              </button>
              <button
                onClick={() => void submitSchedule()}
                className="rounded-full bg-gradient-to-b from-[#c99556] to-[#3a1a56] px-5 py-1.5 text-sm text-white"
              >
                Schedule
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}

type MenuActionProps = {
  label: string;
  onClick: () => void;
  danger?: boolean;
};

function MenuAction({ label, onClick, danger = false }: MenuActionProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full items-center rounded-xl px-3 py-2 text-left text-sm hover:bg-[#f8f3fb] dark:hover:bg-[#342744]",
        danger ? "text-[#d73c2c]" : "text-[#2c1b42] dark:text-[#f3eafe]",
      )}
    >
      {label}
    </button>
  );
}
