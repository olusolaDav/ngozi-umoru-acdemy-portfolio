import Image from "next/image";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type CommunityCtaProps = {
  className?: string;
};

export function CommunityCta({ className }: CommunityCtaProps) {
  return (
    <section id="community" className={className}>
      <div className="mx-auto w-full max-w-[1320px] px-4 md:px-6 lg:px-8 xl:px-10">
        <div className="grid overflow-hidden rounded-[26px] bg-[var(--avad-purple)] md:grid-cols-2">
          <div className="p-7 md:p-9">
            <h2 className="max-w-[430px] font-serif text-[clamp(1.6rem,2.7vw,2.5rem)] font-bold leading-[1.08] text-[var(--avad-gold)]">
              Join Our Community and Fellowship With Faith-minded People
            </h2>
            <p className="mt-3 max-w-[430px] text-base leading-6 text-[#f0e8f6] md:text-lg md:leading-7">
              Become part of a Christ-centered community focused on righteousness,
              devotion, and kingdom impact
            </p>
            <Link href="/community" className={cn(buttonVariants({ variant: "gold" }), "mt-6 rounded-xl px-6 py-2.5 text-sm") }>
              Become a Member
            </Link>
          </div>
          <div className="relative min-h-[220px]">
            <Image src="/placeholders/community.png" alt="Community and fellowship visual" fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" />
          </div>
        </div>
      </div>
    </section>
  );
}
