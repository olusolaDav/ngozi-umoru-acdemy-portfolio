"use client";

import { AlertTriangle, Home, RefreshCw } from "lucide-react";
import Link from "next/link";

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <section className="relative isolate flex min-h-[70vh] items-center justify-center overflow-hidden px-6 py-20">
      <div className="pointer-events-none absolute left-1/2 top-1/2 -z-10 size-[30rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--avad-gold)]/10 blur-3xl" />

      <div className="w-full max-w-xl rounded-[2rem] border border-[var(--avad-border)] bg-[var(--avad-bg-elevated)] p-8 text-center shadow-2xl shadow-[var(--avad-purple)]/10 sm:p-12">
        <div className="mx-auto grid size-16 place-items-center rounded-2xl bg-[var(--avad-gold)]/15 text-[var(--avad-gold)]">
          <AlertTriangle size={30} strokeWidth={1.8} />
        </div>
        <p className="mt-7 text-sm font-bold uppercase tracking-[0.25em] text-[var(--avad-gold)]">Something went wrong</p>
        <h1 className="mt-4 font-serif text-4xl font-bold text-[var(--avad-text-strong)] sm:text-5xl">Let’s try that again.</h1>
        <p className="mx-auto mt-4 max-w-md leading-7 text-[var(--avad-text-soft)]">
          We couldn’t load this page right now. Please try again, or return to the home page.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={() => reset()}
            className="inline-flex items-center gap-2 rounded-full bg-[var(--avad-purple)] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-[var(--avad-purple)]/20 transition hover:-translate-y-0.5 hover:opacity-90"
          >
            <RefreshCw size={16} />
            Try again
          </button>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full border border-[var(--avad-border)] bg-[var(--avad-bg)] px-6 py-3 text-sm font-semibold text-[var(--avad-text)] transition hover:border-[var(--avad-ring)] hover:bg-[var(--avad-bg-soft)]"
          >
            <Home size={16} />
            Home
          </Link>
        </div>
      </div>
    </section>
  );
}
