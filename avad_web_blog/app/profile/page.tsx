"use client";

import { BellRing, Compass, Settings, UserRound } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { getJson } from "@/lib/http";

type SessionUser = {
  id: string;
  fullName: string;
  email: string;
  role: "ADMIN" | "MODERATOR" | "BLOGGER" | "MEMBER";
};

type UnreadPayload = {
  unread: number;
};

export default function MemberProfilePage() {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const [session, unreadPayload] = await Promise.all([
          getJson<SessionUser>("/api/auth/session"),
          getJson<UnreadPayload>("/api/notifications/unread-count").catch(() => ({ unread: 0 })),
        ]);

        if (!active) {
          return;
        }

        setUser(session);
        setUnread(unreadPayload.unread ?? 0);
      } catch {
        if (active) {
          setUser(null);
        }
      }
    }

    void load();

    return () => {
      active = false;
    };
  }, []);

  return (
    <section className="mx-auto w-full max-w-[1320px] px-4 py-10 md:px-6 lg:px-8 xl:px-10">
      <div className="overflow-hidden rounded-[30px] border border-[var(--avad-border)] bg-[var(--avad-bg-elevated)]">
        <div className="bg-gradient-to-r from-[#3b1f59] via-[#5b315f] to-[#a86f3f] px-6 py-8 text-white sm:px-8">
          <p className="text-xs uppercase tracking-[0.2em] text-[#f2ddc3]">Member Profile</p>
          <h1 className="mt-2 font-serif text-[clamp(2rem,5vw,3rem)] leading-[1.05]">Your AVAD Account</h1>
          <p className="mt-3 max-w-[680px] text-sm text-[#f4e8dc]">
            Keep your account details current and track key activity at a glance.
          </p>
        </div>

        <div className="grid gap-6 px-6 py-8 sm:px-8 lg:grid-cols-[1.2fr_1fr]">
          <article className="rounded-2xl border border-[var(--avad-border)] bg-[var(--avad-bg-soft)] p-5">
            <div className="inline-flex size-11 items-center justify-center rounded-full bg-[#f3dfc0] text-[#5b2b1c]">
              <UserRound size={20} />
            </div>
            <h2 className="mt-4 text-lg font-semibold text-[var(--avad-text-strong)]">Identity</h2>
            <dl className="mt-4 space-y-2 text-sm text-[var(--avad-text)]">
              <div>
                <dt className="text-[var(--avad-text-soft)]">Full Name</dt>
                <dd className="font-medium">{user?.fullName ?? "-"}</dd>
              </div>
              <div>
                <dt className="text-[var(--avad-text-soft)]">Email</dt>
                <dd className="font-medium">{user?.email ?? "-"}</dd>
              </div>
              <div>
                <dt className="text-[var(--avad-text-soft)]">Role</dt>
                <dd className="font-medium">{user?.role ?? "MEMBER"}</dd>
              </div>
            </dl>
          </article>

          <article className="rounded-2xl border border-[var(--avad-border)] bg-[var(--avad-bg-soft)] p-5">
            <div className="inline-flex size-11 items-center justify-center rounded-full bg-[#d7e8ff] text-[#173f72]">
              <BellRing size={20} />
            </div>
            <h2 className="mt-4 text-lg font-semibold text-[var(--avad-text-strong)]">Notification Pulse</h2>
            <p className="mt-2 text-sm text-[var(--avad-text-soft)]">Unread updates waiting for you</p>
            <p className="mt-4 text-4xl font-bold text-[var(--avad-text-strong)]">{unread}</p>
            <Link href="/notifications" className="mt-4 inline-flex items-center rounded-full border border-[var(--avad-border)] px-4 py-2 text-sm text-[var(--avad-text)] hover:bg-[var(--avad-bg)]">
              Open Notifications
            </Link>
          </article>
        </div>

        <div className="flex flex-wrap gap-3 border-t border-[var(--avad-border)] px-6 py-6 sm:px-8">
          <Link href="/settings" className="inline-flex items-center gap-2 rounded-full bg-gradient-to-b from-[#c99556] to-[#3a1a56] px-5 py-2 text-sm font-semibold text-white">
            <Settings size={14} />
            Account Settings
          </Link>
          <Link href="/community" className="inline-flex items-center gap-2 rounded-full border border-[var(--avad-border)] px-5 py-2 text-sm text-[var(--avad-text)] hover:bg-[var(--avad-bg)]">
            <Compass size={14} />
            Return To Community
          </Link>
        </div>
      </div>
    </section>
  );
}
