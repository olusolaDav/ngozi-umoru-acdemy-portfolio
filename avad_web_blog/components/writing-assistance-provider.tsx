"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

export type WritingLanguage = "en-GB" | "en-US";

const STORAGE_KEY = "avad-writing-language";
const DEFAULT_LANGUAGE: WritingLanguage = "en-GB";

type WritingAssistanceContextValue = {
  language: WritingLanguage;
  setLanguage: (language: WritingLanguage) => void;
};

const WritingAssistanceContext = createContext<WritingAssistanceContextValue | null>(null);

function applyWritingAttributes(language: WritingLanguage) {
  document.querySelectorAll<HTMLElement>("[data-writing-assistance]").forEach((element) => {
    const editableElements = element.matches("textarea, input, [contenteditable='true']")
      ? [element]
      : Array.from(element.querySelectorAll<HTMLElement>("textarea, input, [contenteditable='true']"));

    editableElements.forEach((editable) => {
      editable.lang = language;
      editable.spellcheck = true;
      editable.setAttribute("autocorrect", "on");
      editable.setAttribute("autocapitalize", "sentences");
    });
  });
}

export function WritingAssistanceProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<WritingLanguage>(DEFAULT_LANGUAGE);

  useEffect(() => {
    const savedLanguage = window.localStorage.getItem(STORAGE_KEY);
    if (savedLanguage === "en-GB" || savedLanguage === "en-US") {
      queueMicrotask(() => setLanguageState(savedLanguage));
    }
  }, []);

  useEffect(() => {
    applyWritingAttributes(language);
    const observer = new MutationObserver(() => applyWritingAttributes(language));
    observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ["contenteditable"] });
    return () => observer.disconnect();
  }, [language]);

  const value = useMemo(
    () => ({
      language,
      setLanguage: (nextLanguage: WritingLanguage) => {
        setLanguageState(nextLanguage);
        window.localStorage.setItem(STORAGE_KEY, nextLanguage);
      },
    }),
    [language],
  );

  return <WritingAssistanceContext.Provider value={value}>{children}</WritingAssistanceContext.Provider>;
}

export function useWritingLanguage() {
  const context = useContext(WritingAssistanceContext);
  if (!context) {
    throw new Error("useWritingLanguage must be used inside WritingAssistanceProvider");
  }
  return context;
}

export function WritingLanguageControl() {
  const { language, setLanguage } = useWritingLanguage();

  return (
    <label className="inline-flex items-center gap-2 text-xs text-[var(--avad-text-soft)]">
      <span>Writing language</span>
      <select
        value={language}
        onChange={(event) => setLanguage(event.target.value as WritingLanguage)}
        className="rounded-md border border-[var(--avad-border)] bg-[var(--avad-bg-elevated)] px-2 py-1 text-xs text-[var(--avad-text)] outline-none"
        aria-label="Writing language"
      >
        <option value="en-GB">English (UK)</option>
        <option value="en-US">English (US)</option>
      </select>
    </label>
  );
}
