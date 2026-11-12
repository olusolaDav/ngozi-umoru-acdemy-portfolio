"use client";

import { ArrowLeft } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { firstSentenceFromContent, type CommunitySummary } from "@/lib/community";
import { getJson, patchJson } from "@/lib/http";

type SessionUser = {
  role: "ADMIN" | "MODERATOR" | "BLOGGER" | "MEMBER";
};

export default function PublishCommunityThreadPage() {
  const params = useParams<{ communityId: string }>();
  const router = useRouter();

  const [post, setPost] = useState<CommunitySummary | null>(null);
  const [session, setSession] = useState<SessionUser | null>(null);
  const [tags, setTags] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [saving, setSaving] = useState(false);

  const canDirectPublish = useMemo(() => session?.role === "ADMIN" || session?.role === "MODERATOR", [session?.role]);

  useEffect(() => {
    void Promise.all([
      getJson<CommunitySummary>(`/api/dashboard/community/${params.communityId}`),
      getJson<SessionUser>("/api/auth/session"),
    ])
      .then(([postData, user]) => {
        setPost(postData);
        setSession(user);
        setTags(postData.tags.join(", "));
        setMetaDescription(firstSentenceFromContent(postData.content, 140) || postData.metaDescription || postData.excerpt || "");
      })
      .catch(() => {
        router.push(`/auth/sign-in?next=${encodeURIComponent(`/community/manage/${params.communityId}/publish`)}`);
      });
  }, [params.communityId, router]);

  async function submit() {
    if (!post) {
      return;
    }

    setSaving(true);
    try {
      const cleanTags = tags
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean)
        .slice(0, 5);

      await patchJson(`/api/dashboard/community/${params.communityId}`, {
        title: post.title,
        prayerPoint: post.prayerPoint,
        communityDate: post.communityDate,
        excerpt: metaDescription || firstSentenceFromContent(post.content, 140),
        metaDescription: metaDescription || firstSentenceFromContent(post.content, 140),
        tags: cleanTags,
      });

      const result = await patchJson<CommunitySummary>(`/api/dashboard/community/${params.communityId}/status`, {
        action: "PUBLISH",
      });

      if (result.status === "UNAPPROVED") {
        toast.success(result.submissionCount > 1 ? "Thread resubmitted for approval." : "Thread submitted for approval.");
      } else {
        toast.success("Thread published successfully.");
      }

      router.push("/community");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to submit thread.";
      toast.error(message);
    } finally {
      setSaving(false);
    }
  }

  if (!post) {
    return <p className="mx-auto max-w-[1320px] px-4 py-10 text-sm text-[var(--avad-text-soft)]">Loading publish form...</p>;
  }

  return (
    <section className="mx-auto mt-8 w-full max-w-[1320px] px-4 md:px-6 lg:px-8 xl:px-10">
      <article className="rounded-[24px] border border-[var(--avad-border)] bg-[var(--avad-bg-elevated)] p-5 sm:p-8">
        <div className="mb-4 flex items-center justify-between">
          <button onClick={() => router.push(`/community/manage/${params.communityId}/edit`)} className="inline-flex items-center gap-2 text-sm text-[var(--avad-text-soft)]">
            <ArrowLeft size={14} />
            Back to editor
          </button>
        </div>

        <h1 className="font-serif text-4xl text-[var(--avad-text-strong)]">{canDirectPublish ? "Publish Thread" : "Submit Thread"}</h1>
        <p className="mt-2 text-sm text-[var(--avad-text-soft)]">
          {canDirectPublish
            ? "Publishing now makes this thread immediately available to everyone."
            : "Your thread will be submitted to Admin/Moderator for approval before it goes live."}
        </p>

        <div className="mt-6 grid gap-4">
          <label className="space-y-2">
            <span className="text-sm font-semibold text-[var(--avad-text)]">Tags (up to 5)</span>
            <input
              value={tags}
              onChange={(event) => setTags(event.target.value)}
              placeholder="encouragement, grace, hope"
              className="h-11 w-full rounded-xl border border-[var(--avad-border)] bg-[var(--avad-bg-soft)] px-3 text-sm text-[var(--avad-text)] outline-none"
            />
          </label>

          <label className="space-y-2">
            <span className="text-sm font-semibold text-[var(--avad-text)]">Meta Description</span>
            <textarea
              value={metaDescription}
              onChange={(event) => setMetaDescription(event.target.value.slice(0, 140))}
              className="h-24 w-full rounded-xl border border-[var(--avad-border)] bg-[var(--avad-bg-soft)] px-3 py-2 text-sm text-[var(--avad-text)] outline-none"
            />
            <p className="text-xs text-[var(--avad-text-soft)]">{metaDescription.length}/140</p>
          </label>
        </div>

        <button
          onClick={() => void submit()}
          disabled={saving}
          className="mt-6 h-10 rounded-full bg-gradient-to-b from-[#c99556] to-[#3a1a56] px-6 text-sm text-white disabled:opacity-60"
        >
          {saving ? "Working..." : canDirectPublish ? "Publish Thread" : "Submit for Approval"}
        </button>
      </article>
    </section>
  );
}
