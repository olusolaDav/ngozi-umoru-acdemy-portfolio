"use client";

import { X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import { type DailyScriptureFeed, type DailyScriptureSummary } from "@/lib/daily-scripture";
import { getJson } from "@/lib/http";

const DEFAULT_ROTATION_WINDOW_MINUTES = 180;
const FEED_REFRESH_MS = 30 * 60 * 1000;
const MODAL_REPEAT_MS = 60 * 60 * 1000;
const STORAGE_DAY_KEY = "avad.dailyScripture.dismissedDay";
const STORAGE_AT_KEY = "avad.dailyScripture.dismissedAt";
const SALVATION_MARQUEE_LINE = "Salvation isn't an assumption have you taken that decision already ? Have you given your life to Christ?";

function dayKeyFromDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

function dateFromDayKey(dayKey: string) {
  const parsed = new Date(`${dayKey}T00:00:00.000Z`);
  if (Number.isNaN(parsed.getTime())) {
    const now = new Date();
    return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  }

  return parsed;
}

function pickRotatingScripture(items: DailyScriptureSummary[], dateKey: string, now: Date, rotationWindowMinutes: number) {
  if (!items.length) {
    return null;
  }

  const dayStart = dateFromDayKey(dateKey);
  const windowMs = Math.max(rotationWindowMinutes, 1) * 60 * 1000;
  const elapsed = Math.max(now.getTime() - dayStart.getTime(), 0);
  const bucket = Math.floor(elapsed / windowMs);
  const index = bucket % items.length;

  return items[index] ?? null;
}

export function DailyScriptureExperience() {
  const [feed, setFeed] = useState<DailyScriptureFeed | null>(null);
  const [active, setActive] = useState<DailyScriptureSummary | null>(null);
  const [open, setOpen] = useState(false);
  const reopenTimerRef = useRef<number | null>(null);

  useEffect(() => {
    let mounted = true;

    async function loadFeed() {
      try {
        const data = await getJson<DailyScriptureFeed>("/api/daily-scriptures/today");
        if (!mounted) {
          return;
        }

        setFeed(data);
        setActive(
          data.activeScripture
            ?? pickRotatingScripture(
              data.items,
              data.date || dayKeyFromDate(new Date()),
              new Date(),
              data.rotationWindowMinutes || DEFAULT_ROTATION_WINDOW_MINUTES,
            ),
        );
      } catch {
        if (mounted) {
          setFeed(null);
          setActive(null);
        }
      }
    }

    void loadFeed();
    const refreshId = window.setInterval(() => {
      void loadFeed();
    }, FEED_REFRESH_MS);

    return () => {
      mounted = false;
      window.clearInterval(refreshId);
    };
  }, []);

  useEffect(() => {
    if (!feed?.items.length) {
      window.setTimeout(() => setOpen(false), 0);
      return;
    }

    const tickId = window.setInterval(() => {
      setActive(
        pickRotatingScripture(
          feed.items,
          feed.date || dayKeyFromDate(new Date()),
          new Date(),
          feed.rotationWindowMinutes || DEFAULT_ROTATION_WINDOW_MINUTES,
        ),
      );
    }, 60 * 1000);

    return () => {
      window.clearInterval(tickId);
    };
  }, [feed]);

  useEffect(() => {
    if (!feed?.items.length) {
      return;
    }

    const now = new Date();
    const today = dayKeyFromDate(now);

    const dismissedDay = window.localStorage.getItem(STORAGE_DAY_KEY) || "";
    const dismissedAtRaw = window.localStorage.getItem(STORAGE_AT_KEY) || "";
    const dismissedAt = Number.parseInt(dismissedAtRaw, 10);

    if (dismissedDay !== today || Number.isNaN(dismissedAt)) {
      window.setTimeout(() => setOpen(true), 0);
      return;
    }

    const elapsed = Date.now() - dismissedAt;
    if (elapsed >= MODAL_REPEAT_MS) {
      window.setTimeout(() => setOpen(true), 0);
      return;
    }

    window.setTimeout(() => setOpen(false), 0);
    reopenTimerRef.current = window.setTimeout(() => {
      setOpen(true);
    }, MODAL_REPEAT_MS - elapsed);

    return () => {
      if (reopenTimerRef.current) {
        window.clearTimeout(reopenTimerRef.current);
        reopenTimerRef.current = null;
      }
    };
  }, [feed]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  function closeModal() {
    const now = Date.now();
    window.localStorage.setItem(STORAGE_DAY_KEY, dayKeyFromDate(new Date(now)));
    window.localStorage.setItem(STORAGE_AT_KEY, String(now));
    setOpen(false);

    if (reopenTimerRef.current) {
      window.clearTimeout(reopenTimerRef.current);
    }

    reopenTimerRef.current = window.setTimeout(() => {
      setOpen(true);
    }, MODAL_REPEAT_MS);
  }

  const scriptureText = useMemo(() => {
    if (!active) {
      return "";
    }

    return active.content || active.excerpt || "Daily scripture is now available.";
  }, [active]);

  const bannerLines = useMemo(() => {
    const scriptureLines = (feed?.items.length ? feed.items : active ? [active] : []).map((item) => {
      const lineText = item.content || item.excerpt || "Daily scripture is now available.";
      return `Daily Scripture  |  ${item.verse}  |  ${lineText}`;
    });

    return [...scriptureLines, SALVATION_MARQUEE_LINE];
  }, [active, feed]);

  return (
    <>
      <div className="scripture-banner fixed inset-x-0 top-0 z-50 h-9 overflow-hidden bg-gradient-to-r from-[#d89d58] to-[var(--avad-purple)] text-white">
        <div className="scripture-banner-track whitespace-nowrap px-4 py-2 text-sm font-semibold">
          {[...bannerLines, ...bannerLines].map((line, index) => (
            <span key={`${line}-${index}`} className="scripture-banner-item" aria-hidden={index >= bannerLines.length ? "true" : undefined}>
              {line}
            </span>
          ))}
        </div>
      </div>

      {open && active ? (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-[#1e1231]/55 p-3 sm:p-4" role="presentation">
          <div className="flex min-h-full items-start justify-center sm:items-center">
            <div
              className="my-auto max-h-[calc(100dvh-1.5rem)] w-full max-w-xl overflow-y-auto rounded-3xl border border-[var(--avad-border)] bg-[var(--avad-bg-elevated)] p-5 shadow-2xl sm:max-h-[calc(100dvh-2rem)] sm:p-6"
              role="dialog"
              aria-modal="true"
              aria-labelledby="daily-scripture-title"
            >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--avad-gold)]">A Verse A Day</p>
                <h3 id="daily-scripture-title" className="mt-2 break-words font-serif text-[clamp(1.75rem,8vw,1.875rem)] leading-tight text-[var(--avad-text-strong)] [overflow-wrap:anywhere]">{active.verse}</h3>
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="grid size-8 shrink-0 place-items-center rounded-full border border-[var(--avad-border)] text-[var(--avad-text-soft)]"
                aria-label="Close scripture popup"
              >
                <X size={16} />
              </button>
            </div>

            <p className="mt-4 whitespace-normal break-words text-[15px] leading-7 text-[var(--avad-text)] [overflow-wrap:anywhere]">{scriptureText}</p>

            <div className="mt-5 text-sm">
              <p className="text-[10px] text-[var(--avad-text-soft)] opacity-50">This reminder returns every hour while you are browsing.</p>
            </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
