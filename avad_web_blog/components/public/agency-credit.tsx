import Image from "next/image";
import Link from "next/link";

export function AgencyCredit() {
  return (
    <div className="border-t border-[var(--avad-border)] bg-[var(--avad-bg)] py-5 text-xs text-[var(--avad-text)] dark:bg-[var(--avad-bg-soft)]">
      <div className="mx-auto flex w-full max-w-[1320px] justify-center px-4 md:px-6 lg:px-8 xl:px-10">
        <Link
          href="https://alotdigitalagency.com/"
          target="_blank"
          rel="noreferrer"
          className="inline-flex cursor-pointer items-center gap-1.5 font-medium transition-opacity hover:opacity-80"
          aria-label="Designed and built by Alot Digital Agency"
        >
          <span>Designed &amp; Built by</span>
          <Image src="/alot-logo-blue.svg" alt="" width={76} height={20} className="h-4 w-auto dark:hidden" />
          <Image src="/alot-logo-yellow.svg" alt="" width={76} height={20} className="hidden h-4 w-auto dark:block" />
          <span>Alot Digital Agency</span>
        </Link>
      </div>
    </div>
  );
}
