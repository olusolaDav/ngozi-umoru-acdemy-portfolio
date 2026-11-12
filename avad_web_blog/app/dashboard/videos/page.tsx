"use client";

import { ArrowDownUp, Plus, RefreshCw, Search, Trash2 } from "lucide-react";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

import { deleteJson, getJson, patchJson, postJson } from "@/lib/http";
import { ActionMenu } from "@/components/ui/action-menu";
import { useConfirmationDialog } from "@/components/ui/confirmation-dialog-provider";
import { safeVideoThumbnailSrc, type PaginatedResponse, type VideoPlaylistSummary, type VideoSummary } from "@/lib/video";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type VideoTypeFilter = "AVAD_DAY" | "MEMOIR_FROM_THE_FATHER" | "OTHERS";
type ActiveTab = "ALL" | "RECOMMENDED" | VideoTypeFilter | string;
type PlaylistCreationStep = "closed" | "name" | "select";
type SortBy = "publishedAt" | "createdAt" | "views" | "title";
type SortOrder = "asc" | "desc";

const VIDEO_TYPE_TABS: Array<{ value: VideoTypeFilter; label: string }> = [
  { value: "AVAD_DAY", label: "AVAD Videos" },
  { value: "MEMOIR_FROM_THE_FATHER", label: "Memoir from the Father" },
  { value: "OTHERS", label: "Others" },
];

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

