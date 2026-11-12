"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { DailyScriptureEditorForm } from "@/components/dashboard/daily-scriptures/daily-scripture-editor-form";
import { type DailyScriptureSummary } from "@/lib/daily-scripture";
import { getJson, patchJson } from "@/lib/http";

export default function EditDashboardDailyScripturePage() {
  const params = useParams<{ scriptureId: string }>();
  const router = useRouter();
  const [post, setPost] = useState<DailyScriptureSummary | null>(null);

  useEffect(() => {
    let mounted = true;

    void getJson<DailyScriptureSummary>(`/api/dashboard/daily-scriptures/${params.scriptureId}`)
      .then((postData) => {
        if (!mounted) {
          return;
        }

        setPost(postData);
      })
      .catch(() => {
        if (mounted) {
          router.replace("/auth/sign-in");
        }
      });

    return () => {
      mounted = false;
    };
  }, [params.scriptureId, router]);

  if (!post) {
    return <p className="p-6 text-sm text-[var(--avad-text-soft)]">Loading daily scripture...</p>;
  }

  return (
    <div className="-m-4 sm:-m-6">
      <DailyScriptureEditorForm
        mode="edit"
        post={post}
        onBack={() => router.push("/dashboard/daily-scriptures")}
        onSave={async (payload) => {
          const updated = await patchJson<DailyScriptureSummary>(`/api/dashboard/daily-scriptures/${params.scriptureId}`, payload);
          setPost(updated);
        }}
        onPublish={async () => {
          await patchJson(`/api/dashboard/daily-scriptures/${params.scriptureId}/status`, { action: "PUBLISH" });
          router.push("/dashboard/daily-scriptures");
        }}
      />
    </div>
  );
}
