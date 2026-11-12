"use client";

import { useEffect, useState } from "react";
import { Dialect, LocalLinter, type Lint } from "harper.js";
import { binaryInlined } from "harper.js/binaryInlined";

import { useWritingLanguage } from "@/components/writing-assistance-provider";

type WritingSuggestion = {
  id: number;
  problem: string;
  message: string;
  suggestions: string[];
  start: number;
};

const BRITISH_SPELLINGS: Record<string, string> = {
  color: "colour",
  favor: "favour",
  favorite: "favourite",
  behavior: "behaviour",
  center: "centre",
  organize: "organise",
  organization: "organisation",
  recognize: "recognise",
  license: "licence",
  canceled: "cancelled",
  traveled: "travelled",
};

function contextualSuggestions(source: string, lint: Lint, language: "en-GB" | "en-US") {
  const problem = lint.get_problem_text();
  const span = lint.span();
  const followingText = source.slice(span.end);
  const dictionarySuggestions = lint.suggestions().slice(0, 3).map((suggestion) => suggestion.get_replacement_text());
  const contextual: string[] = [];
  const britishReplacement = BRITISH_SPELLINGS[problem.toLowerCase()];

  if (language === "en-GB" && britishReplacement) {
    contextual.push(/^[A-Z]/.test(problem) ? `${britishReplacement[0].toUpperCase()}${britishReplacement.slice(1)}` : britishReplacement);
  }

  // Harper correctly identifies the fragment, but short fragments need sentence context.
  // “fo budget-conscious founders” is the common typo “for budget-conscious founders”.
  if (problem.toLowerCase() === "fo" && /^\s+[a-z]/i.test(followingText)) {
    contextual.push("for");
  }

  return Array.from(new Set([...contextual, ...dictionarySuggestions])).slice(0, 3);
}

