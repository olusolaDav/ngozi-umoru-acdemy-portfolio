import Image from "next/image";
import Link from "next/link";

type BrandLogoProps = {
  compact?: boolean;
  withText?: boolean;
};

export function BrandLogo({ compact = false, withText = true }: BrandLogoProps) {
  return (
    <Link href="/" className="flex items-center gap-2" aria-label="AVAD home">
      <Image
        src="/avad-logo.svg"
        alt="AVAD logo"
        width={compact ? 34 : 44}
        height={compact ? 34 : 44}
        className={compact ? "h-[34px] w-[34px]" : "h-[44px] w-[44px]"}
        priority
      />
      {withText ? (
        <span className="text-[10px] font-semibold uppercase tracking-[0.04em] text-[var(--avad-text-strong)] md:text-xs">
          AVAD - A Verse A Day
        </span>
      ) : null}
    </Link>
  );
}
