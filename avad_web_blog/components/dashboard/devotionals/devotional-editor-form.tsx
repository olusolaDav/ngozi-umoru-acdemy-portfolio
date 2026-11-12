"use client";

import { ArrowLeft, CalendarDays, Clock3, Eye, FileText, Save, Send } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import type ReactQuill from "react-quill-new";
import slugify from "slugify";
import { toast } from "sonner";

import {
  estimateReadTimeFromContent,
  excerptFromContent,
  firstSentenceFromContent,
  stripHtml,
  type DevotionalSummary,
} from "@/lib/devotional";
import { labelRichEditorToolbar } from "@/lib/rich-editor-toolbar";
import { WritingLanguageControl, useWritingLanguage } from "@/components/writing-assistance-provider";
import { WritingSuggestions } from "@/components/writing-suggestions";

import "react-quill-new/dist/quill.snow.css";

const ReactQuillEditor = dynamic(() => import("react-quill-new"), { ssr: false }) as unknown as typeof ReactQuill;

const QUILL_TEXT_COLORS: Array<string | false> = [
  false,
  "var(--editor-text-ink)",
  "var(--editor-text-charcoal)",
  "var(--editor-text-slate)",
  "var(--editor-text-deep-red)",
  "var(--editor-text-umber)",
  "var(--editor-text-olive)",
  "var(--editor-text-forest)",
  "var(--editor-text-royal)",
  "var(--editor-text-indigo)",
  "var(--editor-text-plum)",
  "var(--editor-text-rose)",
];

const QUILL_BACKGROUND_COLORS: Array<string | false> = [
  false,
  "#ffffff",
  "#fef3c7",
  "#fde68a",
  "#ffedd5",
  "#dcfce7",
  "#dbeafe",
  "#ede9fe",
  "#fae8ff",
  "#ffe4e6",
];

type DevotionalEditorFormProps = {
  mode: "create" | "edit";
  post?: DevotionalSummary;
  isBlogger: boolean;
  onBack: () => void;
  onSave: (payload: {
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
  }) => Promise<void>;
  onPreview?: () => void;
  onPublish?: () => void;
};

