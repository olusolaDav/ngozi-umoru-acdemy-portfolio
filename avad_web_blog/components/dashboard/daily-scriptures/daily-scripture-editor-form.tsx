"use client";

import { ArrowLeft, CalendarDays, Save, Send } from "lucide-react";
import { useMemo, useRef, useState } from "react";

import { type DailyScriptureSummary } from "@/lib/daily-scripture";
import { WritingLanguageControl, useWritingLanguage } from "@/components/writing-assistance-provider";
import { WritingSuggestions } from "@/components/writing-suggestions";

type DailyScriptureEditorFormProps = {
  mode: "create" | "edit";
  post?: DailyScriptureSummary;
  onBack: () => void;
  onSave: (payload: {
    verse: string;
    content: string;
    scriptureDate: string;
    excerpt: string;
  }) => Promise<void>;
  onPublish?: () => void;
};

export function DailyScriptureEditorForm({ mode, post, onBack, onSave, onPublish }: DailyScriptureEditorFormProps) {
  const { language } = useWritingLanguage();
  const [verse, setVerse] = useState(post?.verse ?? "");
  const [content, setContent] = useState(post?.content ?? "");
  const [scriptureDate, setScriptureDate] = useState(() => {
    if (!post?.scriptureDate) {
      return "";
    }
    return new Date(post.scriptureDate).toISOString().slice(0, 10);
  });
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const contentRef = useRef<HTMLTextAreaElement | null>(null);

  const canSubmit = useMemo(() => verse.trim().length >= 3 && content.trim().length >= 10 && Boolean(scriptureDate), [verse, content, scriptureDate]);

  async function submit() {
    if (!canSubmit) {
      return;
    }

    setSaving(true);
    try {
      await onSave({
        verse: verse.trim(),
        content: content.trim(),
        scriptureDate: new Date(`${scriptureDate}T00:00:00.000Z`).toISOString(),
        excerpt: content.trim().slice(0, 240),
      });
    } finally {
      setSaving(false);
    }
  }

  async function uploadImage(file: File) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", "daily_scripture_content");
    formData.append("mediaType", "image");

    const response = await fetch("/api/upload/file", {
      method: "POST",
      body: formData,
    });

    const payload = (await response.json().catch(() => ({}))) as {
      data?: { url?: string };
      message?: string;
    };

    if (!response.ok || !payload.data?.url) {
      throw new Error(payload.message ?? "Unable to upload image.");
    }

    return payload.data.url;
  }

  async function handleContentPaste(event: React.ClipboardEvent<HTMLTextAreaElement>) {
    const imageFiles = Array.from(event.clipboardData?.items ?? [])
      .filter((item) => item.type.startsWith("image/"))
      .map((item) => item.getAsFile())
      .filter((file): file is File => Boolean(file));

    if (!imageFiles.length) {
      return;
    }

    event.preventDefault();
    const textarea = contentRef.current;
    if (!textarea) {
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    setUploadingImage(true);

    try {
      const urls: string[] = [];
      for (const file of imageFiles) {
        const uploadedUrl = await uploadImage(file);
        urls.push(uploadedUrl);
      }

      const insertion = urls.join("\n");
      const nextContent = `${content.slice(0, start)}${insertion}${content.slice(end)}`;
      setContent(nextContent);

      const caret = start + insertion.length;
      requestAnimationFrame(() => {
        textarea.focus();
        textarea.setSelectionRange(caret, caret);
      });
    } finally {
      setUploadingImage(false);
    }
  }

  return (
    <section className="overflow-hidden rounded-[22px] border border-[var(--avad-border)] bg-[var(--avad-bg-elevated)]">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--avad-border)] px-4 py-3 sm:px-6">
        <button onClick={onBack} className="inline-flex items-center gap-2 text-sm text-[var(--avad-text-soft)] hover:text-[var(--avad-text-strong)]">
          <ArrowLeft size={15} />
          Back
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => void submit()}
            disabled={!canSubmit || saving}
            className="inline-flex h-9 items-center gap-1 rounded-full border border-[var(--avad-border)] px-4 text-sm text-[var(--avad-text)] disabled:opacity-60"
          >
            <Save size={14} />
            Save to Draft
          </button>

          {onPublish ? (
            <button
              onClick={onPublish}
              className="h-9 rounded-full bg-gradient-to-b from-[#c99556] to-[#3a1a56] px-4 text-sm text-white"
            >
              <span className="inline-flex items-center gap-1">
                <Send size={13} />
                Publish
              </span>
            </button>
          ) : null}
        </div>
      </div>

      <div className="px-4 py-6 sm:px-6">
        <h1 className="font-serif text-[34px] leading-none text-[var(--avad-text-strong)]">
          {mode === "create" ? "New Daily Scripture" : "Edit Daily Scripture"}
        </h1>

        <div className="mt-5 space-y-4">
          <div className="flex justify-end"><WritingLanguageControl /></div>
          <label className="relative block">
            <span className="mb-2 block text-sm font-semibold text-[var(--avad-text)]">Verse</span>
            <input
              data-writing-assistance
              lang={language}
              value={verse}
              onChange={(event) => setVerse(event.target.value)}
              placeholder="Type scripture verse title"
              className="w-full rounded-xl border border-[var(--avad-border)] bg-transparent px-3 py-2 text-sm text-[var(--avad-text)] outline-none"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-[var(--avad-text)]">Content</span>
            <textarea
              data-writing-assistance
              lang={language}
              ref={contentRef}
              value={content}
              onChange={(event) => setContent(event.target.value)}
              onPaste={(event) => {
                void handleContentPaste(event);
              }}
              placeholder="Type scripture content"
              rows={10}
              maxLength={3000}
              className="w-full rounded-xl border border-[var(--avad-border)] bg-transparent px-3 py-2 text-sm text-[var(--avad-text)] outline-none"
            />
            <span className="mt-1 block text-xs text-[var(--avad-text-soft)]">{content.length}/3000</span>
            {uploadingImage ? <span className="mt-1 block text-xs text-[var(--avad-text-soft)]">Uploading pasted image...</span> : null}
            <WritingSuggestions
              text={content}
              onApply={({ problem, replacement, occurrence }) =>
                setContent((current) => {
                  const matches = [...current.matchAll(new RegExp(problem.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g"))];
                  const index = matches[occurrence]?.index;
                  return index === undefined ? current : `${current.slice(0, index)}${replacement}${current.slice(index + problem.length)}`;
                })}
            />
          </label>

          <label className="block rounded-xl border border-[var(--avad-border)] px-3 py-2 text-sm text-[var(--avad-text)]">
            <span className="mb-1 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-[var(--avad-text-soft)]">
              <CalendarDays size={14} />
              Date Of Scripture
            </span>
            <input
              type="date"
              value={scriptureDate}
              onChange={(event) => setScriptureDate(event.target.value)}
              className="w-full border-0 bg-transparent text-[var(--avad-text)] outline-none"
            />
          </label>
        </div>
      </div>
    </section>
  );
}
