"use client";

import Link from "next/link";
import { Bell, ChevronRight, KeyRound, LockKeyhole, Mail, UserRound } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { getJson, patchJson } from "@/lib/http";

const memberActions = [
  {
    title: "Change Email",
    description: "Update your login email for AVAD.",
    href: "/settings/change-email",
    icon: Mail,
  },
  {
    title: "Change Password",
    description: "Set a fresh password and secure your account.",
    href: "/settings/change-password",
    icon: KeyRound,
  },
  {
    title: "Notifications",
    description: "Review your latest account and community updates.",
    href: "/notifications",
    icon: Bell,
  },
  {
    title: "Profile",
    description: "View your account summary and member details.",
    href: "/profile",
    icon: UserRound,
  },
] as const;

export default function MemberSettingsPage() {
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);
  const [savingTwoFactor, setSavingTwoFactor] = useState(false);

  useEffect(() => {
    queueMicrotask(() => {
      void getJson<{ twoFactorEnabled: boolean }>("/api/auth/session")
        .then((session) => setTwoFactorEnabled(Boolean(session.twoFactorEnabled)))
        .catch(() => undefined);
    });
  }, []);

  async function saveTwoFactor() {
    setSavingTwoFactor(true);
    try {
      const response = await patchJson<{ twoFactorEnabled: boolean; message: string }>("/api/users/me/two-factor", {
        enabled: twoFactorEnabled,
      });
      setTwoFactorEnabled(response.twoFactorEnabled);
      toast.success(response.message);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to update two-factor authentication.");
    } finally {
      setSavingTwoFactor(false);
    }
  }

  return (
    <section className="mx-auto w-full max-w-[1320px] px-4 py-10 md:px-6 lg:px-8 xl:px-10">
      <div className="rounded-[28px] border border-[var(--avad-border)] bg-[var(--avad-bg-elevated)] p-6 sm:p-8">
        <h1 className="font-serif text-[clamp(2.1rem,5vw,3.1rem)] text-[var(--avad-text-strong)]">Settings</h1>
        <p className="mt-2 max-w-[680px] text-sm text-[var(--avad-text-soft)]">
          Manage your account, security, and member communication preferences.
        </p>

        <div className="mt-6 divide-y divide-[var(--avad-border)] rounded-2xl border border-[var(--avad-border)]">
          {memberActions.map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.title}
                href={action.href}
                className="flex items-center justify-between gap-3 px-4 py-4 transition hover:bg-[var(--avad-bg-soft)] sm:px-5"
              >
                <div className="flex items-center gap-3">
                  <span className="inline-flex size-10 items-center justify-center rounded-full border border-[var(--avad-border)] bg-[var(--avad-bg-soft)] text-[var(--avad-text)]">
                    <Icon size={16} />
                  </span>
                  <div>
                    <p className="font-semibold text-[var(--avad-text-strong)]">{action.title}</p>
                    <p className="text-sm text-[var(--avad-text-soft)]">{action.description}</p>
                  </div>
                </div>
                <ChevronRight size={16} className="text-[var(--avad-text-soft)]" />
              </Link>
            );
          })}
        </div>

        <div className="mt-8 rounded-2xl border border-[var(--avad-border)] p-5">
          <div className="flex items-start gap-3">
            <LockKeyhole className="mt-1 text-[var(--avad-ring)]" size={22} />
            <div>
              <h2 className="font-serif text-3xl text-[var(--avad-text-strong)]">Two-factor authentication</h2>
              <p className="mt-2 text-sm text-[var(--avad-text-soft)]">
                Add an extra layer of protection. Each sign-in will require a secure six-digit code sent to your email.
              </p>
            </div>
          </div>
          <label className="mt-5 flex items-center justify-between rounded-xl border border-[var(--avad-border)] px-4 py-3">
            <span className="text-sm font-semibold text-[var(--avad-text)]">Require a code at sign in</span>
            <input
              type="checkbox"
              checked={twoFactorEnabled}
              onChange={(event) => setTwoFactorEnabled(event.target.checked)}
              className="size-5 accent-[#4b5fc1]"
            />
          </label>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <span className="text-sm text-[var(--avad-text-soft)]">Your preference is saved securely to your account.</span>
            <button
              type="button"
              onClick={() => void saveTwoFactor()}
              disabled={savingTwoFactor}
              className="h-11 rounded-full bg-gradient-to-b from-[#c99556] to-[#3a1a56] px-5 text-sm font-semibold text-white disabled:opacity-70"
            >
              {savingTwoFactor ? "Saving..." : "Save security preference"}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
