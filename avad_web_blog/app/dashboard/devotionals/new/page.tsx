"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { useConfirmationDialog } from "@/components/ui/confirmation-dialog-provider";
import { DevotionalEditorForm } from "@/components/dashboard/devotionals/devotional-editor-form";
import { getJson, patchJson, postJson } from "@/lib/http";

type SessionUser = {
  id: string;
  role: "ADMIN" | "MODERATOR" | "BLOGGER" | "MEMBER";
};

type CreateResponse = {
  id: string;
};

export default function NewDashboardDevotionalPage() {
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
    truthToReflectOn: string;
    prayerPoint: string;
    devotionalDate: string;
    excerpt: string;
    metaDescription: string;
    tags: string[];
    thumbnail?: string;
  }) {
    if (!draftId) {
      const created = await postJson<CreateResponse>("/api/dashboard/devotionals", payload);
      setDraftId(created.id);
      router.replace(`/dashboard/devotionals/${created.id}/edit`);
      return;
    }

    await patchJson(`/api/dashboard/devotionals/${draftId}`, payload);
  }

  return (
    <div className="-m-4 sm:-m-6">
      <DevotionalEditorForm
        mode="create"
        isBlogger={session?.role === "BLOGGER"}
        onBack={() => router.push("/dashboard/devotionals")}
        onSave={createOrUpdateDraft}
        onPreview={() => {
          if (!draftId) {
            void confirmation.alert({
              title: "Draft Required",
              description: "Save your draft first before preview.",
            });
            return;
          }
          router.push(`/dashboard/devotionals/${draftId}/preview`);
        }}
        onPublish={
          session?.role === "BLOGGER"
            ? undefined
            : () => {
                if (!draftId) {
                  void confirmation.alert({
                    title: "Draft Required",
                    description: "Save your draft first before publishing.",
                  });
                  return;
                }
                router.push(`/dashboard/devotionals/${draftId}/publish`);
              }
        }
      />
    </div>
  );
}
