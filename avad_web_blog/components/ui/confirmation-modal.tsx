"use client";

import { useEffect } from "react";

import { Button } from "@/components/ui/button";

type ConfirmationModalProps = {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  hideCancel?: boolean;
  loading?: boolean;
  destructive?: boolean;
  promptLabel?: string;
  promptPlaceholder?: string;
  promptValue?: string;
  disableConfirm?: boolean;
  onPromptChange?: (value: string) => void;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmationModal({
  open,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  hideCancel = false,
  loading = false,
  destructive = false,
  promptLabel,
  promptPlaceholder,
  promptValue,
  disableConfirm = false,
  onPromptChange,
  onConfirm,
  onCancel,
}: ConfirmationModalProps) {
  useEffect(() => {
    if (!open) {
      return;
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !loading) {
        onCancel();
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [loading, onCancel, open]);

  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-[#12091d]/55 p-3 sm:flex sm:items-center sm:justify-center sm:p-4"
      onClick={() => {
        if (!loading) {
          onCancel();
        }
      }}
    >
      <div
        className="mx-auto my-3 w-full max-w-md rounded-3xl border border-[var(--avad-border)] bg-[var(--avad-bg-elevated)] p-5 text-[var(--avad-text)] shadow-2xl sm:my-0 sm:p-6"
        onClick={(event) => event.stopPropagation()}
      >
        <h3 className="font-serif text-3xl text-[var(--avad-text-strong)]">{title}</h3>
        <p className="mt-3 text-sm leading-6 text-[var(--avad-text-soft)]">{description}</p>

        {onPromptChange ? (
          <div className="mt-4">
            {promptLabel ? <label className="mb-1 block text-xs font-semibold text-[var(--avad-text-soft)]">{promptLabel}</label> : null}
            <input
              type="text"
              value={promptValue ?? ""}
              placeholder={promptPlaceholder}
              onChange={(event) => onPromptChange(event.target.value)}
              className="h-11 w-full rounded-xl border border-[var(--avad-border)] bg-[var(--avad-bg-soft)] px-3 text-sm text-[var(--avad-text)] outline-none"
            />
          </div>
        ) : null}

        <div className="mt-6 flex flex-wrap items-center justify-end gap-2">
          {!hideCancel ? (
            <Button type="button" variant="ghost" onClick={onCancel} disabled={loading}>
              {cancelLabel}
            </Button>
          ) : null}
          <Button
            type="button"
            onClick={onConfirm}
            disabled={loading || disableConfirm}
            className={destructive ? "bg-[#b42318] hover:bg-[#9b1e14]" : undefined}
          >
            {loading ? "Please wait..." : confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
