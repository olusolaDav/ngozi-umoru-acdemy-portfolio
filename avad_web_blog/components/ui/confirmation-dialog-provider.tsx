"use client";

import { createContext, useCallback, useContext, useRef, useState } from "react";

import { ConfirmationModal } from "@/components/ui/confirmation-modal";

type ConfirmDialogOptions = {
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
};

type AlertDialogOptions = {
  title?: string;
  description: string;
  confirmLabel?: string;
};

type PromptDialogOptions = {
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  placeholder?: string;
  defaultValue?: string;
  required?: boolean;
};

type DialogState =
  | ({
      type: "confirm";
    } & ConfirmDialogOptions)
  | ({
      type: "alert";
    } & AlertDialogOptions)
  | ({
      type: "prompt";
    } & PromptDialogOptions);

type ConfirmationDialogContextValue = {
  confirm: (options: ConfirmDialogOptions) => Promise<boolean>;
  alert: (options: AlertDialogOptions) => Promise<void>;
  prompt: (options: PromptDialogOptions) => Promise<string | null>;
};

const ConfirmationDialogContext = createContext<ConfirmationDialogContextValue | null>(null);

export function ConfirmationDialogProvider({ children }: { children: React.ReactNode }) {
  const [dialog, setDialog] = useState<DialogState | null>(null);
  const [promptValue, setPromptValue] = useState("");
  const confirmResolverRef = useRef<((value: boolean) => void) | null>(null);
  const promptResolverRef = useRef<((value: string | null) => void) | null>(null);

  const closeDialog = useCallback((value: boolean) => {
    const activeDialog = dialog;
    const confirmResolver = confirmResolverRef.current;
    const promptResolver = promptResolverRef.current;
    confirmResolverRef.current = null;
    promptResolverRef.current = null;
    setDialog(null);
    setPromptValue("");

    if (activeDialog?.type === "prompt") {
      if (!value) {
        promptResolver?.(null);
        return;
      }

      const normalized = promptValue.trim();
      promptResolver?.(normalized.length ? normalized : null);
      return;
    }

    confirmResolver?.(value);
  }, [dialog, promptValue]);

  const confirm = useCallback((options: ConfirmDialogOptions) => {
    return new Promise<boolean>((resolve) => {
      confirmResolverRef.current = resolve;
      setDialog({
        type: "confirm",
        ...options,
      });
    });
  }, []);

  const alert = useCallback((options: AlertDialogOptions) => {
    return new Promise<void>((resolve) => {
      confirmResolverRef.current = () => resolve();
      setDialog({
        type: "alert",
        title: options.title ?? "Notice",
        description: options.description,
        confirmLabel: options.confirmLabel ?? "OK",
      });
    });
  }, []);

  const prompt = useCallback((options: PromptDialogOptions) => {
    return new Promise<string | null>((resolve) => {
      promptResolverRef.current = resolve;
      setPromptValue(options.defaultValue ?? "");
      setDialog({
        type: "prompt",
        ...options,
      });
    });
  }, []);

  const promptRequired = dialog?.type === "prompt" ? dialog.required ?? true : false;
  const promptInvalid = dialog?.type === "prompt" && promptRequired && promptValue.trim().length === 0;

  return (
    <ConfirmationDialogContext.Provider value={{ confirm, alert, prompt }}>
      {children}
      <ConfirmationModal
        open={Boolean(dialog)}
        title={dialog?.title ?? "Confirm"}
        description={dialog?.description ?? ""}
        confirmLabel={dialog?.confirmLabel ?? "Confirm"}
        cancelLabel={dialog?.type === "confirm" || dialog?.type === "prompt" ? dialog.cancelLabel ?? "Cancel" : "Cancel"}
        hideCancel={dialog?.type === "alert"}
        destructive={dialog?.type === "confirm" ? dialog.destructive : false}
        promptLabel={dialog?.type === "prompt" ? "Reason" : undefined}
        promptPlaceholder={dialog?.type === "prompt" ? dialog.placeholder ?? "Enter a reason" : undefined}
        promptValue={dialog?.type === "prompt" ? promptValue : undefined}
        onPromptChange={dialog?.type === "prompt" ? setPromptValue : undefined}
        disableConfirm={Boolean(promptInvalid)}
        onCancel={() => closeDialog(false)}
        onConfirm={() => closeDialog(true)}
      />
    </ConfirmationDialogContext.Provider>
  );
}

export function useConfirmationDialog() {
  const context = useContext(ConfirmationDialogContext);
  if (!context) {
    throw new Error("useConfirmationDialog must be used within ConfirmationDialogProvider.");
  }

  return context;
}
