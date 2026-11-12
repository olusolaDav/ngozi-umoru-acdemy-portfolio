"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { useConfirmationDialog } from "@/components/ui/confirmation-dialog-provider";
import { BlogEditorForm } from "@/components/dashboard/blogs/blog-editor-form";
import { getJson, patchJson, postJson } from "@/lib/http";

type SessionUser = {
  id: string;
  role: "ADMIN" | "MODERATOR" | "BLOGGER" | "MEMBER";
};

type BlogModerationSettings = {
  autoApprovePosts: boolean;
};

type CreateResponse = {
  id: string;
};

export default function NewDashboardBlogPage() {
  const router = useRouter();
  const confirmation = useConfirmationDialog();
  const [session, setSession] = useState<SessionUser | null>(null);
  const [moderation, setModeration] = useState<BlogModerationSettings | null>(null);
  const [draftId, setDraftId] = useState<string | null>(null);

  useEffect(() => {
    void Promise.all([
      getJson<SessionUser>("/api/auth/session"),
      getJson<BlogModerationSettings>("/api/dashboard/blogs/settings/moderation").catch(() => null),
    ]).then(([user, moderationSettings]) => {
      setSession(user);
      setModeration(moderationSettings);
    });
  }, []);

  const publishLabel =
    (session?.role === "BLOGGER" || session?.role === "MEMBER") && !moderation?.autoApprovePosts
      ? "Submit for Approval"
      : "Publish";

  async function createOrUpdateDraft(payload: {
    title: string;
    slug: string;
    content: string;
    excerpt: string;
    metaDescription: string;
    tags: string[];
    thumbnail?: string;
  }) {
    if (!draftId) {
      const created = await postJson<CreateResponse>("/api/dashboard/blogs", payload);
      setDraftId(created.id);
      router.replace(`/dashboard/blogs/${created.id}/edit`);
      return;
    }

    await patchJson(`/api/dashboard/blogs/${draftId}`, payload);
  }

  return (
    <div className="-m-4 sm:-m-6">
      <BlogEditorForm
        mode="create"
        publishLabel={publishLabel}
        onBack={() => router.push("/dashboard/blogs")}
        onSave={createOrUpdateDraft}
        onPreview={() => {
          if (!draftId) {
            void confirmation.alert({
              title: "Draft Required",
              description: "Save your draft first before preview.",
            });
            return;
          }
          router.push(`/dashboard/blogs/${draftId}/preview`);
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
            router.push(`/dashboard/blogs/${draftId}/publish`);
          }
        }
      />
    </div>
  );
}
