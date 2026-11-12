"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { DevotionalEditorForm } from "@/components/dashboard/devotionals/devotional-editor-form";
import { type DevotionalSummary } from "@/lib/devotional";
import { getJson, patchJson } from "@/lib/http";

type SessionUser = {
  role: "ADMIN" | "MODERATOR" | "BLOGGER" | "MEMBER";
};

export default function EditDashboardDevotionalPage() {
  const params = useParams<{ devotionalId: string }>();
  const router = useRouter();
  const [post, setPost] = useState<DevotionalSummary | null>(null);
  const [session, setSession] = useState<SessionUser | null>(null);

  useEffect(() => {
    void Promise.all([
      getJson<DevotionalSummary>(`/api/dashboard/devotionals/${params.devotionalId}`),
      getJson<SessionUser>("/api/auth/session"),
    ]).then(([postData, user]) => {
      setPost(postData);
      setSession(user);
    });
  }, [params.devotionalId]);

  if (!post) {
    return <p className="p-6 text-sm text-[var(--avad-text-soft)]">Loading post...</p>;
  }

  return (
    <div className="-m-4 sm:-m-6">
      <DevotionalEditorForm
        mode="edit"
        post={post}
        isBlogger={session?.role === "BLOGGER"}
        onBack={() => router.push("/dashboard/devotionals")}
        onSave={async (payload) => {
          const updated = await patchJson<DevotionalSummary>(`/api/dashboard/devotionals/${params.devotionalId}`, payload);

          const expectedTruth = payload.truthToReflectOn.trim();
          const expectedPrayer = payload.prayerPoint.trim();
          const truthMismatch = (updated.truthToReflectOn ?? "").trim() !== expectedTruth;
          const prayerMismatch = (updated.prayerPoint ?? "").trim() !== expectedPrayer;

          if (truthMismatch || prayerMismatch) {
            const synced = await patchJson<DevotionalSummary>(`/api/dashboard/devotionals/${params.devotionalId}`, {
              truthToReflectOn: expectedTruth,
              prayerPoint: expectedPrayer,
            });
            setPost(synced);
            return;
          }

          setPost(updated);
        }}
        onPreview={() => router.push(`/dashboard/devotionals/${params.devotionalId}/preview`)}
        onPublish={session?.role === "BLOGGER" ? undefined : () => router.push(`/dashboard/devotionals/${params.devotionalId}/publish`)}
      />
    </div>
  );
}
