"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { CommunityEditorForm } from "@/components/dashboard/community/community-editor-form";
import { type CommunitySummary } from "@/lib/community";
import { getJson, patchJson } from "@/lib/http";

type SessionUser = {
  role: "ADMIN" | "MODERATOR" | "BLOGGER" | "MEMBER";
};

export default function EditDashboardCommunityPage() {
  const params = useParams<{ communityId: string }>();
  const router = useRouter();
  const [post, setPost] = useState<CommunitySummary | null>(null);
  const [session, setSession] = useState<SessionUser | null>(null);

  useEffect(() => {
    void Promise.all([
      getJson<CommunitySummary>(`/api/dashboard/community/${params.communityId}`),
      getJson<SessionUser>("/api/auth/session"),
    ]).then(([postData, user]) => {
      setPost(postData);
      setSession(user);
    });
  }, [params.communityId]);

  if (!post) {
    return <p className="p-6 text-sm text-[var(--avad-text-soft)]">Loading post...</p>;
  }

  return (
    <div className="-m-4 sm:-m-6">
      <CommunityEditorForm
        post={post}
        requiresApproval={session?.role === "BLOGGER" || session?.role === "MEMBER"}
        onBack={() => router.push("/dashboard/community")}
        onSave={async (payload) => {
          const updated = await patchJson<CommunitySummary>(`/api/dashboard/community/${params.communityId}`, payload);
          setPost(updated);
        }}
        onPreview={() => router.push(`/dashboard/community/${params.communityId}/preview`)}
        onPublish={() => router.push(`/dashboard/community/${params.communityId}/publish`)}
      />
    </div>
  );
}
