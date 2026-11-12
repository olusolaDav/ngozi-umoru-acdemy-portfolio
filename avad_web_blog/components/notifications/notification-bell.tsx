"use client";

import { Bell, CheckCheck } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { getJson } from "@/lib/http";
import { useMarkAllNotificationsRead, useMarkNotificationRead, useNotificationUnreadCount } from "@/lib/notification-queries";
import { cn } from "@/lib/utils";
import { type NotificationsRecentResponse } from "@/lib/notification";

type NotificationBellProps = {
  viewAllHref: string;
  className?: string;
};

function formatDate(value: string) {
  const date = new Date(value);
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function NotificationBell({ viewAllHref, className }: NotificationBellProps) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<NotificationsRecentResponse["items"]>([]);
  const [loading, setLoading] = useState(false);
  const [markingAll, setMarkingAll] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const router = useRouter();
  const { data: unread = 0 } = useNotificationUnreadCount();
  const markRead = useMarkNotificationRead();
  const markAllReadMutation = useMarkAllNotificationsRead();

  async function loadRecent() {
    setLoading(true);
    try {
      const data = await getJson<NotificationsRecentResponse>("/api/notifications/recent?limit=3");
      setItems(data.items);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let alive = true;

    async function refresh() {
      try {
        const data = await getJson<NotificationsRecentResponse>("/api/notifications/recent?limit=3");
        if (!alive) {
          return;
        }
        setItems(data.items);
      } catch {
        // Keep the last known shared unread count when a refresh fails.
      }
    }

    void refresh();
    const timer = window.setInterval(() => {
      void refresh();
    }, 30_000);

    return () => {
      alive = false;
      window.clearInterval(timer);
    };
  }, []);

  useEffect(() => {
    function onOutsideClick(event: MouseEvent) {
      if (!menuRef.current) {
        return;
      }

      if (!menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    if (open) {
      window.addEventListener("mousedown", onOutsideClick);
    }

    return () => {
      window.removeEventListener("mousedown", onOutsideClick);
    };
  }, [open]);

  async function markAllRead() {
    setMarkingAll(true);
    try {
      await markAllReadMutation.mutateAsync();
      setItems((current) => current.map((item) => ({ ...item, isRead: true })));
    } finally {
      setMarkingAll(false);
    }
  }

  async function markReadInBackground(notificationId: string) {
    await markRead.mutateAsync(notificationId);
    setItems((current) =>
      current.map((item) => (item.id === notificationId ? { ...item, isRead: true } : item)),
    );
  }

  return (
    <div className={cn("relative", className)} ref={menuRef}>
      <button
        type="button"
        onClick={() => {
          const next = !open;
          setOpen(next);
          if (next) {
            void loadRecent();
          }
        }}
        className="relative grid size-10 place-items-center rounded-full border border-[var(--avad-border)] bg-[var(--avad-bg-elevated)] text-[var(--avad-text)]"
        aria-label="Open notifications"
      >
        <Bell size={16} />
        {unread > 0 ? (
          <span className="absolute -right-1 -top-1 inline-flex min-w-5 items-center justify-center rounded-full bg-[#ef2b13] px-1.5 text-[10px] font-semibold text-white">
            {unread > 99 ? "99+" : unread}
          </span>
        ) : null}
      </button>

      {open ? (
        <div className="absolute right-0 z-50 mt-2 w-[360px] max-w-[calc(100vw-1.5rem)] overflow-hidden rounded-2xl border border-[var(--avad-border)] bg-[var(--avad-bg-elevated)] shadow-2xl">
          <div className="flex items-center justify-between border-b border-[var(--avad-border)] px-4 py-3">
            <h3 className="text-lg font-semibold text-[var(--avad-text-strong)]">Notifications</h3>
            <button
              type="button"
              onClick={() => void markAllRead()}
              disabled={markingAll || unread === 0}
              className="inline-flex items-center gap-1 text-xs font-medium text-[var(--avad-text-soft)] disabled:opacity-50"
            >
              <CheckCheck size={14} />
              Mark all read
            </button>
          </div>

          <div className="max-h-[380px] overflow-y-auto">
            {loading ? (
              <p className="px-4 py-6 text-sm text-[var(--avad-text-soft)]">Loading notifications...</p>
            ) : items.length ? (
              items.map((item) => (
                <Link
                  key={item.id}
                  href={item.actionUrl || viewAllHref}
                  onClick={(event) => {
                    if (!item.isRead) {
                      event.preventDefault();
                      void markReadInBackground(item.id).then(() => {
                        router.push(item.actionUrl || viewAllHref);
                      });
                    }
                    setOpen(false);
                  }}
                  className={cn(
                    "block border-b border-[var(--avad-border)] px-4 py-3 transition hover:bg-[var(--avad-bg-soft)]",
                    !item.isRead && "bg-[#eaf2ff]",
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-base font-semibold text-[var(--avad-text-strong)]">{item.title}</p>
                    {!item.isRead ? <span className="mt-1 size-2 rounded-full bg-[#2f7ef6]" aria-hidden="true" /> : null}
                  </div>
                  <p className="mt-1 line-clamp-2 text-sm text-[var(--avad-text-soft)]">{item.message}</p>
                  <p className="mt-1 text-xs text-[var(--avad-text-soft)]">{formatDate(item.createdAt)}</p>
                </Link>
              ))
            ) : (
              <p className="px-4 py-6 text-sm text-[var(--avad-text-soft)]">No notifications yet.</p>
            )}
          </div>

          <Link
            href={viewAllHref}
            onClick={() => setOpen(false)}
            className="block border-t border-[var(--avad-border)] px-4 py-3 text-center text-sm font-semibold text-[var(--avad-text-strong)] transition hover:bg-[var(--avad-bg-soft)]"
          >
            View all notifications
          </Link>
        </div>
      ) : null}
    </div>
  );
}
