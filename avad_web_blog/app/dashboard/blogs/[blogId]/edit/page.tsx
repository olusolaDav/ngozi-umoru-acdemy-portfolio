"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { BlogEditorForm } from "@/components/dashboard/blogs/blog-editor-form";
import { type BlogSummary } from "@/lib/blog";
import { getJson, patchJson } from "@/lib/http";

type SessionUser = {
  role: "ADMIN" | "MODERATOR" | "BLOGGER" | "MEMBER";
};

type BlogModerationSettings = {
  autoApprovePosts: boolean;
};

export default function EditDashboardBlogPage() {
  const params = useParams<{ blogId: string }>();
  const router = useRouter();
  const [post, setPost] = useState<BlogSummary | null>(null);
  const [session, setSession] = useState<SessionUser | null>(null);
  const [moderation, setModeration] = useState<BlogModerationSettings | null>(null);

  useEffect(() => {
    void Promise.all([
      getJson<BlogSummary>(`/api/dashboard/blogs/${params.blogId}`),
      getJson<SessionUser>("/api/auth/session"),
      getJson<BlogModerationSettings>("/api/dashboard/blogs/settings/moderation").catch(() => null),
    ]).then(([postData, user, moderationSettings]) => {
      setPost(postData);
      setSession(user);
      setModeration(moderationSettings);
    });
  }, [params.blogId]);

  const publishLabel =
    (session?.role === "BLOGGER" || session?.role === "MEMBER") && !moderation?.autoApprovePosts
      ? "Submit for Approval"
      : "Publish";

  if (!post) {
    return <p className="p-6 text-sm text-[var(--avad-text-soft)]">Loading post...</p>;
  }

  return (
    <div className="-m-4 sm:-m-6">
      <BlogEditorForm
        mode="edit"
        post={post}
        publishLabel={publishLabel}
        onBack={() => router.push("/dashboard/blogs")}
        onSave={async (payload) => {
          const updated = await patchJson<BlogSummary>(`/api/dashboard/blogs/${params.blogId}`, payload);
          setPost(updated);
        }}
        onPreview={() => router.push(`/dashboard/blogs/${params.blogId}/preview`)}
        onPublish={() => router.push(`/dashboard/blogs/${params.blogId}/publish`)}
      />
    </div>
  );
}
