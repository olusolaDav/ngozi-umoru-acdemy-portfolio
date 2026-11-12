"use client";

import { usePathname } from "next/navigation";

import { DailyScriptureExperience } from "@/components/public/daily-scripture-experience";
import { BackToTop } from "@/components/public/back-to-top";
import { PublicFooter } from "@/components/public/footer";
import { FirstLoginWelcomeModal } from "@/components/public/first-login-welcome-modal";
import { PublicNavbar } from "@/components/public/navbar";

type SiteChromeProps = {
  children: React.ReactNode;
};

const NO_PUBLIC_CHROME_PREFIXES = ["/auth", "/dashboard"];

export function SiteChrome({ children }: SiteChromeProps) {
  const pathname = usePathname();
  const hideChrome = NO_PUBLIC_CHROME_PREFIXES.some((prefix) => pathname.startsWith(prefix));

  if (hideChrome) {
    return <>{children}</>;
  }

  return (
    <>
      <FirstLoginWelcomeModal />
      <DailyScriptureExperience />
      <PublicNavbar />
      <main className="pt-[112px]">{children}</main>
      <PublicFooter />
      <BackToTop />
    </>
  );
}
