"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { CommunityEditorForm } from "@/components/dashboard/community/community-editor-form";
import { type CommunitySummary } from "@/lib/community";
import { getJson, patchJson } from "@/lib/http";

type SessionUser = {
  role: "ADMIN" | "MODERATOR" | "BLOGGER" | "MEMBER";
};

type CommunityModerationSettings = {
  autoApprovePosts: boolean;
};

export default function EditCommunityThreadPage() {
  const params = useParams<{ communityId: string }>();
  const router = useRouter();
  const [post, setPost] = useState<CommunitySummary | null>(null);
  const [session, setSession] = useState<SessionUser | null>(null);
  const [moderation, setModeration] = useState<CommunityModerationSettings | null>(null);

  useEffect(() => {
    void Promise.all([
      getJson<CommunitySummary>(`/api/dashboard/community/${params.communityId}`),
      getJson<SessionUser>("/api/auth/session"),
      getJson<CommunityModerationSettings>("/api/dashboard/community/settings/moderation").catch(() => null),
    ])
      .then(([postData, user, moderationSettings]) => {
        setPost(postData);
        setSession(user);
        setModeration(moderationSettings);
      })
      .catch(() => {
        router.push(`/auth/sign-in?next=${encodeURIComponent(`/community/manage/${params.communityId}/edit`)}`);
      });
  }, [params.communityId, router]);

  if (!post) {
    return <p className="mx-auto max-w-[1320px] px-4 py-10 text-sm text-[var(--avad-text-soft)]">Loading thread...</p>;
  }

  const needsResubmission = Boolean(post.moderationReason) && post.status === "DRAFT";
  const publishLabel =
    (session?.role === "MEMBER" || session?.role === "BLOGGER") && !moderation?.autoApprovePosts
      ? needsResubmission
        ? "Resubmit for Approval"
        : "Submit for Approval"
      : "Publish";

  return (
    <section className="mx-auto mt-8 w-full max-w-[1320px] px-4 md:px-6 lg:px-8 xl:px-10">
      <CommunityEditorForm
        post={post}
        requiresApproval={session?.role === "BLOGGER" || session?.role === "MEMBER"}
        publishLabel={publishLabel}
        onBack={() => router.push("/community")}
        onSave={async (payload) => {
          const updated = await patchJson<CommunitySummary>(`/api/dashboard/community/${params.communityId}`, payload);
          setPost(updated);
        }}
        onPreview={() => router.push(`/community/manage/${params.communityId}/preview`)}
        onPublish={() => router.push(`/community/manage/${params.communityId}/publish`)}
      />
    </section>
  );
}
