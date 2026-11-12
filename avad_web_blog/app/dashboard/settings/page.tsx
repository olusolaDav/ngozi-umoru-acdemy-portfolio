"use client";

import Link from "next/link";
import { ArrowRight, ChevronDown, ChevronUp, KeyRound, LockKeyhole, Mail, RefreshCw, ShieldAlert } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import { getJson, patchJson } from "@/lib/http";

const settingsActions = [
  {
    title: "Change Email",
    description: "Change your company email",
    href: "/dashboard/settings/change-email",
    icon: Mail,
    cta: "Change Email",
  },
  {
    title: "Change Password",
    description: "Update your current password securely",
    href: "/dashboard/settings/change-password",
    icon: KeyRound,
    cta: "Change Password",
  },
  {
    title: "Forgot Password",
    description: "Recover account with verification pin",
    href: "/auth/forgot-password",
    icon: ShieldAlert,
    cta: "Recover Password",
  },
] as const;

export default function DashboardSettingsPage() {
  const [autoApprovePosts, setAutoApprovePosts] = useState(false);
  const [autoApproveComments, setAutoApproveComments] = useState(false);
  const [autoApproveReplies, setAutoApproveReplies] = useState(false);
  const [devotionalAutoApproveComments, setDevotionalAutoApproveComments] = useState(false);
  const [devotionalAutoApproveReplies, setDevotionalAutoApproveReplies] = useState(false);
  const [communityAutoApprovePosts, setCommunityAutoApprovePosts] = useState(false);
  const [communityAutoApproveComments, setCommunityAutoApproveComments] = useState(false);
  const [communityAutoApproveReplies, setCommunityAutoApproveReplies] = useState(false);
  const [loadingModeration, setLoadingModeration] = useState(true);
  const [savingModeration, setSavingModeration] = useState(false);
  const [savingDevotionalModeration, setSavingDevotionalModeration] = useState(false);
  const [savingCommunityModeration, setSavingCommunityModeration] = useState(false);
  const [moderationVisible, setModerationVisible] = useState(true);
  const [devotionalModerationVisible, setDevotionalModerationVisible] = useState(true);
  const [communityModerationVisible, setCommunityModerationVisible] = useState(true);
  const [blogModerationExpanded, setBlogModerationExpanded] = useState(true);
  const [devotionalModerationExpanded, setDevotionalModerationExpanded] = useState(true);
  const [communityModerationExpanded, setCommunityModerationExpanded] = useState(true);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);
  const [savingTwoFactor, setSavingTwoFactor] = useState(false);

  const loadModerationSettings = useCallback(async () => {
    setLoadingModeration(true);
    try {
      const [blogData, devotionalData, communityData] = await Promise.all([
        getJson<{ autoApprovePosts: boolean; autoApproveComments: boolean; autoApproveReplies: boolean }>(
          "/api/dashboard/blogs/settings/moderation",
        ),
        getJson<{ autoApproveComments: boolean; autoApproveReplies: boolean }>(
          "/api/dashboard/devotionals/settings/moderation",
        ).catch(() => null),
        getJson<{ autoApprovePosts: boolean; autoApproveComments: boolean; autoApproveReplies: boolean }>(
          "/api/dashboard/community/settings/moderation",
        ).catch(() => null),
      ]);

      setAutoApprovePosts(Boolean(blogData.autoApprovePosts));
      setAutoApproveComments(Boolean(blogData.autoApproveComments));
      setAutoApproveReplies(Boolean(blogData.autoApproveReplies));
      setModerationVisible(true);

      if (devotionalData) {
        setDevotionalAutoApproveComments(Boolean(devotionalData.autoApproveComments));
        setDevotionalAutoApproveReplies(Boolean(devotionalData.autoApproveReplies));
        setDevotionalModerationVisible(true);
      } else {
        setDevotionalModerationVisible(false);
      }

      if (communityData) {
        setCommunityAutoApprovePosts(Boolean(communityData.autoApprovePosts));
        setCommunityAutoApproveComments(Boolean(communityData.autoApproveComments));
        setCommunityAutoApproveReplies(Boolean(communityData.autoApproveReplies));
        setCommunityModerationVisible(true);
      } else {
        setCommunityModerationVisible(false);
      }
    } catch {
      setModerationVisible(false);
      setDevotionalModerationVisible(false);
      setCommunityModerationVisible(false);
    } finally {
      setLoadingModeration(false);
    }
  }, []);

  useEffect(() => {
    queueMicrotask(() => void loadModerationSettings());
  }, [loadModerationSettings]);

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

  async function refresh() {
    await loadModerationSettings();
  }

  async function saveModerationSettings() {
    setSavingModeration(true);
    try {
      await patchJson("/api/dashboard/blogs/settings/moderation", {
        autoApprovePosts,
        autoApproveComments,
        autoApproveReplies,
      });
      toast.success("Blog moderation settings updated.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to update moderation settings.");
    } finally {
      setSavingModeration(false);
    }
  }

  async function saveDevotionalModerationSettings() {
    setSavingDevotionalModeration(true);
    try {
      await patchJson("/api/dashboard/devotionals/settings/moderation", {
        autoApproveComments: devotionalAutoApproveComments,
        autoApproveReplies: devotionalAutoApproveReplies,
      });
      toast.success("Devotional moderation settings updated.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to update devotional moderation settings.");
    } finally {
      setSavingDevotionalModeration(false);
    }
  }

  async function saveCommunityModerationSettings() {
    setSavingCommunityModeration(true);
    try {
      await patchJson("/api/dashboard/community/settings/moderation", {
        autoApprovePosts: communityAutoApprovePosts,
        autoApproveComments: communityAutoApproveComments,
        autoApproveReplies: communityAutoApproveReplies,
      });
      toast.success("Community moderation settings updated.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to update community moderation settings.");
    } finally {
      setSavingCommunityModeration(false);
    }
  }

  return (
    <section className="rounded-3xl border border-[var(--avad-border)] bg-[var(--avad-bg-elevated)] p-6 sm:p-8">
      <div className="flex items-start justify-between gap-3">
        <h1 className="font-serif text-4xl text-[var(--avad-text-strong)]">Settings</h1>
        <button
          type="button"
          onClick={() => void refresh()}
          className="inline-flex h-10 items-center gap-1 rounded-full border border-[var(--avad-border)] bg-[var(--avad-bg-soft)] px-4 text-sm text-[var(--avad-text)]"
        >
          <RefreshCw size={14} />
          Refresh
        </button>
      </div>

      <div className="mt-6 divide-y divide-[var(--avad-border)] rounded-2xl border border-[var(--avad-border)]">
        {settingsActions.map((action) => {
          const Icon = action.icon;
          return (
            <div key={action.title} className="flex flex-col gap-4 px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xl font-semibold text-[var(--avad-text-strong)]">{action.title}</p>
                <p className="mt-1 text-sm text-[var(--avad-text-soft)]">{action.description}</p>
              </div>
              <Link
                href={action.href}
                className="inline-flex items-center gap-2 rounded-full bg-[var(--avad-bg-soft)] px-4 py-2 text-sm font-semibold text-[var(--avad-text)] transition hover:bg-[var(--avad-bg)]"
              >
                <Icon size={14} />
                {action.cta}
                <ArrowRight size={14} />
              </Link>
            </div>
          );
        })}
      </div>

      <div className="mt-8 rounded-2xl border border-[var(--avad-border)] p-5">
        <div className="flex items-start gap-3">
          <LockKeyhole className="mt-1 text-[var(--avad-ring)]" size={22} />
          <div>
            <h2 className="font-serif text-3xl text-[var(--avad-text-strong)]">Two-factor authentication</h2>
            <p className="mt-2 text-sm text-[var(--avad-text-soft)]">Add an extra layer of protection. Each sign-in will require a secure six-digit code sent to your email.</p>
          </div>
        </div>
        <label className="mt-5 flex items-center justify-between rounded-xl border border-[var(--avad-border)] px-4 py-3">
          <span className="text-sm font-semibold text-[var(--avad-text)]">Require a code at sign in</span>
          <input type="checkbox" checked={twoFactorEnabled} onChange={(event) => setTwoFactorEnabled(event.target.checked)} className="size-5 accent-[#4b5fc1]" />
        </label>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <span className="text-sm text-[var(--avad-text-soft)]">Your preference is saved securely to your account.</span>
          <button type="button" onClick={() => void saveTwoFactor()} disabled={savingTwoFactor} className="h-11 rounded-full bg-gradient-to-b from-[#c99556] to-[#3a1a56] px-5 text-sm font-semibold text-white disabled:opacity-70">
            {savingTwoFactor ? "Saving..." : "Save security preference"}
          </button>
        </div>
      </div>

      {moderationVisible ? (
        <div className="mt-8 rounded-2xl border border-[var(--avad-border)] p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="font-serif text-3xl text-[var(--avad-text-strong)]">Blog Moderation</h2>
              <p className="mt-2 text-sm text-[var(--avad-text-soft)]">
                Control whether blog comments and comment replies should be published immediately or require approval.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setBlogModerationExpanded((value) => !value)}
              className="inline-flex h-9 items-center gap-1 rounded-full border border-[var(--avad-border)] bg-[var(--avad-bg-soft)] px-3 text-xs font-semibold text-[var(--avad-text)]"
            >
              {blogModerationExpanded ? "Collapse" : "Expand"}
              {blogModerationExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
          </div>

          {loadingModeration ? (
            <p className="mt-4 text-sm text-[var(--avad-text-soft)]">Loading moderation preferences...</p>
          ) : blogModerationExpanded ? (
            <div className="mt-5 space-y-4">
              <label className="flex items-center justify-between rounded-xl border border-[var(--avad-border)] px-4 py-3">
                <div>
                  <p className="text-sm font-semibold text-[var(--avad-text)]">Auto-publish author blog posts</p>
                  <p className="text-xs text-[var(--avad-text-soft)]">When enabled, author submissions are published immediately instead of waiting for approval.</p>
                </div>
                <input
                  type="checkbox"
                  checked={autoApprovePosts}
                  onChange={(event) => setAutoApprovePosts(event.target.checked)}
                  className="size-5 accent-[#4b5fc1]"
                />
              </label>

              <label className="flex items-center justify-between rounded-xl border border-[var(--avad-border)] px-4 py-3">
                <div>
                  <p className="text-sm font-semibold text-[var(--avad-text)]">Auto-publish user comments</p>
                  <p className="text-xs text-[var(--avad-text-soft)]">When enabled, new comments go live without admin/moderator review.</p>
                </div>
                <input
                  type="checkbox"
                  checked={autoApproveComments}
                  onChange={(event) => setAutoApproveComments(event.target.checked)}
                  className="size-5 accent-[#4b5fc1]"
                />
              </label>

              <label className="flex items-center justify-between rounded-xl border border-[var(--avad-border)] px-4 py-3">
                <div>
                  <p className="text-sm font-semibold text-[var(--avad-text)]">Auto-publish comment replies</p>
                  <p className="text-xs text-[var(--avad-text-soft)]">When enabled, replies go live immediately without approval.</p>
                </div>
                <input
                  type="checkbox"
                  checked={autoApproveReplies}
                  onChange={(event) => setAutoApproveReplies(event.target.checked)}
                  className="size-5 accent-[#4b5fc1]"
                />
              </label>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => void saveModerationSettings()}
                  disabled={savingModeration}
                  className="h-10 rounded-full bg-gradient-to-b from-[#c99556] to-[#3a1a56] px-5 text-sm font-semibold text-white disabled:opacity-70"
                >
                  {savingModeration ? "Saving..." : "Save Blog Moderation"}
                </button>
              </div>
            </div>
          ) : (
            <p className="mt-4 text-sm text-[var(--avad-text-soft)]">Blog moderation settings are collapsed.</p>
          )}
        </div>
      ) : null}

      {devotionalModerationVisible ? (
        <div className="mt-8 rounded-2xl border border-[var(--avad-border)] p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="font-serif text-3xl text-[var(--avad-text-strong)]">Devotional Moderation</h2>
              <p className="mt-2 text-sm text-[var(--avad-text-soft)]">
                Control whether devotional comments and comment replies should be published immediately or require approval.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setDevotionalModerationExpanded((value) => !value)}
              className="inline-flex h-9 items-center gap-1 rounded-full border border-[var(--avad-border)] bg-[var(--avad-bg-soft)] px-3 text-xs font-semibold text-[var(--avad-text)]"
            >
              {devotionalModerationExpanded ? "Collapse" : "Expand"}
              {devotionalModerationExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
          </div>

          {loadingModeration ? (
            <p className="mt-4 text-sm text-[var(--avad-text-soft)]">Loading moderation preferences...</p>
          ) : devotionalModerationExpanded ? (
            <div className="mt-5 space-y-4">
              <label className="flex items-center justify-between rounded-xl border border-[var(--avad-border)] px-4 py-3">
                <div>
                  <p className="text-sm font-semibold text-[var(--avad-text)]">Auto-publish user comments</p>
                  <p className="text-xs text-[var(--avad-text-soft)]">When enabled, new comments go live without admin/moderator review.</p>
                </div>
                <input
                  type="checkbox"
                  checked={devotionalAutoApproveComments}
                  onChange={(event) => setDevotionalAutoApproveComments(event.target.checked)}
                  className="size-5 accent-[#4b5fc1]"
                />
              </label>

              <label className="flex items-center justify-between rounded-xl border border-[var(--avad-border)] px-4 py-3">
                <div>
                  <p className="text-sm font-semibold text-[var(--avad-text)]">Auto-publish comment replies</p>
                  <p className="text-xs text-[var(--avad-text-soft)]">When enabled, replies go live immediately without approval.</p>
                </div>
                <input
                  type="checkbox"
                  checked={devotionalAutoApproveReplies}
                  onChange={(event) => setDevotionalAutoApproveReplies(event.target.checked)}
                  className="size-5 accent-[#4b5fc1]"
                />
              </label>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => void saveDevotionalModerationSettings()}
                  disabled={savingDevotionalModeration}
                  className="h-10 rounded-full bg-gradient-to-b from-[#c99556] to-[#3a1a56] px-5 text-sm font-semibold text-white disabled:opacity-70"
                >
                  {savingDevotionalModeration ? "Saving..." : "Save Devotional Moderation"}
                </button>
              </div>
            </div>
          ) : (
            <p className="mt-4 text-sm text-[var(--avad-text-soft)]">Devotional moderation settings are collapsed.</p>
          )}
        </div>
      ) : null}

      {communityModerationVisible ? (
        <div className="mt-8 rounded-2xl border border-[var(--avad-border)] p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="font-serif text-3xl text-[var(--avad-text-strong)]">Community Moderation</h2>
              <p className="mt-2 text-sm text-[var(--avad-text-soft)]">
                Control whether community thread comments and replies should be published immediately or require moderator approval.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setCommunityModerationExpanded((value) => !value)}
              className="inline-flex h-9 items-center gap-1 rounded-full border border-[var(--avad-border)] bg-[var(--avad-bg-soft)] px-3 text-xs font-semibold text-[var(--avad-text)]"
            >
              {communityModerationExpanded ? "Collapse" : "Expand"}
              {communityModerationExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
          </div>

          {loadingModeration ? (
            <p className="mt-4 text-sm text-[var(--avad-text-soft)]">Loading moderation preferences...</p>
          ) : communityModerationExpanded ? (
            <div className="mt-5 space-y-4">
              <label className="flex items-center justify-between rounded-xl border border-[var(--avad-border)] px-4 py-3">
                <div>
                  <p className="text-sm font-semibold text-[var(--avad-text)]">Auto-publish member threads</p>
                  <p className="text-xs text-[var(--avad-text-soft)]">When enabled, member and blogger community threads go live immediately.</p>
                </div>
                <input
                  type="checkbox"
                  checked={communityAutoApprovePosts}
                  onChange={(event) => setCommunityAutoApprovePosts(event.target.checked)}
                  className="size-5 accent-[#4b5fc1]"
                />
              </label>

              <label className="flex items-center justify-between rounded-xl border border-[var(--avad-border)] px-4 py-3">
                <div>
                  <p className="text-sm font-semibold text-[var(--avad-text)]">Auto-publish thread comments</p>
                  <p className="text-xs text-[var(--avad-text-soft)]">When enabled, new thread comments go live without moderator review.</p>
                </div>
                <input
                  type="checkbox"
                  checked={communityAutoApproveComments}
                  onChange={(event) => setCommunityAutoApproveComments(event.target.checked)}
                  className="size-5 accent-[#4b5fc1]"
                />
              </label>

              <label className="flex items-center justify-between rounded-xl border border-[var(--avad-border)] px-4 py-3">
                <div>
                  <p className="text-sm font-semibold text-[var(--avad-text)]">Auto-publish thread replies</p>
                  <p className="text-xs text-[var(--avad-text-soft)]">When enabled, replies on community threads go live immediately.</p>
                </div>
                <input
                  type="checkbox"
                  checked={communityAutoApproveReplies}
                  onChange={(event) => setCommunityAutoApproveReplies(event.target.checked)}
                  className="size-5 accent-[#4b5fc1]"
                />
              </label>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => void saveCommunityModerationSettings()}
                  disabled={savingCommunityModeration}
                  className="h-10 rounded-full bg-gradient-to-b from-[#c99556] to-[#3a1a56] px-5 text-sm font-semibold text-white disabled:opacity-70"
                >
                  {savingCommunityModeration ? "Saving..." : "Save Community Moderation"}
                </button>
              </div>
            </div>
          ) : (
            <p className="mt-4 text-sm text-[var(--avad-text-soft)]">Community moderation settings are collapsed.</p>
          )}
        </div>
      ) : null}
    </section>
  );
}