export function DevotionalEditorForm({ mode, post, isBlogger, onBack, onSave, onPreview, onPublish }: DevotionalEditorFormProps) {
  const { language } = useWritingLanguage();
  const [title, setTitle] = useState(post?.title ?? "");
  const [slug, setSlug] = useState(post?.slug ?? slugify(post?.title ?? "", { lower: true, strict: true }));
  const [content, setContent] = useState(post?.content ?? "");
  const [truthToReflectOn, setTruthToReflectOn] = useState(post?.truthToReflectOn ?? "");
  const [prayerPoint, setPrayerPoint] = useState(post?.prayerPoint ?? "");
  const [devotionalDate, setDevotionalDate] = useState(() => {
    if (!post?.devotionalDate) {
      return "";
    }
    return new Date(post.devotionalDate).toISOString().slice(0, 10);
  });
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [uploading, setUploading] = useState<"idle" | "image" | "video">("idle");
  const [pendingUpload, setPendingUpload] = useState<"image" | "video">("image");

  const quillRef = useRef<ReactQuill | null>(null);
  const lastSelectionRef = useRef<{ index: number; length: number } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const truthToReflectOnRef = useRef<HTMLTextAreaElement | null>(null);
  const prayerPointRef = useRef<HTMLTextAreaElement | null>(null);

  const baseMeta = useMemo(
    () => ({
      tags: post?.tags ?? [],
      metaDescription: post?.metaDescription ?? "",
      excerpt: post?.excerpt ?? "",
      thumbnail: post?.thumbnail ?? "",
    }),
    [post],
  );

  const plainText = useMemo(() => stripHtml(content), [content]);
  const wordCount = useMemo(() => (plainText ? plainText.split(/\s+/).filter(Boolean).length : 0), [plainText]);
  const readingTime = useMemo(() => estimateReadTimeFromContent(content), [content]);

  const canSubmit = useMemo(() => {
    return title.trim().length > 2 && plainText.length > 8 && Boolean(devotionalDate);
  }, [title, plainText, devotionalDate]);

  const openUploadPicker = useCallback((kind: "image" | "video") => {
    setPendingUpload(kind);
    fileInputRef.current?.click();
  }, []);

  const toggleQuoteSelection = useCallback(() => {
    const editor = quillRef.current?.getEditor?.();
    if (!editor) {
      return;
    }

    const currentRange = editor.getSelection();
    const savedRange = (editor as { selection?: { savedRange?: { index: number; length: number } } }).selection?.savedRange;
    const range = currentRange ?? lastSelectionRef.current ?? savedRange;
    if (!range) {
      return;
    }

    const normalizedRange = { index: range.index, length: range.length };
    editor.focus();
    editor.setSelection(normalizedRange.index, normalizedRange.length, "silent");
    lastSelectionRef.current = normalizedRange;

    if (normalizedRange.length === 0) {
      const shouldRemove = Boolean(editor.getFormat(normalizedRange.index, 1).blockquote);
      editor.formatLine(normalizedRange.index, 1, "blockquote", !shouldRemove, "user");
      return;
    }

    const selectedText = editor.getText(normalizedRange.index, normalizedRange.length);
    const trimmedSelectionLength = selectedText.replace(/\n+$/g, "").length;
    if (trimmedSelectionLength <= 0) {
      return;
    }

    const startIndex = normalizedRange.index;
    const endIndex = normalizedRange.index + trimmedSelectionLength - 1;
    const [startLine, startOffset] = editor.getLine(startIndex);
    if (!startLine) {
      return;
    }

    const [endLine] = editor.getLine(endIndex);
    if (!endLine) {
      return;
    }

    const start = startIndex - startOffset;
    const end = editor.getIndex(endLine) + endLine.length();
    const span = Math.max(1, end - start);
    const lines = editor.getLines(start, span);
    const shouldRemove = lines.length > 0 && lines.every((line: { formats?: () => { blockquote?: boolean } }) => Boolean(line.formats?.().blockquote));

    let cursor = start;
    lines.forEach((line: { length: () => number }) => {
      const lineLength = Math.max(1, line.length());
      editor.formatLine(cursor, lineLength, "blockquote", !shouldRemove, "user");
      cursor += lineLength;
    });
  }, []);

  const toggleInlineCodeSelection = useCallback(() => {
    const editor = quillRef.current?.getEditor?.();
    if (!editor) {
      return;
    }

    const range = editor.getSelection();
    if (!range || range.length === 0) {
      return;
    }

    const shouldRemove = Boolean(editor.getFormat(range).code);
    editor.format("code", !shouldRemove, "user");
  }, []);

  const quillModules = useMemo(
    () => ({
      toolbar: {
        container: [
          [{ header: [1, 2, 3, false] }],
          [{ font: [] }, { size: ["small", false, "large", "huge"] }],
          ["bold", "italic", "underline", "strike"],
          [{ color: QUILL_TEXT_COLORS }, { background: QUILL_BACKGROUND_COLORS }],
          [{ align: [] }],
          [{ list: "ordered" }, { list: "bullet" }],
          [{ indent: "-1" }, { indent: "+1" }],
          ["blockquote", "code"],
          ["link", "image", "video"],
          ["clean"],
        ],
        handlers: {
          image: () => openUploadPicker("image"),
          video: () => openUploadPicker("video"),
          blockquote: () => toggleQuoteSelection(),
          code: () => toggleInlineCodeSelection(),
        },
      },
      history: {
        delay: 1000,
        maxStack: 100,
        userOnly: true,
      },
    }),
    [openUploadPicker, toggleInlineCodeSelection, toggleQuoteSelection],
  );

  const quillFormats = [
    "header",
    "font",
    "size",
    "bold",
    "italic",
    "underline",
    "strike",
    "color",
    "background",
    "align",
    "list",
    "indent",
    "blockquote",
    "code",
    "link",
    "image",
    "video",
  ];

  function firstImageFromHtml(html: string) {
    const match = html.match(/<img[^>]+src=\"([^\">]+)\"/);
    return match?.[1] ?? "";
  }

  useEffect(() => {
    if (!post) {
      return;
    }

    queueMicrotask(() => {
      setTitle(post.title ?? "");
      setSlug(post.slug ?? slugify(post.title ?? "", { lower: true, strict: true }));
      setContent(post.content ?? "");
      setTruthToReflectOn(post.truthToReflectOn ?? "");
      setPrayerPoint(post.prayerPoint ?? "");
      setDevotionalDate(post.devotionalDate ? new Date(post.devotionalDate).toISOString().slice(0, 10) : "");
    });
  }, [post]);

  async function uploadMedia(file: File, kind: "image" | "video") {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", "devotional_content");
    formData.append("mediaType", kind);

    const response = await fetch("/api/upload/file", {
      method: "POST",
      body: formData,
    });

    const payload = (await response.json().catch(() => ({}))) as {
      data?: { url?: string };
      message?: string;
    };

    if (!response.ok || !payload.data?.url) {
      throw new Error(payload.message ?? "Unable to upload file.");
    }

    return payload.data.url;
  }

  const insertUploadedImageFiles = useCallback(async (files: File[]) => {
    const editor = quillRef.current?.getEditor?.();
    if (!editor || files.length === 0) {
      return;
    }

    setUploading("image");
    try {
      const range = editor.getSelection(true) ?? { index: editor.getLength(), length: 0 };
      let insertIndex = range.index;

      for (const file of files) {
        const mediaUrl = await uploadMedia(file, "image");
        editor.insertEmbed(insertIndex, "image", mediaUrl, "user");
        insertIndex += 1;
        editor.insertText(insertIndex, "\n", "user");
        insertIndex += 1;
      }

      editor.setSelection(insertIndex, 0);
    } finally {
      setUploading("idle");
    }
  }, []);

  const handleEditorPasteCapture = useCallback((event: React.ClipboardEvent<HTMLDivElement>) => {
    const clipboardItems = Array.from(event.clipboardData?.items ?? []);
    const imageFiles = clipboardItems
      .filter((item) => item.type.startsWith("image/"))
      .map((item) => item.getAsFile())
      .filter((file): file is File => Boolean(file));

    if (!imageFiles.length) {
      return;
    }

    event.preventDefault();
    void insertUploadedImageFiles(imageFiles);
  }, [insertUploadedImageFiles]);

  useEffect(() => {
    const editorInstance = quillRef.current?.getEditor?.();
    if (!editorInstance) {
      return;
    }

    const root = editorInstance.root as HTMLElement;
    const toolbar = editorInstance.container.parentElement?.querySelector<HTMLElement>(".ql-toolbar");
    if (toolbar) {
      labelRichEditorToolbar(toolbar);
    }

    const captureSelection = () => {
      const range = editorInstance.getSelection();
      if (range) {
        lastSelectionRef.current = { index: range.index, length: range.length };
      }
    };

    root.addEventListener("keyup", captureSelection);
    root.addEventListener("mouseup", captureSelection);

    return () => {
      root.removeEventListener("keyup", captureSelection);
      root.removeEventListener("mouseup", captureSelection);
    };
  }, []);

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const editor = quillRef.current?.getEditor?.();
    if (!editor) {
      return;
    }

    setUploading(pendingUpload);
    try {
      if (pendingUpload === "image") {
        await insertUploadedImageFiles([file]);
      } else {
        const mediaUrl = await uploadMedia(file, pendingUpload);
        const range = editor.getSelection(true) ?? { index: editor.getLength(), length: 0 };
        editor.clipboard.dangerouslyPasteHTML(
          range.index,
          `<p><video controls preload="metadata" src="${mediaUrl}" style="max-width:100%;border-radius:12px;"></video></p>`,
        );
        editor.setSelection(range.index + 1, 0);
      }
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      setUploading("idle");
    }
  }

  async function submit(): Promise<boolean> {
    if (!canSubmit) {
      return false;
    }

    const truthToReflectOnValue = (truthToReflectOnRef.current?.value ?? truthToReflectOn).trim();
    const prayerPointValue = (prayerPointRef.current?.value ?? prayerPoint).trim();

    setSaving(true);
    setSaveStatus("saving");
    try {
      await onSave({
        title: title.trim(),
        slug: slugify(title, { lower: true, strict: true }).trim(),
        content,
        truthToReflectOn: truthToReflectOnValue,
        prayerPoint: prayerPointValue,
        devotionalDate: new Date(`${devotionalDate}T00:00:00.000Z`).toISOString(),
        excerpt: baseMeta.excerpt || excerptFromContent(content),
        metaDescription: baseMeta.metaDescription || firstSentenceFromContent(content, 140),
        tags: baseMeta.tags,
        thumbnail: firstImageFromHtml(content) || baseMeta.thumbnail || undefined,
      });
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 1800);
      return true;
    } catch (error) {
      setSaveStatus("idle");
      const message = error instanceof Error ? error.message : "Unable to save draft right now.";
      toast.error(message);
      return false;
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="overflow-visible rounded-[22px] border border-[var(--avad-border)] bg-[var(--avad-bg-elevated)]">
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

          {onPreview ? (
            <button
              onClick={onPreview}
              className="inline-flex h-9 items-center gap-1 rounded-full border border-[var(--avad-border)] px-3 text-sm text-[var(--avad-text)]"
            >
              <Eye size={14} />
              Preview
            </button>
          ) : null}

          {!isBlogger && onPublish ? (
            <button
              onClick={() => {
                void submit().then((saved) => {
                  if (saved) {
                    void onPublish();
                  }
                });
              }}
              disabled={!canSubmit || saving}
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

      <div className="border-b border-[var(--avad-border)] px-4 py-4 sm:px-6">
        <label className="block">
          <span className="mb-1 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-[var(--avad-text-soft)]">
            Title
          </span>
          <input
            data-writing-assistance
            lang={language}
            value={title}
            onChange={(event) => {
              const nextTitle = event.target.value;
              setTitle(nextTitle);
              setSlug(slugify(nextTitle, { lower: true, strict: true }));
            }}
            className="w-full border-0 border-b border-[var(--avad-border)] bg-transparent px-0 py-1 text-[34px] leading-none text-[var(--avad-text-strong)] outline-none placeholder:text-[var(--avad-text-soft)]"
            placeholder="Title"
          />
        </label>

        <p className="mt-2 text-sm text-[var(--avad-text-soft)]">Slug: {slug || "-"}</p>

        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <label className="rounded-xl border border-[var(--avad-border)] px-3 py-2 text-sm text-[var(--avad-text)]">
            <span className="mb-1 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-[var(--avad-text-soft)]">
              A Truth to Reflect On
            </span>
            <textarea
              data-writing-assistance
              lang={language}
              ref={truthToReflectOnRef}
              value={truthToReflectOn}
              onChange={(event) => setTruthToReflectOn(event.target.value)}
              rows={3}
              className="w-full resize-y border-0 bg-transparent text-[var(--avad-text)] outline-none"
              placeholder="Optional"
            />
          </label>
          <label className="rounded-xl border border-[var(--avad-border)] px-3 py-2 text-sm text-[var(--avad-text)]">
            <span className="mb-1 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-[var(--avad-text-soft)]">
              <CalendarDays size={14} />
              Date Of Devotional
            </span>
            <input
              type="date"
              value={devotionalDate}
              onChange={(event) => setDevotionalDate(event.target.value)}
              className="w-full border-0 bg-transparent text-[var(--avad-text)] outline-none"
            />
          </label>
        </div>

        <label className="mt-3 block rounded-xl border border-[var(--avad-border)] px-3 py-2 text-sm text-[var(--avad-text)]">
          <span className="mb-1 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-[var(--avad-text-soft)]">
            Prayer Point
          </span>
          <textarea
            data-writing-assistance
            lang={language}
            ref={prayerPointRef}
            value={prayerPoint}
            onChange={(event) => setPrayerPoint(event.target.value)}
            rows={3}
            className="w-full resize-y border-0 bg-transparent text-[var(--avad-text)] outline-none"
            placeholder="Optional"
          />
        </label>

        <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-[var(--avad-text-soft)]">
          <span className="inline-flex items-center gap-1">
            <FileText size={13} />
            {wordCount} words
          </span>
          <span className="inline-flex items-center gap-1">
            <Clock3 size={13} />
            {readingTime} min read
          </span>
          <span className="ml-auto text-[var(--avad-text-soft)]">
            {uploading !== "idle"
              ? `Uploading ${uploading}...`
              : saveStatus === "saving"
                ? "Saving draft..."
                : saveStatus === "saved"
                  ? "Draft saved"
                  : ""}
          </span>
        </div>
      </div>

      <div className="bg-[var(--avad-bg)] p-4 sm:p-6">
        <div className="mx-auto max-w-[960px] overflow-visible rounded-[10px] border border-[var(--avad-border)] bg-[var(--avad-bg-elevated)] shadow-[0_8px_35px_rgba(33,16,56,0.08)] dark:shadow-[0_8px_35px_rgba(0,0,0,0.38)]">
          <div className="flex justify-end border-b border-[var(--avad-border)] px-3 py-2"><WritingLanguageControl /></div>
          <div data-writing-assistance className="relative devotional-docs-editor dashboard-rich-editor" onPasteCapture={handleEditorPasteCapture}>
            <ReactQuillEditor
              ref={quillRef}
              theme="snow"
              value={content}
              onChange={setContent}
              onChangeSelection={(range) => {
                if (range) {
                  lastSelectionRef.current = { index: range.index, length: range.length };
                }
              }}
              modules={quillModules}
              formats={quillFormats}
              placeholder="Write your story..."
              className="min-h-[62vh]"
            />
            <WritingSuggestions
              text={plainText}
              onApply={({ problem, replacement, occurrence }) => {
                const editor = quillRef.current?.getEditor?.();
                const source = editor?.getText() ?? "";
                const matches = [...source.matchAll(new RegExp(problem.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g"))];
                const index = matches[occurrence]?.index ?? -1;
                if (editor && index >= 0) {
                  editor.deleteText(index, problem.length, "user");
                  editor.insertText(index, replacement, "user");
                  editor.setSelection(index + replacement.length, 0, "silent");
                }
              }}
            />
            <input
              ref={fileInputRef}
              type="file"
              accept={pendingUpload === "video" ? "video/*" : "image/*"}
              className="hidden"
              onChange={(event) => void handleFileChange(event)}
            />
          </div>
        </div>
      </div>

      <div className="border-t border-[var(--avad-border)] px-4 py-3 text-sm text-[var(--avad-text-soft)] sm:px-6">
        {mode === "create"
          ? "Posts created by bloggers are always saved as drafts until an Admin or Moderator publishes them."
          : "Updates are saved in draft state for blogger accounts."}
      </div>
    </section>
  );
}