export function WritingSuggestions({ text, onApply }: { text: string; onApply?: (suggestion: { problem: string; replacement: string; occurrence: number }) => void }) {
  const { language } = useWritingLanguage();
  const [suggestions, setSuggestions] = useState<WritingSuggestion[]>([]);
  const [checking, setChecking] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const activeSuggestion = suggestions[activeIndex];

  useEffect(() => {
    if (!("highlights" in CSS)) return;
    const style = document.createElement("style");
    style.dataset.avadWritingHighlight = "true";
    style.textContent = `::highlight(avad-writing-issue) { text-decoration-line: underline; text-decoration-style: wavy; text-decoration-color: #d62839; text-decoration-thickness: 1.5px; background-color: color-mix(in srgb, #d62839 10%, transparent); }`;
    document.head.appendChild(style);
    return () => style.remove();
  }, []);

  useEffect(() => {
    const editor = document.querySelector<HTMLElement>("[data-writing-assistance] [contenteditable='true']");
    const cssHighlights = (CSS as typeof CSS & { highlights?: { set: (name: string, highlight: unknown) => void; delete: (name: string) => void } }).highlights;
    if (!editor || !cssHighlights || !activeSuggestion?.problem) {
      return;
    }

    const walker = document.createTreeWalker(editor, NodeFilter.SHOW_TEXT);
    const nodes: Text[] = [];
    let node: Node | null;
    while ((node = walker.nextNode())) {
      if (node.textContent) nodes.push(node as Text);
    }

    const source = nodes.map((textNode) => textNode.textContent ?? "").join("");
    const occurrence = text.slice(0, activeSuggestion.start).split(activeSuggestion.problem).length - 1;
    let start = -1;
    let searchFrom = 0;
    for (let matchIndex = 0; matchIndex <= occurrence; matchIndex += 1) {
      start = source.indexOf(activeSuggestion.problem, searchFrom);
      if (start < 0) break;
      searchFrom = start + activeSuggestion.problem.length;
    }
    if (start < 0) return;

    let cursor = 0;
    let startNode: Text | undefined;
    let endNode: Text | undefined;
    let startOffset = 0;
    let endOffset = 0;
    for (const textNode of nodes) {
      const end = cursor + (textNode.textContent?.length ?? 0);
      if (!startNode && start >= cursor && start < end) {
        startNode = textNode;
        startOffset = start - cursor;
      }
      const issueEnd = start + activeSuggestion.problem.length;
      if (issueEnd > cursor && issueEnd <= end) {
        endNode = textNode;
        endOffset = issueEnd - cursor;
        break;
      }
      cursor = end;
    }

    if (!startNode || !endNode) return;
    const range = new Range();
    range.setStart(startNode, startOffset);
    range.setEnd(endNode, endOffset);
    const Highlight = (window as typeof window & { Highlight?: new (...ranges: Range[]) => unknown }).Highlight;
    if (Highlight) {
      cssHighlights.set("avad-writing-issue", new Highlight(range));
    }
    return () => {
      cssHighlights.delete("avad-writing-issue");
    };
  }, [activeSuggestion, text]);

  useEffect(() => {
    let cancelled = false;
    const timer = window.setTimeout(async () => {
      const source = text.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
      if (source.length < 3) {
        setSuggestions([]);
        return;
      }

      setChecking(true);
      const linter = new LocalLinter({ binary: binaryInlined, dialect: language === "en-GB" ? Dialect.British : Dialect.American });
      try {
        await linter.setup();
        const lints = await linter.lint(source, { language: "plaintext", dedup: true });
        if (!cancelled) {
          setSuggestions(
            lints.slice(0, 12).map((lint, id) => ({
              id,
              problem: lint.get_problem_text(),
              message: lint.message(),
              suggestions: contextualSuggestions(source, lint, language),
              start: lint.span().start,
            })),
          );
          setActiveIndex(0);
        }
      } catch {
        if (!cancelled) setSuggestions([]);
      } finally {
        await linter.dispose();
        if (!cancelled) setChecking(false);
      }
    }, 700);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [language, text]);

  if (!checking && !activeSuggestion) return null;

  return (
    <aside className="absolute bottom-4 right-4 z-20 w-[min(420px,calc(100%-2rem))] overflow-hidden rounded-xl border border-[var(--avad-border)] bg-[var(--avad-bg-elevated)] text-sm shadow-[0_12px_35px_rgba(0,0,0,0.2)]" aria-live="polite">
      <header className="flex items-center justify-between border-b border-[var(--avad-border)] px-4 py-3">
        <p className="font-semibold text-[var(--avad-text-strong)]">Review suggestion <span className="text-xs text-[var(--avad-text-soft)]">{activeIndex + 1} of {suggestions.length}</span></p>
        <button type="button" onClick={() => setSuggestions([])} className="text-lg leading-none text-[var(--avad-text-soft)]" aria-label="Close writing suggestions">×</button>
      </header>
      {checking ? <p className="px-4 py-3 text-xs text-[var(--avad-text-soft)]">Checking grammar and spelling…</p> : null}
      {activeSuggestion ? (
        <div className="px-4 py-4">
          <p className="text-xs text-[var(--avad-text-soft)]"><span className="font-semibold text-[#c62828] [text-decoration-line:underline] [text-decoration-style:wavy] [text-decoration-color:#c62828]">{activeSuggestion.problem}</span> — {activeSuggestion.message}</p>
          {activeSuggestion.suggestions.length ? (
            <div className="mt-4 flex flex-wrap gap-2">
              {activeSuggestion.suggestions.map((replacement) => (
                <button key={replacement} type="button" disabled={!onApply} onClick={() => onApply?.({ problem: activeSuggestion.problem, replacement, occurrence: text.slice(0, activeSuggestion.start).split(activeSuggestion.problem).length - 1 })} className="rounded-md bg-[var(--avad-bg-soft)] px-3 py-1.5 text-xs font-semibold text-[var(--avad-ring)] disabled:cursor-default disabled:opacity-60">
                  {replacement}
                </button>
              ))}
            </div>
          ) : null}
          <div className="mt-4 flex items-center gap-4">
            <button type="button" disabled={!activeSuggestion.suggestions.length || !onApply} onClick={() => onApply?.({ problem: activeSuggestion.problem, replacement: activeSuggestion.suggestions[0], occurrence: text.slice(0, activeSuggestion.start).split(activeSuggestion.problem).length - 1 })} className="rounded-md bg-[#087f6e] px-3 py-2 text-xs font-bold text-white disabled:opacity-50">Accept</button>
            <button type="button" onClick={() => setActiveIndex((index) => Math.min(index + 1, suggestions.length))} className="text-xs font-semibold text-[var(--avad-text-soft)]">Dismiss</button>
            <span className="ml-auto flex gap-3">
              <button type="button" disabled={activeIndex === 0} onClick={() => setActiveIndex((index) => Math.max(0, index - 1))} aria-label="Previous suggestion" className="text-lg text-[var(--avad-text-soft)] disabled:opacity-30">‹</button>
              <button type="button" disabled={activeIndex >= suggestions.length - 1} onClick={() => setActiveIndex((index) => Math.min(suggestions.length - 1, index + 1))} aria-label="Next suggestion" className="text-lg text-[var(--avad-text-soft)] disabled:opacity-30">›</button>
            </span>
          </div>
        </div>
      ) : null}
    </aside>
  );
}
