"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

type ThemeToggleProps = {
  className?: string;
};

export function ThemeToggle({ className }: ThemeToggleProps) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setMounted(true), 0);
    return () => window.clearTimeout(timer);
  }, []);

  if (!mounted) {
    return (
      <button
        type="button"
        aria-label="Toggle theme"
        title="Toggle theme"
        className={cn(
          "inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl border border-[var(--avad-border)] bg-[var(--avad-bg-soft)] text-[var(--avad-text)] transition hover:bg-[var(--avad-bg-elevated)]",
          className,
        )}
      >
        <Moon size={16} />
      </button>
    );
  }

  const isDark = resolvedTheme === "dark";

  return (
    <button
      type="button"
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      title={isDark ? "Switch to light theme" : "Switch to dark theme"}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={cn(
        "inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl border border-[var(--avad-border)] bg-[var(--avad-bg-soft)] text-[var(--avad-text)] transition hover:bg-[var(--avad-bg-elevated)]",
        className,
      )}
    >
      {isDark ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  );
}