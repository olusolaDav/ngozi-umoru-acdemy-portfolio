import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { BrandLogo } from "@/components/public/brand-logo";

type AuthShellProps = {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  backHref?: string;
};

export function AuthShell({ title, subtitle, children, backHref = "/" }: AuthShellProps) {
  return (
    <div className="grid min-h-screen bg-[#fbf0e3] lg:grid-cols-2">
      <section className="relative flex min-h-screen items-center justify-center px-5 py-8 sm:px-8 lg:px-12">
        <div className="absolute left-5 top-5 sm:left-10 sm:top-9">
          <BrandLogo compact withText />
        </div>

        <div className="w-full max-w-[430px] pt-20 lg:pt-0">
          <h1 className="font-serif text-5xl leading-[1.05] text-[#130d1d] sm:text-6xl">{title}</h1>
          <p className="mt-3 text-[17px] text-[#7e748f]">{subtitle}</p>
          <div className="mt-9">{children}</div>
        </div>
      </section>

      <aside className="relative hidden overflow-hidden bg-gradient-to-b from-[#5c2a49] via-[#3f1a58] to-[#2f0f44] lg:flex lg:flex-col lg:items-center lg:justify-center">
        <div className="absolute -top-24 -left-20 h-96 w-96 rounded-full bg-[#f19c2f]/95" />
        <div className="absolute bottom-[-220px] left-[-80px] h-[430px] w-[430px] rounded-full bg-[#2d0749]" />

        <Link
          href={backHref}
          className="absolute right-7 top-7 inline-flex items-center gap-1 rounded-full bg-[#2c0f49] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#3b1762]"
        >
          <ArrowLeft size={14} />
          Back
        </Link>

        <div className="relative z-10 flex max-w-[390px] flex-col items-center px-8 text-center text-white">
          <Image src="/avad-logo.png" alt="AVAD logo" width={250} height={219} className="h-auto w-[min(250px,70vw)]" priority />
          <h2 className="mt-10 font-serif text-5xl leading-[1.08]">Welcome to AVAD- A VERSE A DAY</h2>
          <p className="mt-4 text-base leading-relaxed text-[#f0e7ff]">
            Our mission is to raise people who love God sincerely, walk in righteousness, and use their gifts to bless others and glorify God.
          </p>
        </div>
      </aside>
    </div>
  );
}
