"use client";

import { CheckCheck, RefreshCw, Trash2, X } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

import { deleteJson, getJson } from "@/lib/http";
import {
  NOTIFICATION_TABS,
  type NotificationItem,
  type NotificationsListResponse,
} from "@/lib/notification";
import { cn } from "@/lib/utils";
import {
  notificationUnreadCountKey,
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotificationUnreadCount,
} from "@/lib/notification-queries";

type NotificationsPageProps = {
  title?: string;
};

function formatDate(value: string) {
  const date = new Date(value);
  return date.toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function NotificationsPage({ title = "Notifications" }: NotificationsPageProps) {
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<(typeof NOTIFICATION_TABS)[number]["key"]>("ALL");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectMode, setSelectMode] = useState(false);
  const router = useRouter();
  const { data: sharedUnread = 0 } = useNotificationUnreadCount();
  const markReadMutation = useMarkNotificationRead();
  const markAllReadMutation = useMarkAllNotificationsRead();
  const queryClient = useQueryClient();

  const pageSize = 24;

  const selectedCount = selectedIds.length;

  const loadNotifications = useCallback(async () => {
    setLoading(true);

    try {
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("limit", String(pageSize));

      if (activeTab !== "ALL") {
        params.set("category", activeTab);
      }

      const data = await getJson<NotificationsListResponse>(`/api/notifications?${params.toString()}`);
      setItems(data.items);
      setTotal(data.pagination.total);
      setSelectedIds([]);
    } catch {
      setItems([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [activeTab, page, pageSize]);

  useEffect(() => {
    queueMicrotask(() => void loadNotifications());
  }, [loadNotifications]);

  async function markAllRead() {
    await markAllReadMutation.mutateAsync();
    setItems((current) => current.map((item) => ({ ...item, isRead: true })));
  }

  async function markOneRead(itemId: string) {
    await markReadMutation.mutateAsync(itemId);
    setItems((current) => current.map((item) => (item.id === itemId ? { ...item, isRead: true } : item)));
  }

  async function deleteSelected() {
    const ids = [...selectedIds];
    await Promise.all(ids.map((id) => deleteJson(`/api/notifications/${id}`)));
    await queryClient.invalidateQueries({ queryKey: notificationUnreadCountKey });
    await loadNotifications();
  }

  const canSelectAll = useMemo(() => items.length > 0, [items.length]);
  const allSelected = canSelectAll && selectedIds.length === items.length;

  return (
    <section className="rounded-[28px] border border-[var(--avad-border)] bg-[var(--avad-bg-elevated)]">
      <div className="flex items-center justify-between gap-3 border-b border-[var(--avad-border)] px-5 py-4 sm:px-6">
        <h1 className="font-serif text-4xl text-[var(--avad-text-strong)]">{title}</h1>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => void loadNotifications()}
            className="inline-flex items-center gap-1 rounded-full border border-[var(--avad-border)] px-3 py-1.5 text-sm text-[var(--avad-text-soft)]"
          >
            <RefreshCw size={14} />
            Refresh
          </button>

          <button
            type="button"
            onClick={() => setSelectMode((value) => !value)}
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-sm",
              selectMode
                ? "bg-[#d39a52] text-[#251337]"
                : "border border-[var(--avad-border)] text-[var(--avad-text-soft)]",
            )}
          >
            {selectMode ? <X size={14} /> : null}
            {selectMode ? "Cancel" : "Select"}
          </button>
          <button
            type="button"
            onClick={() => void markAllRead()}
            className="inline-flex items-center gap-1 rounded-full border border-[var(--avad-border)] px-3 py-1.5 text-sm text-[var(--avad-text-soft)]"
          >
            <CheckCheck size={14} />
            Mark all read
          </button>
          <button
            type="button"
            onClick={() => void deleteSelected()}
            disabled={!selectedCount}
            className="inline-flex items-center gap-1 rounded-full bg-[#ef2b13] px-3 py-1.5 text-sm text-white disabled:opacity-50"
          >
            <Trash2 size={14} />
            Delete
          </button>
        </div>
      </div>

      <div className="border-b border-[var(--avad-border)] px-5 pt-3 sm:px-6">
        <div className="flex flex-wrap gap-4 text-sm">
          {NOTIFICATION_TABS.map((tab) => {
            const active = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => {
                  setActiveTab(tab.key);
                  setPage(1);
                }}
                className={cn(
                  "cursor-pointer border-b-2 pb-2 text-[var(--avad-text-soft)] transition",
                  active ? "border-[#8b81ad] text-[var(--avad-text-strong)]" : "border-transparent",
                )}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {selectMode ? (
        <div className="flex items-center justify-between border-b border-[var(--avad-border)] px-5 py-3 sm:px-6">
          <label className="inline-flex items-center gap-2 text-sm text-[var(--avad-text)]">
            <input
              type="checkbox"
              checked={allSelected}
              onChange={(event) => {
                if (event.target.checked) {
                  setSelectedIds(items.map((item) => item.id));
                } else {
                  setSelectedIds([]);
                }
              }}
              className="size-5 rounded border border-[var(--avad-border)]"
            />
            Select All
          </label>
          <p className="text-xs text-[var(--avad-text-soft)]">{selectedCount} selected</p>
        </div>
      ) : null}

      <div className="min-h-[420px] px-5 py-3 sm:px-6">
        {loading ? <p className="text-sm text-[var(--avad-text-soft)]">Loading notifications...</p> : null}

        {!loading && !items.length ? (
          <div className="grid min-h-[340px] place-items-center text-center">
            <div>
              <p className="text-2xl font-semibold text-[var(--avad-text-strong)]">There are no notifications here yet.</p>
              <p className="mt-2 text-[var(--avad-text-soft)]">You will be notified when activity starts.</p>
            </div>
          </div>
        ) : null}

        {!loading && items.length
          ? items.map((item) => (
              <div key={item.id} className="border-b border-[var(--avad-border)] py-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-start gap-3">
                    {selectMode ? (
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(item.id)}
                        onChange={(event) => {
                          if (event.target.checked) {
                            setSelectedIds((current) => [...current, item.id]);
                          } else {
                            setSelectedIds((current) => current.filter((id) => id !== item.id));
                          }
                        }}
                        className="mt-1 size-5 rounded border border-[var(--avad-border)]"
                      />
                    ) : null}

                    <div className="min-w-0">
                      <p className="text-xl text-[var(--avad-text-strong)]">
                        <span className="font-semibold">{item.title}</span> {item.message}
                      </p>
                      <p className="mt-2 text-xs text-[var(--avad-text-soft)]">{formatDate(item.createdAt)}</p>
                    </div>
                  </div>

                  <div className="shrink-0">
                    {item.actionUrl ? (
                      <Link
                        href={item.actionUrl}
                        onClick={(event) => {
                          if (!item.isRead) {
                            event.preventDefault();
                            void markOneRead(item.id).then(() => router.push(item.actionUrl as string));
                          }
                        }}
                        className="text-sm text-[var(--avad-text-soft)] underline underline-offset-2"
                      >
                        View
                      </Link>
                    ) : null}
                    {!item.isRead ? (
                      <button
                        type="button"
                        onClick={() => void markOneRead(item.id)}
                        className="ml-4 text-xs font-semibold text-[var(--avad-text-soft)]"
                      >
                        Mark read
                      </button>
                    ) : null}
                  </div>
                </div>
              </div>
            ))
          : null}
      </div>

      <div className="flex items-center justify-between border-t border-[var(--avad-border)] px-5 py-4 text-sm sm:px-6">
        <p className="font-semibold text-[var(--avad-text)]">Showing {items.length} notification(s) of {total}</p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setPage((current) => Math.max(1, current - 1))}
            disabled={page <= 1}
            className="rounded-full border border-[var(--avad-border)] px-3 py-1.5 disabled:opacity-50"
          >
            Prev
          </button>
          <span className="text-xs text-[var(--avad-text-soft)]">Page {page}</span>
          <button
            type="button"
            onClick={() => setPage((current) => current + 1)}
            disabled={page * pageSize >= total}
            className="rounded-full border border-[var(--avad-border)] px-3 py-1.5 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>

      {sharedUnread > 0 ? (
        <div className="fixed bottom-4 left-1/2 z-40 max-w-[calc(100vw-2rem)] -translate-x-1/2 rounded-full bg-[#2f1248] px-4 py-2 text-center text-sm font-semibold text-white shadow-xl sm:bottom-7 sm:px-5">
          {sharedUnread} unread notification(s)
        </div>
      ) : null}
    </section>
  );
}
