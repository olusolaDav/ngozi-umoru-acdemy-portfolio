//apps/web/app/dashboard/community/new/page.tsx
"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { useConfirmationDialog } from "@/components/ui/confirmation-dialog-provider";
import { CommunityEditorForm } from "@/components/dashboard/community/community-editor-form";
import { getJson, patchJson, postJson } from "@/lib/http";

type SessionUser = {
  id: string;
  role: "ADMIN" | "MODERATOR" | "BLOGGER" | "MEMBER";
};

type CreateResponse = {
  id: string;
};

export default function NewDashboardCommunityPage() {
  const router = useRouter();
  const confirmation = useConfirmationDialog();
  const [session, setSession] = useState<SessionUser | null>(null);
  const [draftId, setDraftId] = useState<string | null>(null);

  useEffect(() => {
    void getJson<SessionUser>("/api/auth/session").then(setSession);
  }, []);

  async function createOrUpdateDraft(payload: {
    title: string;
    slug: string;
    content: string;
    prayerPoint: string;
    communityDate: string;
    excerpt: string;
    metaDescription: string;
    tags: string[];
    thumbnail?: string;
  }) {
    if (!draftId) {
      const created = await postJson<CreateResponse>("/api/dashboard/community", payload);
      setDraftId(created.id);
      router.replace(`/dashboard/community/${created.id}/edit`);
      return;
    }

    await patchJson(`/api/dashboard/community/${draftId}`, payload);
  }

  return (
    <div className="-m-4 sm:-m-6">
      <CommunityEditorForm
        requiresApproval={session?.role === "BLOGGER" || session?.role === "MEMBER"}
        onBack={() => router.push("/dashboard/community")}
        onSave={createOrUpdateDraft}
        onPreview={() => {
          if (!draftId) {
            void confirmation.alert({
              title: "Draft Required",
              description: "Save your draft first before preview.",
            });
            return;
          }
          router.push(`/dashboard/community/${draftId}/preview`);
        }}
        onPublish={
          () => {
                if (!draftId) {
                  void confirmation.alert({
                    title: "Draft Required",
                    description: "Save your draft first before publishing.",
                  });
                  return;
                }
                router.push(`/dashboard/community/${draftId}/publish`);
                }
              }
      />
    </div>
  );
}
