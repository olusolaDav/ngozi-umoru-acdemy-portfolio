import Link from "next/link";

import { cn } from "@/lib/utils";

type SectionShellProps = {
  title: string;
  actionLabel?: string;
  actionHref?: string;
  className?: string;
  children: React.ReactNode;
};

export function SectionShell({ title, actionLabel, actionHref, className, children }: SectionShellProps) {
  return (
    <section className={cn("w-full", className)}>
      <div className="mx-auto w-full max-w-[1320px] px-4 md:px-6 lg:px-8 xl:px-10">
        <div className="mb-7 flex items-end justify-between border-b border-[var(--avad-border)] pb-3">
          <h2 className="font-serif text-[clamp(2rem,4vw,3.3rem)] font-bold text-[var(--avad-text-strong)]">{title}</h2>
          {actionLabel && actionHref ? (
            <Link href={actionHref} className="cursor-pointer text-xs font-semibold uppercase tracking-wide text-[var(--avad-gold)]">
              {actionLabel} <span aria-hidden>-&gt;</span>
            </Link>
          ) : null}
        </div>
        {children}
      </div>
    </section>
  );
}
