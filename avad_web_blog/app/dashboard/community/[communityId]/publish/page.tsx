"use client";

import { CalendarDays, ImagePlus, X } from "lucide-react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { useConfirmationDialog } from "@/components/ui/confirmation-dialog-provider";
import { firstSentenceFromContent, safeThumbnailSrc, type CommunitySummary } from "@/lib/community";
import { getJson, patchJson } from "@/lib/http";

type SessionUser = {
  role: "ADMIN" | "MODERATOR" | "BLOGGER" | "MEMBER";
};

export default function PublishCommunityPage() {
  const params = useParams<{ communityId: string }>();
  const router = useRouter();
  const confirmation = useConfirmationDialog();
  const [post, setPost] = useState<CommunitySummary | null>(null);
  const [session, setSession] = useState<SessionUser | null>(null);
  const [tags, setTags] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [title, setTitle] = useState("");
  const [loadedTitle, setLoadedTitle] = useState("");
  const [thumbnail, setThumbnail] = useState("");
  const [scheduleAt, setScheduleAt] = useState("");
  const [mode, setMode] = useState<"publish" | "schedule">("publish");
  const [saving, setSaving] = useState(false);
  const [uploadingThumbnail, setUploadingThumbnail] = useState(false);
  const thumbnailInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    void Promise.all([
      getJson<CommunitySummary>(`/api/dashboard/community/${params.communityId}`),
      getJson<SessionUser>("/api/auth/session"),
    ]).then(([postData, user]) => {
      setPost(postData);
      setSession(user);
      setTags(postData.tags.join(", "));
      setMetaDescription(firstSentenceFromContent(postData.content, 140) || postData.metaDescription || postData.excerpt || "");
      setTitle(postData.title);
      setLoadedTitle(postData.title);
      setThumbnail(postData.thumbnail ?? "");
    });
  }, [params.communityId]);

  if (session?.role === "BLOGGER") {
    router.push(`/dashboard/community/${params.communityId}/edit`);
  }

  if (!post) {
    return <p className="p-6 text-sm text-[var(--avad-text-soft)]">Loading publish form...</p>;
  }

  async function handleThumbnailChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) {
      return;
    }

    setUploadingThumbnail(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "community_thumbnails");
      const response = await fetch("/api/upload/file", { method: "POST", body: formData });
      const payload = (await response.json().catch(() => ({}))) as { data?: { url?: string }; message?: string };
      if (!response.ok || !payload.data?.url) {
        throw new Error(payload.message ?? "Unable to upload thumbnail.");
      }
      setThumbnail(payload.data.url);
    } catch (error) {
      await confirmation.alert({
        title: "Unable to Change Thumbnail",
        description: error instanceof Error ? error.message : "Unable to upload thumbnail.",
      });
    } finally {
      setUploadingThumbnail(false);
    }
  }

  async function saveAndPublish() {
    if (!post) {
      return;
    }

    setSaving(true);
    const cleanTags = tags
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean)
      .slice(0, 5);
    try {
      await patchJson(`/api/dashboard/community/${params.communityId}`, {
        ...(title.trim() !== loadedTitle.trim() ? { title: title.trim() } : {}),
        prayerPoint: post.prayerPoint,
        communityDate: post.communityDate,
        excerpt: metaDescription || firstSentenceFromContent(post.content, 140),
        metaDescription: metaDescription || firstSentenceFromContent(post.content, 140),
        thumbnail: thumbnail.trim() || "",
        tags: cleanTags,
      });

      if (mode === "publish") {
        await patchJson(`/api/dashboard/community/${params.communityId}/status`, { action: "PUBLISH" });
      } else {
        if (!scheduleAt) {
          throw new Error("Please choose a date and time for scheduling.");
        }
        await patchJson(`/api/dashboard/community/${params.communityId}/status`, {
          action: "SCHEDULE",
          scheduledAt: new Date(scheduleAt).toISOString(),
        });
      }

      router.push("/dashboard/community");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to publish post.";
      if (message.toLowerCase().includes("unauthorized")) {
        await confirmation.alert({
          title: "Session Expired",
          description: "Your session expired. Please sign in again.",
        });
        router.push("/auth/sign-in");
        return;
      }

      await confirmation.alert({
        title: "Unable to Publish",
        description: message,
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="-m-4 rounded-[24px] border border-[var(--avad-border)] bg-[var(--avad-bg-elevated)] sm:-m-6">
      <div className="flex items-center justify-between border-b border-[var(--avad-border)] px-4 py-4 sm:px-6">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push(`/dashboard/community/${params.communityId}/edit`)} className="text-[var(--avad-text-soft)]">
            <span className="text-lg">←</span>
          </button>
          <h1 className="font-serif text-[38px] leading-none text-[var(--avad-text-strong)]">Publish Community</h1>
        </div>
        <button onClick={() => router.push(`/dashboard/community/${params.communityId}/edit`)} className="text-[var(--avad-text-soft)]">
          <X size={24} />
        </button>
      </div>

      <div className="grid gap-6 px-4 py-5 sm:px-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-4">
          <div className="relative h-[220px] overflow-hidden rounded-sm bg-[var(--avad-bg-soft)]">
            <Image
              src={safeThumbnailSrc(thumbnail || undefined, post.title)}
              alt={post.title}
              fill
              className="object-cover opacity-85"
            />
            {!thumbnail ? (
              <div className="absolute inset-0 flex items-center justify-center text-center text-sm text-[var(--avad-text-soft)]">
                <div>
                  <p>Include a high-quality image in your story to</p>
                  <p>make it more inviting to readers.</p>
                </div>
              </div>
            ) : null}
            <input
              ref={thumbnailInputRef}
              type="file"
              accept="image/*"
              onChange={(event) => void handleThumbnailChange(event)}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => thumbnailInputRef.current?.click()}
              disabled={uploadingThumbnail || saving}
              className="absolute bottom-3 right-3 inline-flex items-center gap-2 rounded-full bg-[var(--avad-bg-elevated)]/95 px-3 py-2 text-xs font-semibold text-[var(--avad-text-strong)] shadow-sm disabled:cursor-not-allowed disabled:opacity-60"
            >
              <ImagePlus size={15} />
              {uploadingThumbnail ? "Uploading..." : thumbnail ? "Change thumbnail" : "Add thumbnail"}
            </button>
          </div>

          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Title"
            className="w-full border-0 border-b border-[var(--avad-border)] bg-transparent px-0 py-1 text-[35px] text-[var(--avad-text-strong)] outline-none"
          />

          <textarea
            value={metaDescription}
            onChange={(event) => setMetaDescription(event.target.value.slice(0, 140))}
            placeholder="Meta Description"
            className="h-[78px] w-full resize-none border-0 border-b border-[var(--avad-border)] bg-transparent px-0 py-1 text-base text-[var(--avad-text)] outline-none"
          />
          <p className="text-xs text-[var(--avad-text-soft)]">{metaDescription.length}/140</p>

          <p className="text-sm text-[var(--avad-text-soft)]">
            <span className="font-semibold">Note:</span> Changes here will affect how your story appears in public
            places like your community homepage - not the contents of the story itself.
          </p>
        </div>

        <div className="space-y-4">
          <p className="text-[34px] leading-[1.05] text-[var(--avad-text-strong)]">Add or change tags (up to 5) so readers know what your story is about</p>
          <input
            value={tags}
            onChange={(event) => setTags(event.target.value)}
            className="h-11 w-full rounded-xl border border-[var(--avad-border)] bg-[var(--avad-bg-soft)] px-3 text-sm text-[var(--avad-text)] outline-none"
            placeholder="Separate tags by commas"
          />

          <div className="flex gap-2 pt-2 text-sm">
            <button
              onClick={() => setMode("publish")}
              className={
                mode === "publish"
                  ? "h-9 min-w-[104px] rounded-full bg-gradient-to-b from-[#c99556] to-[#3a1a56] px-4 text-white"
                  : "h-9 min-w-[104px] rounded-full border border-[var(--avad-border)] bg-[var(--avad-bg-soft)] px-4 text-[var(--avad-text-soft)]"
              }
            >
              Publish Now
            </button>
            <button
              onClick={() => setMode("schedule")}
              className={
                mode === "schedule"
                  ? "h-9 min-w-[132px] rounded-full bg-gradient-to-b from-[#c99556] to-[#3a1a56] px-4 text-white"
                  : "h-9 min-w-[132px] rounded-full border border-[var(--avad-border)] bg-[var(--avad-bg-soft)] px-4 text-[var(--avad-text-soft)]"
              }
            >
              Schedule for later
            </button>
          </div>

          {mode === "schedule" ? (
            <div className="space-y-2 pt-1">
              <p className="text-sm text-[var(--avad-text-soft)]">Schedule a time to publish:</p>
              <div className="relative">
                <input
                  type="datetime-local"
                  value={scheduleAt}
                  onChange={(event) => setScheduleAt(event.target.value)}
                  className="h-11 w-full rounded-none border-0 border-b border-[var(--avad-border)] bg-transparent px-0 pr-8 text-sm text-[var(--avad-text)] outline-none"
                />
                <CalendarDays className="pointer-events-none absolute right-1 top-1/2 -translate-y-1/2 text-[var(--avad-text-soft)]" size={16} />
              </div>
              <p className="text-xs text-[var(--avad-text-soft)]">Lagos (GMT+1)</p>
              <p className="text-sm text-[var(--avad-text)]">
                <span className="font-semibold">Note:</span> This post will be published automatically within 5
                minutes of the specified time
              </p>
            </div>
          ) : (
            <div className="pt-1 text-sm text-[var(--avad-text)]">
              <span className="font-semibold">Note:</span> Publishing now makes this post immediately available on the
              public community.
            </div>
          )}

          <button
            onClick={() => void saveAndPublish()}
            disabled={saving}
            className="h-10 w-full rounded-full bg-gradient-to-b from-[#c99556] to-[#3a1a56] text-sm text-white disabled:opacity-60"
          >
            {saving
              ? "Working..."
              : mode === "publish"
                ? "Publish Now"
                : "Schedule For Later"}
          </button>

        </div>
      </div>
    </section>
  );
}
