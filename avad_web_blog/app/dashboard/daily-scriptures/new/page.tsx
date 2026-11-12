"use client";

import { useRouter } from "next/navigation";

import { DailyScriptureEditorForm } from "@/components/dashboard/daily-scriptures/daily-scripture-editor-form";
import { postJson } from "@/lib/http";

type CreateResponse = {
  id: string;
};

export default function NewDashboardDailyScripturePage() {
  const router = useRouter();

  return (
    <div className="-m-4 sm:-m-6">
      <DailyScriptureEditorForm
        mode="create"
        onBack={() => router.push("/dashboard/daily-scriptures")}
        onSave={async (payload) => {
          const created = await postJson<CreateResponse>("/api/dashboard/daily-scriptures", payload);
          router.replace(`/dashboard/daily-scriptures/${created.id}/edit`);
        }}
      />
    </div>
  );
}
