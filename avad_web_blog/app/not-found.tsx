import Link from "next/link";
import { ArrowLeft, Compass } from "lucide-react";

export default function NotFound() {
  return (
    <section className="relative isolate flex min-h-[70vh] items-center justify-center overflow-hidden px-6 py-20">
      <div className="pointer-events-none absolute -left-24 top-10 -z-10 size-72 rounded-full bg-[var(--avad-gold)]/15 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 bottom-0 -z-10 size-96 rounded-full bg-[var(--avad-purple)]/20 blur-3xl" />

      <div className="w-full max-w-2xl text-center">
        <div className="mx-auto mb-8 grid size-20 place-items-center rounded-3xl border border-[var(--avad-border)] bg-[var(--avad-bg-elevated)] text-[var(--avad-gold)] shadow-xl shadow-[var(--avad-purple)]/10">
          <Compass size={38} strokeWidth={1.5} />
        </div>
        <p className="text-sm font-bold uppercase tracking-[0.3em] text-[var(--avad-gold)]">404 · Page not found</p>
        <h1 className="mt-5 font-serif text-5xl font-bold tracking-tight text-[var(--avad-text-strong)] sm:text-7xl">A quiet place between pages.</h1>
        <p className="mx-auto mt-6 max-w-lg text-base leading-7 text-[var(--avad-text-soft)] sm:text-lg">
          The page you are looking for may have moved, or the address may not be quite right.
        </p>
        <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full bg-[var(--avad-purple)] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-[var(--avad-purple)]/20 transition hover:-translate-y-0.5 hover:opacity-90"
          >
            <ArrowLeft size={16} />
            Back home
          </Link>
          <Link
            href="/devotionals"
            className="rounded-full border border-[var(--avad-border)] bg-[var(--avad-bg-elevated)] px-6 py-3 text-sm font-semibold text-[var(--avad-text)] transition hover:border-[var(--avad-ring)] hover:bg-[var(--avad-bg-soft)]"
          >
            Explore devotionals
          </Link>
        </div>
      </div>
    </section>
  );
}
