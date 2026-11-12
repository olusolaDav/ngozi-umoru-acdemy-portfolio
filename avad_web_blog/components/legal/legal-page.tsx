import Link from "next/link";
import type { ReactNode } from "react";

export type LegalSection = {
  id: string;
  title: string;
  content: ReactNode;
};

type LegalPageProps = {
  title: string;
  eyebrow: string;
  description: string;
  lastUpdated: string;
  sections: LegalSection[];
};

export function LegalPage({ title, eyebrow, description, lastUpdated, sections }: LegalPageProps) {
  return (
    <article className="mx-auto w-full max-w-[1180px] px-4 py-12 md:px-6 md:py-16 lg:px-8 lg:py-20 xl:px-10">
      <header className="max-w-[820px]">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--avad-gold)]">{eyebrow}</p>
        <h1 className="mt-4 font-serif text-[clamp(2.5rem,5vw,4.5rem)] font-bold leading-[1.05] text-[var(--avad-text-strong)]">{title}</h1>
        <p className="mt-6 text-lg leading-8 text-[var(--avad-text-soft)]">{description}</p>
        <p className="mt-5 text-sm text-[var(--avad-text-soft)]">Last updated: {lastUpdated}</p>
      </header>

      <div className="mt-12 grid gap-10 lg:grid-cols-[220px_minmax(0,1fr)] lg:items-start">
        <nav aria-label={`${title} contents`} className="rounded-2xl border border-[var(--avad-border)] bg-[var(--avad-bg-soft)] p-5 lg:sticky lg:top-28">
          <p className="font-serif text-lg font-bold text-[var(--avad-text-strong)]">On this page</p>
          <ol className="mt-4 space-y-2 text-sm leading-6 text-[var(--avad-text-soft)]">
            {sections.map((section, index) => (
              <li key={section.id}>
                <Link className="cursor-pointer transition-colors hover:text-[var(--avad-text-strong)]" href={`#${section.id}`}>
                  {index + 1}. {section.title}
                </Link>
              </li>
            ))}
          </ol>
        </nav>

        <div className="legal-content divide-y divide-[var(--avad-border)] rounded-3xl border border-[var(--avad-border)] bg-[var(--avad-bg-elevated)] px-5 py-2 shadow-sm md:px-8">
          {sections.map((section, index) => (
            <section key={section.id} id={section.id} className="scroll-mt-28 py-8 first:pt-7 last:pb-9">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--avad-gold)]">{String(index + 1).padStart(2, "0")}</p>
              <h2 className="mt-2 font-serif text-[clamp(1.45rem,2.5vw,2rem)] font-bold text-[var(--avad-text-strong)]">{section.title}</h2>
              <div className="mt-4 text-[0.98rem] leading-8 text-[var(--avad-text-soft)]">{section.content}</div>
            </section>
          ))}
        </div>
      </div>
    </article>
  );
}
