"use client";

import { X } from "lucide-react";
import { useEffect, useState } from "react";

import { postJson } from "@/lib/http";

type SessionUser = {
  id: string;
  role: "ADMIN" | "MODERATOR" | "BLOGGER" | "MEMBER";
  showWelcomeModal?: boolean;
};

export function FirstLoginWelcomeModal() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const response = await fetch("/api/auth/session", { cache: "no-store" });
        if (!response.ok || !active) {
          return;
        }

        const user = (await response.json()) as SessionUser;
        if (user.role === "MEMBER" && user.showWelcomeModal) {
          setOpen(true);
        }
      } catch {
        setOpen(false);
      }
    }

    void load();

    return () => {
      active = false;
    };
  }, []);

  async function closeModal() {
    setOpen(false);

    try {
      await postJson("/api/auth/welcome-note/seen", {});
    } catch {
      return;
    }
  }

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[60] overflow-y-auto bg-[#1e1231]/65 p-3 sm:flex sm:items-center sm:justify-center sm:p-4">
      <div className="mx-auto my-3 w-full max-w-xl rounded-3xl border border-[var(--avad-border)] bg-[var(--avad-bg-elevated)] p-5 shadow-2xl sm:my-0 sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--avad-gold)]">Welcome to AVAD</p>
            <h3 className="mt-2 break-words font-serif text-[clamp(1.75rem,8vw,1.875rem)] leading-tight text-[var(--avad-text-strong)]">We are glad you are here</h3>
          </div>
          <button
            type="button"
            onClick={() => void closeModal()}
            className="grid size-8 shrink-0 place-items-center rounded-full border border-[var(--avad-border)] text-[var(--avad-text-soft)]"
            aria-label="Close welcome message"
          >
            <X size={16} />
          </button>
        </div>

        <p className="mt-4 break-words text-[15px] leading-7 text-[var(--avad-text)] [overflow-wrap:anywhere]">
          Welcome to the AVAD community. You can now join conversations, grow through daily scripture, and engage with devotionals designed to strengthen your faith journey.
        </p>

        <div className="mt-5 flex flex-wrap items-center justify-end">
          <button
            type="button"
            onClick={() => void closeModal()}
            className="rounded-full bg-gradient-to-b from-[#d39a52] to-[#3a1a56] px-5 py-2.5 text-sm font-semibold text-white"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}
