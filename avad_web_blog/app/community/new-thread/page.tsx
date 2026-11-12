"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { CommunityEditorForm } from "@/components/dashboard/community/community-editor-form";
import { getJson, patchJson, postJson } from "@/lib/http";

type SessionUser = {
  id: string;
  role: "ADMIN" | "MODERATOR" | "BLOGGER" | "MEMBER";
};

type CreateResponse = {
  id: string;
};

type CommunityModerationSettings = {
  autoApprovePosts: boolean;
};

export default function NewCommunityThreadPage() {
  const router = useRouter();
  const [session, setSession] = useState<SessionUser | null>(null);
  const [sessionResolved, setSessionResolved] = useState(false);
  const [draftId, setDraftId] = useState<string | null>(null);
  const [moderation, setModeration] = useState<CommunityModerationSettings | null>(null);

  useEffect(() => {
    let active = true;

    async function loadSession() {
      try {
        const response = await fetch("/api/auth/session", { cache: "no-store" });
        if (!active) {
          return;
        }

        if (!response.ok) {
          router.push(`/auth/sign-in?next=${encodeURIComponent("/community/new-thread")}`);
          return;
        }

        const payload = (await response.json()) as SessionUser;
        setSession(payload);
        const moderationSettings = await getJson<CommunityModerationSettings>("/api/dashboard/community/settings/moderation").catch(() => null);
        if (!active) {
          return;
        }
        setModeration(moderationSettings);
      } finally {
        if (active) {
          setSessionResolved(true);
        }
      }
    }

    void loadSession();

    return () => {
      active = false;
    };
  }, [router]);

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
      toast.success("Draft created.");
      router.replace(`/community/manage/${created.id}/edit`);
      return;
    }

    await patchJson(`/api/dashboard/community/${draftId}`, payload);
    toast.success("Draft updated.");
  }

  if (!sessionResolved) {
    return <p className="mx-auto max-w-[1320px] px-4 py-10 text-sm text-[var(--avad-text-soft)]">Checking your account...</p>;
  }

  const publishLabel =
    session?.role === "MEMBER" && !moderation?.autoApprovePosts
      ? "Submit for Approval"
      : "Publish";

  return (
    <section className="mx-auto mt-8 w-full max-w-[1320px] px-4 md:px-6 lg:px-8 xl:px-10">
      <h1 className="mb-4 font-serif text-4xl text-[var(--avad-text-strong)]">Create New Thread</h1>
      <CommunityEditorForm
        requiresApproval={session?.role === "BLOGGER" || session?.role === "MEMBER"}
        publishLabel={publishLabel}
        onBack={() => router.push("/community")}
        onSave={createOrUpdateDraft}
        onPreview={() => {
          if (!draftId) {
            toast.error("Save your draft first to preview.");
            return;
          }
          router.push(`/community/manage/${draftId}/preview`);
        }}
        onPublish={() => {
          if (!draftId) {
            toast.error("Save your draft first before publishing.");
            return;
          }
          router.push(`/community/manage/${draftId}/publish`);
        }}
      />
    </section>
  );
}