export default function DashboardVideosPage() {
  const confirmation = useConfirmationDialog();
  const [activeTab, setActiveTab] = useState<ActiveTab>("ALL");
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortBy>("publishedAt");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [categoryFilter, setCategoryFilter] = useState("ALL");

  const [videos, setVideos] = useState<VideoSummary[]>([]);
  const [pagination, setPagination] = useState<PaginatedResponse<VideoSummary>["pagination"]>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });
  const [playlists, setPlaylists] = useState<VideoPlaylistSummary[]>([]);
  const [tabCounts, setTabCounts] = useState({
    all: 0,
    recommended: 0,
    avad: 0,
    memoir: 0,
    others: 0,
  });

  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);

  const [selectMode, setSelectMode] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);

  const [playlistCreationStep, setPlaylistCreationStep] = useState<PlaylistCreationStep>("closed");
  const [playlistDraftName, setPlaylistDraftName] = useState("");
  const [creatingPlaylist, setCreatingPlaylist] = useState(false);
  const [playlistPickerOpen, setPlaylistPickerOpen] = useState(false);
  const [playlistPickerVideoIds, setPlaylistPickerVideoIds] = useState<string[]>([]);
  const [playlistPickerValue, setPlaylistPickerValue] = useState("");
  const [playlistAddTarget, setPlaylistAddTarget] = useState<VideoPlaylistSummary | null>(null);
  const [activeCardMenuVideoId, setActiveCardMenuVideoId] = useState<string | null>(null);

  const selectableVideoIds = useMemo(() => {
    if (!playlistAddTarget) {
      return videos.map((video) => video.id);
    }

    return videos.filter((video) => video.playlistId !== playlistAddTarget.id).map((video) => video.id);
  }, [playlistAddTarget, videos]);

  const allChecked =
    selectableVideoIds.length > 0
    && selectableVideoIds.every((videoId) => selected.includes(videoId));

  const selectedAddEligibleIds = useMemo(() => {
    if (!playlistAddTarget) {
      return selected;
    }

    return videos
      .filter((video) => selected.includes(video.id) && video.playlistId !== playlistAddTarget.id)
      .map((video) => video.id);
  }, [playlistAddTarget, selected, videos]);

  const selectedAlreadyInTargetCount = useMemo(() => {
    if (!playlistAddTarget) {
      return 0;
    }

    return videos.filter((video) => selected.includes(video.id) && video.playlistId === playlistAddTarget.id).length;
  }, [playlistAddTarget, selected, videos]);

  const selectedRecommended = useMemo(
    () => videos.filter((video) => selected.includes(video.id) && video.isRecommended).length,
    [selected, videos],
  );

  const pageItems = useMemo(
    () => buildPageItems(pagination.page, Math.max(pagination.totalPages, 1)),
    [pagination.page, pagination.totalPages],
  );

  const activePlaylist = useMemo(() => playlists.find((playlist) => playlist.id === activeTab) ?? null, [activeTab, playlists]);
  const categoryOptions = useMemo(() => {
    const categories = new Set<string>();
    for (const video of videos) {
      if (video.category?.trim()) {
        categories.add(video.category.trim());
      }
    }
    return ["ALL", ...Array.from(categories).sort((a, b) => a.localeCompare(b))];
  }, [videos]);

  async function loadVideos(
    next: {
      page?: number;
      limit?: number;
      tab?: ActiveTab;
      search?: string;
      sortBy?: SortBy;
      sortOrder?: SortOrder;
      categoryFilter?: string;
    } = {},
  ) {
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
      } else if (tab === "AVAD_DAY" || tab === "MEMOIR_FROM_THE_FATHER" || tab === "OTHERS") {
        params.set("videoType", tab);
      } else if (tab !== "ALL") {
        params.set("playlistId", tab);
      }

      if (nextCategoryFilter !== "ALL") {
        params.set("category", nextCategoryFilter);
      }

      const data = await getJson<PaginatedResponse<VideoSummary>>(`/api/dashboard/videos?${params.toString()}`);
      setVideos(data.items);
      setPagination(data.pagination);
      setActiveCardMenuVideoId(null);
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

  async function loadPlaylists() {
    try {
      const data = await getJson<VideoPlaylistSummary[]>("/api/dashboard/videos/playlists");
      setPlaylists(data);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to load playlists.";
      setErrorMessage(message);
      setPlaylists([]);
    }
  }

  async function loadTabCounts() {
    try {
      const [allData, recommendedData, avadData, memoirData, othersData] = await Promise.all([
        getJson<PaginatedResponse<VideoSummary>>("/api/dashboard/videos?page=1&limit=1"),
        getJson<PaginatedResponse<VideoSummary>>("/api/dashboard/videos?page=1&limit=1&recommended=true"),
        getJson<PaginatedResponse<VideoSummary>>("/api/dashboard/videos?page=1&limit=1&videoType=AVAD_DAY"),
        getJson<PaginatedResponse<VideoSummary>>("/api/dashboard/videos?page=1&limit=1&videoType=MEMOIR_FROM_THE_FATHER"),
        getJson<PaginatedResponse<VideoSummary>>("/api/dashboard/videos?page=1&limit=1&videoType=OTHERS"),
      ]);

      setTabCounts({
        all: allData.pagination.total,
        recommended: recommendedData.pagination.total,
        avad: avadData.pagination.total,
        memoir: memoirData.pagination.total,
        others: othersData.pagination.total,
      });
    } catch {
      setTabCounts({
        all: 0,
        recommended: 0,
        avad: 0,
        memoir: 0,
        others: 0,
      });
    }
  }

  async function refresh() {
    await Promise.all([
      loadVideos({ page: pagination.page, limit: pagination.limit }),
      loadPlaylists(),
      loadTabCounts(),
    ]);
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      void loadVideos({ page: 1, limit: 10, tab: "ALL", search: "", sortBy: "publishedAt", sortOrder: "desc" });
      void loadPlaylists();
      void loadTabCounts();
    }, 0);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      const target = event.target as HTMLElement;
      if (!target.closest("[data-card-menu-root='video-card-menu']")) {
        setActiveCardMenuVideoId(null);
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  function toggleSelect(id: string) {
    if (playlistAddTarget) {
      const selectedVideo = videos.find((video) => video.id === id);
      if (selectedVideo?.playlistId === playlistAddTarget.id) {
        return;
      }
    }

    setSelected((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  }

  function handleVideoCardClick(event: React.MouseEvent<HTMLElement>, videoUrl: string) {
    if (selectMode) {
      return;
    }

    const target = event.target as HTMLElement;
    if (target.closest("button, a, input, textarea, select, [role='button']")) {
      return;
    }

    window.open(videoUrl, "_blank", "noopener,noreferrer");
  }

  function resetPlaylistCreationFlow() {
    setPlaylistCreationStep("closed");
    setPlaylistDraftName("");
    setCreatingPlaylist(false);
  }

  function cancelSelectionMode() {
    setSelectMode(false);
    setSelected([]);
    setPlaylistAddTarget(null);
    resetPlaylistCreationFlow();
  }

  async function startAddVideosToPlaylist(playlist: VideoPlaylistSummary) {
    setPlaylistAddTarget(playlist);
    setSelected([]);
    setSelectMode(true);
    setActiveTab("ALL");
    await loadVideos({ page: 1, tab: "ALL" });
  }

  async function addSelectedToTargetPlaylist() {
    if (!playlistAddTarget || !selectedAddEligibleIds.length) {
      await confirmation.alert({
        title: "No eligible videos selected",
        description: "Select videos that are not already in this playlist.",
      });
      return;
    }

    const confirmed = await confirmation.confirm({
      title: `Add selected videos to \"${playlistAddTarget.name}\"?`,
      description: `This will add ${selectedAddEligibleIds.length} selected video${selectedAddEligibleIds.length === 1 ? "" : "s"} to the playlist.`,
      confirmLabel: "Add Videos",
      cancelLabel: "Cancel",
    });
    if (!confirmed) {
      return;
    }

    const moved = await handleMoveToPlaylist(selectedAddEligibleIds, playlistAddTarget.id);
    if (!moved) {
      return;
    }

    const targetId = playlistAddTarget.id;
    setPlaylistAddTarget(null);
    setSelectMode(false);
    setSelected([]);
    setActiveTab(targetId);
    await loadVideos({ page: 1, tab: targetId });
  }

  function openPlaylistPicker(videoIds: string[], currentPlaylistId?: string | null) {
    setPlaylistPickerVideoIds(videoIds);
    setPlaylistPickerValue(currentPlaylistId ?? "");
    setPlaylistPickerOpen(true);
  }

  function closePlaylistPicker() {
    setPlaylistPickerOpen(false);
    setPlaylistPickerVideoIds([]);
    setPlaylistPickerValue("");
  }

  function toggleCardMenu(videoId: string) {
    setActiveCardMenuVideoId((current) => (current === videoId ? null : videoId));
  }

  async function submitPlaylistPicker() {
    if (!playlistPickerVideoIds.length) {
      return;
    }

    if (!playlistPickerValue) {
      await confirmation.alert({
        title: "Select a playlist",
        description: "Choose an existing playlist to continue.",
      });
      return;
    }

    const moved = await handleMoveToPlaylist(playlistPickerVideoIds, playlistPickerValue);
    if (moved) {
      closePlaylistPicker();
    }
  }

  async function handleSyncYoutube() {
    setSyncing(true);
    setErrorMessage(null);

    try {
      await postJson("/api/dashboard/videos/sync-youtube", { maxResults: 50 });
      await loadVideos({ page: 1 });
      await loadPlaylists();
      await loadTabCounts();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to sync YouTube videos.";
      setErrorMessage(message);
    } finally {
      setSyncing(false);
    }
  }

  async function handleBulkRecommend() {
    if (!selected.length) {
      return;
    }

    const confirmed = await confirmation.confirm({
      title: "Recommend selected videos?",
      description: "All selected videos will be marked as recommended.",
      confirmLabel: "Recommend",
      cancelLabel: "Cancel",
    });
    if (!confirmed) {
      return;
    }

    try {
      await patchJson("/api/dashboard/videos/recommend/bulk", {
        videoIds: selected,
        recommended: true,
      });

      setSelected([]);
      await loadVideos();
      await loadTabCounts();
      toast.success("Selected videos added to recommended videos.");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Failed to recommend selected videos.");
    }
  }

  async function handleBulkUnrecommend() {
    if (!selected.length) {
      return;
    }

    const confirmed = await confirmation.confirm({
      title: "Remove recommendation from selected videos?",
      description: "Selected videos will no longer appear in recommended sections.",
      confirmLabel: "Remove",
      cancelLabel: "Cancel",
      destructive: true,
    });
    if (!confirmed) {
      return;
    }

    try {
      await patchJson("/api/dashboard/videos/recommend/bulk", {
        videoIds: selected,
        recommended: false,
      });

      setSelected([]);
      await loadVideos();
      await loadTabCounts();
      toast.success("Selected videos removed from recommended videos.");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Failed to remove selected recommendations.");
    }
  }

  async function handleMoveToPlaylist(videoIds: string[], playlistId: string | null): Promise<boolean> {
    if (!videoIds.length) {
      return false;
    }

    if (playlistId === null) {
      const ok = await confirmation.confirm({
        title: "Remove from playlist?",
        description: "Selected videos will remain in All Videos and only be removed from the current playlist.",
        confirmLabel: "Remove",
        cancelLabel: "Cancel",
        destructive: true,
      });
      if (!ok) {
        return false;
      }
    }

    try {
      await patchJson("/api/dashboard/videos/playlist", {
        videoIds,
        playlistId,
      });

      setSelected([]);
      await loadVideos();
      await loadPlaylists();
      await loadTabCounts();
      toast.success(playlistId ? "Videos added to playlist." : "Videos removed from playlist.");
      return true;
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Failed to update video playlist.");
      return false;
    }
  }

  async function handleCreatePlaylistFromSelection() {
    const trimmedName = playlistDraftName.trim();
    if (!trimmedName || !selected.length) {
      return;
    }

    setCreatingPlaylist(true);
    setErrorMessage(null);

    try {
      const playlist = await postJson<VideoPlaylistSummary>("/api/dashboard/videos/playlists", { name: trimmedName });

      await patchJson("/api/dashboard/videos/playlist", {
        videoIds: selected,
        playlistId: playlist.id,
      });

      await loadPlaylists();
      setActiveTab(playlist.id);
      setSearchInput("");
      setSearchQuery("");
      setSelected([]);
      setSelectMode(false);
      resetPlaylistCreationFlow();
      await loadVideos({ page: 1, tab: playlist.id, search: "" });
      await loadTabCounts();
      toast.success(`Playlist "${playlist.name}" created.`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to create playlist.";
      setErrorMessage(message);
    } finally {
      setCreatingPlaylist(false);
    }
  }

  async function handleDeleteActivePlaylist() {
    if (!activePlaylist) {
      return;
    }

    const confirmed = await confirmation.confirm({
      title: `Delete playlist \"${activePlaylist.name}\"?`,
      description: "Videos will remain in All Videos and only be removed from this playlist.",
      confirmLabel: "Delete Playlist",
      cancelLabel: "Cancel",
      destructive: true,
    });
    if (!confirmed) {
      return;
    }

    try {
      await deleteJson(`/api/dashboard/videos/playlists/${activePlaylist.id}`);

      setActiveTab("ALL");
      setSelected([]);
      await loadPlaylists();
      await loadVideos({ page: 1, tab: "ALL" });
      await loadTabCounts();
      toast.success(`Playlist "${activePlaylist.name}" deleted.`);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Failed to delete playlist.");
    }
  }

  async function confirmToggleRecommendation(video: VideoSummary) {
    const recommended = !video.isRecommended;
    const confirmed = await confirmation.confirm({
      title: recommended ? "Recommend this video?" : "Remove recommendation?",
      description: recommended
        ? "This video will appear in recommended sections."
        : "This video will no longer be marked as recommended.",
      confirmLabel: recommended ? "Recommend" : "Remove",
      cancelLabel: "Cancel",
      destructive: !recommended,
    });
    if (!confirmed) {
      return;
    }

    try {
      await patchJson(`/api/dashboard/videos/${video.id}/recommend`, { recommended });
      setVideos((current) => current.map((item) => item.id === video.id ? { ...item, isRecommended: recommended } : item));
      setTabCounts((current) => ({
        ...current,
        recommended: Math.max(0, current.recommended + (recommended ? 1 : -1)),
      }));
      toast.success(recommended ? "Video added to recommended videos." : "Video removed from recommended videos.");
      await loadVideos();
      await loadTabCounts();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to update video recommendation.";
      setErrorMessage(message);
    }
  }

  const selectedTabName =
    activeTab === "ALL" ? "All Videos" : activeTab === "RECOMMENDED" ? "Recommended" : activePlaylist?.name ?? "Playlist";

  return (
    <section className="rounded-[24px] border border-[#ece3f4] bg-white pb-4">
      <div className="border-b border-[#efe6f6] px-4 py-4 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="font-serif text-[36px] leading-none text-[#2a1a3f]">Videos</h1>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative min-w-0 flex-1 basis-full sm:basis-auto sm:min-w-[280px] lg:min-w-[340px]">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7a6f89]" />
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
                placeholder="Search by title or words"
                className="h-9 w-full rounded-full border border-[#e9dff1] pl-9 pr-3 text-sm outline-none"
              />
            </div>

            <button
              onClick={() => {
                const nextSearch = searchInput.trim();
                setSearchQuery(nextSearch);
                void loadVideos({ page: 1, search: nextSearch });
              }}
              className="h-9 rounded-full border border-[#ece3f4] px-3 text-sm text-[#3a2a53]"
            >
              Search
            </button>

            <button
              onClick={() => void refresh()}
              className="inline-flex h-9 items-center gap-1 rounded-full border border-[#ece3f4] px-3 text-sm text-[#3a2a53]"
            >
              <RefreshCw size={14} />
              Refresh
            </button>

            <button
              onClick={() => {
                if (selectMode) {
                  cancelSelectionMode();
                  return;
                }
                setSelectMode(true);
                setSelected([]);
              }}
              className={cn(
                "h-9 rounded-full border px-3 text-sm",
                selectMode ? "border-[#c58d42] bg-[#d39a52] text-white" : "border-[#ece3f4] text-[#3a2a53]",
              )}
            >
              {selectMode ? "Deselect" : "Select"}
            </button>

            <button
              onClick={() => {
                setPlaylistCreationStep("name");
                setPlaylistDraftName("");
              }}
              className="inline-flex h-9 items-center gap-1 rounded-full bg-gradient-to-b from-[#c99556] to-[#3a1a56] px-3 text-sm text-white"
            >
              <Plus size={14} />
              New Playlist
            </button>

            <button
              onClick={() => void handleSyncYoutube()}
              disabled={syncing}
              className="h-9 rounded-full border border-[#ece3f4] px-3 text-sm text-[#3a2a53] disabled:opacity-50"
            >
              {syncing ? "Syncing..." : "Sync YouTube"}
            </button>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <label className="flex items-center gap-1 rounded-full border border-[#ece3f4] px-2 py-1 text-xs text-[#4e4262]">
            <ArrowDownUp size={13} />
            <span>Sort</span>
            <select
              value={sortBy}
              onChange={(event) => {
                const nextSortBy = event.target.value as SortBy;
                setSortBy(nextSortBy);
                void loadVideos({ page: 1, sortBy: nextSortBy });
              }}
              className="bg-transparent pr-1 outline-none"
            >
              <option value="publishedAt">Published</option>
              <option value="createdAt">Imported</option>
              <option value="views">Views</option>
              <option value="title">Title</option>
            </select>
            <select
              value={sortOrder}
              onChange={(event) => {
                const nextSortOrder = event.target.value as SortOrder;
                setSortOrder(nextSortOrder);
                void loadVideos({ page: 1, sortOrder: nextSortOrder });
              }}
              className="bg-transparent pr-1 outline-none"
            >
              <option value="desc">Desc</option>
              <option value="asc">Asc</option>
            </select>
          </label>

          <label className="flex items-center gap-2 rounded-full border border-[#ece3f4] px-2 py-1 text-xs text-[#4e4262]">
            <span>Filter</span>
            <select
              value={categoryFilter}
              onChange={(event) => {
                const nextCategoryFilter = event.target.value;
                setCategoryFilter(nextCategoryFilter);
                void loadVideos({ page: 1, categoryFilter: nextCategoryFilter });
              }}
              className="bg-transparent pr-1 outline-none"
            >
              {categoryOptions.map((option) => (
                <option key={option} value={option}>
                  {option === "ALL" ? "All Categories" : option}
                </option>
              ))}
            </select>
          </label>

          {activePlaylist ? (
            <button
              onClick={() => void startAddVideosToPlaylist(activePlaylist)}
              className="inline-flex h-8 items-center gap-1 rounded-full border border-[#e3d5f1] px-3 text-xs text-[#3a2a53]"
            >
              <Plus size={13} />
              Add video(s)
              <span className="rounded-full border border-[#e3d5f1] px-1.5 py-0.5 text-[10px] leading-none text-[#5f5278]">
                {activePlaylist.videosCount}
              </span>
            </button>
          ) : null}

          {activePlaylist ? (
            <button
              onClick={() => void handleDeleteActivePlaylist()}
              className="inline-flex h-8 items-center gap-1 rounded-full border border-[#efc9c9] px-3 text-xs text-[#9f3535]"
            >
              <Trash2 size={13} />
              Delete Playlist
            </button>
          ) : null}
        </div>

        <div className="mt-4 flex flex-wrap gap-5 text-sm text-[#3f3156]">
          <button
            onClick={() => {
              setPlaylistAddTarget(null);
              setActiveTab("ALL");
              setSelected([]);
              void loadVideos({ page: 1, tab: "ALL" });
            }}
            className={cn(
              "border-b pb-2",
              activeTab === "ALL" ? "border-[#8a7f99] text-[#26173a]" : "border-transparent text-[#5f5278]",
            )}
          >
            All Videos ({tabCounts.all})
          </button>

          {VIDEO_TYPE_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => {
                setPlaylistAddTarget(null);
                setActiveTab(tab.value);
                setSelected([]);
                void loadVideos({ page: 1, tab: tab.value });
              }}
              className={cn(
                "border-b pb-2",
                activeTab === tab.value ? "border-[#8a7f99] text-[#26173a]" : "border-transparent text-[#5f5278]",
              )}
            >
              {tab.label} ({tab.value === "AVAD_DAY" ? tabCounts.avad : tab.value === "MEMOIR_FROM_THE_FATHER" ? tabCounts.memoir : tabCounts.others})
            </button>
          ))}

          <button
            onClick={() => {
              setPlaylistAddTarget(null);
              setActiveTab("RECOMMENDED");
              setSelected([]);
              void loadVideos({ page: 1, tab: "RECOMMENDED" });
            }}
            className={cn(
              "border-b pb-2",
              activeTab === "RECOMMENDED" ? "border-[#8a7f99] text-[#26173a]" : "border-transparent text-[#5f5278]",
            )}
          >
            Recommended ({tabCounts.recommended})
          </button>

          {playlists.map((playlist) => (
            <button
              key={playlist.id}
              onClick={() => {
                setPlaylistAddTarget(null);
                setActiveTab(playlist.id);
                setSelected([]);
                void loadVideos({ page: 1, tab: playlist.id });
              }}
              className={cn(
                "border-b pb-2",
                activeTab === playlist.id ? "border-[#8a7f99] text-[#26173a]" : "border-transparent text-[#5f5278]",
              )}
            >
              {playlist.name} ({playlist.videosCount})
            </button>
          ))}
        </div>
      </div>

      {selectMode ? (
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#f3edf8] px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSelected(allChecked ? [] : selectableVideoIds)}
              className={cn(
                "grid size-5 place-items-center rounded-md border text-xs",
                allChecked ? "border-[#d39a52] bg-[#d39a52] text-white" : "border-[#ddd1ea] text-transparent",
              )}
            >
              ✓
            </button>
            <span className="text-sm text-[#35254b]">Select All</span>
            <span className="text-xs text-[#6d5f83]">{selected.length} selected</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {playlistCreationStep === "select" ? (
              <button
                onClick={() => void handleCreatePlaylistFromSelection()}
                disabled={creatingPlaylist || selected.length === 0}
                className="rounded-full bg-gradient-to-b from-[#c99556] to-[#3a1a56] px-4 py-1.5 text-xs text-white disabled:opacity-50"
              >
                {creatingPlaylist ? "Creating..." : "Create Playlist"}
              </button>
            ) : (
              <>
                {playlistAddTarget ? (
                  <>
                    <button
                      onClick={() => void addSelectedToTargetPlaylist()}
                      disabled={!selectedAddEligibleIds.length}
                      className="rounded-full bg-gradient-to-b from-[#c99556] to-[#3a1a56] px-3 py-1 text-xs text-white disabled:opacity-50"
                    >
                      Add Selected to {playlistAddTarget.name}
                    </button>
                    <button
                      onClick={() => {
                        setPlaylistAddTarget(null);
                        setSelected([]);
                      }}
                      className="rounded-full border border-[#d8cfeb] px-3 py-1 text-xs text-[#3a2a53]"
                    >
                      Exit Add Mode
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => openPlaylistPicker(selected)}
                      disabled={!selected.length}
                      className="rounded-full border border-[#d8cfeb] px-3 py-1 text-xs text-[#3a2a53] disabled:opacity-50"
                    >
                      Add to Playlist
                    </button>

                    <button
                      onClick={() => void handleMoveToPlaylist(selected, null)}
                      disabled={!selected.length}
                      className="rounded-full border border-[#d8cfeb] px-3 py-1 text-xs text-[#3a2a53] disabled:opacity-50"
                    >
                      Remove From Playlist
                    </button>

                    {selected.length > 0 ? (
                      <button
                        onClick={() => void handleBulkRecommend()}
                        className="rounded-full border border-[#d8cfeb] px-3 py-1 text-xs text-[#3a2a53]"
                      >
                        Recommend
                      </button>
                    ) : null}

                    {selected.length > 0 && selectedRecommended > 0 ? (
                      <button
                        onClick={() => void handleBulkUnrecommend()}
                        className="rounded-full border border-[#d8cfeb] px-3 py-1 text-xs text-[#3a2a53]"
                      >
                        Remove Recommendation
                      </button>
                    ) : null}
                  </>
                )}
              </>
            )}
          </div>

          {playlistAddTarget ? (
            <div className="w-full text-xs text-[#6d5f83]">
              <p>Add mode: selecting videos for {playlistAddTarget.name}. Choose videos and click Add Selected to {playlistAddTarget.name}.</p>
              {selectedAlreadyInTargetCount > 0 ? (
                <p className="mt-1 text-[#8b4d4d]">{selectedAlreadyInTargetCount} selected video(s) are already in this playlist and will be skipped.</p>
              ) : null}
            </div>
          ) : null}
        </div>
      ) : null}

      <div className="px-4 py-4 sm:px-6">
        {loading ? <p className="py-8 text-sm text-[#7a6f89]">Loading videos...</p> : null}

        {errorMessage ? (
          <div className="mb-4 rounded-xl border border-[#f3d8cf] bg-[#fff2ee] px-3 py-2 text-sm text-[#9a4127]">
            {errorMessage}
          </div>
        ) : null}

        {!loading && videos.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#e6daee] p-8 text-center text-sm text-[#75698b]">
            No videos found for {selectedTabName}. Click Sync YouTube to import channel videos.
          </div>
        ) : null}

        {!loading && videos.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {videos.map((video) => (
              <article
                key={video.id}
                onClick={(event) => handleVideoCardClick(event, video.youtubeUrl)}
                className={cn(
                  "relative rounded-3xl border border-[#f2e8f8] bg-[#fdf9ff] p-3 transition",
                  "hover:border-[#d5a774] hover:shadow-[0_0_0_1px_#3b1f59_inset]",
                  "dark:border-[#3f3450] dark:bg-[#23182f] dark:hover:border-[#8a6a3f] dark:hover:shadow-[0_0_0_1px_#8a6a3f_inset]",
                  !selectMode && "cursor-pointer",
                  activeCardMenuVideoId === video.id && "z-30",
                )}
              >
                {selectMode ? (
                  (() => {
                    const alreadyInTarget = Boolean(playlistAddTarget && video.playlistId === playlistAddTarget.id);
                    return (
                  <button
                    onClick={() => toggleSelect(video.id)}
                    className={cn(
                      "absolute right-4 top-4 z-20 grid size-6 place-items-center rounded-md border text-xs",
                      alreadyInTarget
                        ? "cursor-not-allowed border-[#e2d8ee] bg-[#f2edf8] text-[#8f809e]"
                        : selected.includes(video.id)
                        ? "border-[#d39a52] bg-[#d39a52] text-white"
                        : "border-[#e2d8ee] bg-white text-transparent",
                    )}
                    disabled={alreadyInTarget}
                    title={alreadyInTarget ? "Already in selected playlist" : "Select video"}
                  >
                    {alreadyInTarget ? "•" : "✓"}
                  </button>
                    );
                  })()
                ) : null}

                <div className="relative aspect-video overflow-hidden rounded-xl">
                  <Image src={safeVideoThumbnailSrc(video.thumbnailUrl)} alt={video.title} fill className="object-cover" />
                </div>

                <h3 className="mt-3 line-clamp-3 font-serif text-lg leading-[1.12] text-[#2a1a3f] md:text-[19px]">{video.title}</h3>
                <p className="mt-2 text-xs text-[#564a6d]">
                  {video.views ?? 0} views • {new Date(video.publishedAt).toLocaleDateString("en-GB")}
                </p>

                <div className="mt-3 flex items-center justify-between gap-2">
                  <div className="flex flex-wrap gap-2">
                    {video.playlist?.name ? (
                      <span className="rounded-full border border-[#e4cfb2] bg-[#fff5e7] px-2 py-0.5 text-xs text-[#b86d1f]">{video.playlist.name}</span>
                    ) : null}
                    {video.isRecommended ? (
                      <span className="rounded-full border border-[#e4cfb2] bg-[#fff5e7] px-2 py-0.5 text-xs text-[#b86d1f]">Recommended</span>
                    ) : null}
                  </div>

                  {!selectMode ? (
                    <ActionMenu
                      open={activeCardMenuVideoId === video.id}
                      onToggle={() => toggleCardMenu(video.id)}
                      onClick={(event) => event.stopPropagation()}
                      menuRootId="video-card-menu"
                      triggerLabel="Card options"
                      containerClassName="" 
                      menuClassName="min-w-[210px] border-[#e8dbf2] bg-white p-1.5"
                    >
                      <button
                        onClick={() => {
                          openPlaylistPicker([video.id], video.playlistId);
                          setActiveCardMenuVideoId(null);
                        }}
                        className="w-full rounded-xl px-3 py-2 text-left text-xs text-[#3a2a53] hover:bg-[#f8f1ff]"
                      >
                        {video.playlistId ? "Change Playlist" : "Add to Playlist"}
                      </button>

                      {video.playlistId ? (
                        <button
                          onClick={() => {
                            void handleMoveToPlaylist([video.id], null);
                            setActiveCardMenuVideoId(null);
                          }}
                          className="w-full rounded-xl px-3 py-2 text-left text-xs text-[#3a2a53] hover:bg-[#f8f1ff]"
                        >
                          Remove from Playlist
                        </button>
                      ) : null}

                      <button
                        onClick={() => {
                          void confirmToggleRecommendation(video);
                          setActiveCardMenuVideoId(null);
                        }}
                        className="w-full rounded-xl px-3 py-2 text-left text-xs text-[#3a2a53] hover:bg-[#f8f1ff]"
                      >
                        {video.isRecommended ? "Remove Recommendation" : "Recommend Video"}
                      </button>
                    </ActionMenu>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        ) : null}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#efe6f6] px-4 py-4 text-sm sm:px-6">
        <p className="text-[#4e4262]">
          Showing {videos.length} post(s) of {pagination.total}
        </p>

        <div className="flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-2 text-xs text-[#675a7c]">
            Per page
            <select
              value={pagination.limit}
              onChange={(event) => {
                const nextLimit = Number(event.target.value);
                void loadVideos({ page: 1, limit: nextLimit });
              }}
              className="rounded-full border border-[#ece3f4] bg-white px-3 py-1 text-xs text-[#35254b] outline-none"
            >
              {PAGE_SIZE_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>

          <div className="flex items-center gap-2 text-xs text-[#3a2a53]">
            <button
              onClick={() => void loadVideos({ page: Math.max(1, pagination.page - 1) })}
              disabled={pagination.page <= 1}
              className="rounded-full px-2 py-1 text-[#7b6d90] disabled:opacity-40"
            >
              Back
            </button>

            {pageItems.map((pageNumber, index) => {
              const previous = pageItems[index - 1];
              const showGap = typeof previous === "number" && pageNumber - previous > 1;
              return (
                <div key={pageNumber} className="flex items-center gap-2">
                  {showGap ? <span className="text-[#9d90af]">...</span> : null}
                  <button
                    onClick={() => void loadVideos({ page: pageNumber })}
                    className={cn(
                      "grid size-6 place-items-center rounded-full",
                      pagination.page === pageNumber
                        ? "bg-gradient-to-b from-[#c99556] to-[#3a1a56] text-white"
                        : "text-[#3a2a53]",
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
              className="rounded-full px-2 py-1 text-[#3a2a53] disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {playlistCreationStep === "name" ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/25 p-4">
          <div className="w-full max-w-[420px] rounded-2xl border border-[#efe6f6] bg-white p-5 shadow-xl">
            <h2 className="font-serif text-4xl text-[#2a1a3f]">New Playlist</h2>
            <input
              value={playlistDraftName}
              onChange={(event) => setPlaylistDraftName(event.target.value)}
              placeholder="Playlist Name"
              className="mt-4 h-10 w-full rounded-xl border border-[#ddd1ea] px-3 text-sm outline-none"
            />
            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                onClick={() => resetPlaylistCreationFlow()}
                className="rounded-full border border-[#d8cfeb] px-5 py-1.5 text-sm text-[#3a2a53]"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const trimmed = playlistDraftName.trim();
                  if (!trimmed) {
                    return;
                  }
                  setPlaylistDraftName(trimmed);
                  setPlaylistCreationStep("select");
                  setSelectMode(true);
                  setSelected([]);
                }}
                className="rounded-full bg-gradient-to-b from-[#c99556] to-[#3a1a56] px-5 py-1.5 text-sm text-white"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {playlistPickerOpen ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/25 p-4">
          <div className="w-full max-w-[420px] rounded-2xl border border-[#efe6f6] bg-white p-5 shadow-xl">
            <h2 className="font-serif text-4xl text-[#2a1a3f]">Add To Playlist</h2>
            <p className="mt-2 text-sm text-[#6b5d82]">
              Choose an existing playlist for {playlistPickerVideoIds.length} selected video{playlistPickerVideoIds.length === 1 ? "" : "s"}.
            </p>

            <select
              value={playlistPickerValue}
              onChange={(event) => setPlaylistPickerValue(event.target.value)}
              className="mt-4 h-10 w-full rounded-xl border border-[#ddd1ea] px-3 text-sm text-[#3a2a53] outline-none"
            >
              <option value="">Select playlist...</option>
              {playlists.map((playlist) => (
                <option key={playlist.id} value={playlist.id}>
                  {playlist.name}
                </option>
              ))}
            </select>

            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                onClick={closePlaylistPicker}
                className="rounded-full border border-[#d8cfeb] px-5 py-1.5 text-sm text-[#3a2a53]"
              >
                Cancel
              </button>
              <button
                onClick={() => void submitPlaylistPicker()}
                className="rounded-full bg-gradient-to-b from-[#c99556] to-[#3a1a56] px-5 py-1.5 text-sm text-white"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
