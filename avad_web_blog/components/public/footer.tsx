import Image from "next/image";
import Link from "next/link";
import { Facebook, Instagram, Mail, Phone, Youtube } from "lucide-react";

export function PublicFooter() {
  return (
    <footer className="mt-10 bg-[var(--avad-purple)] text-[#dda75f]">
      <div className="mx-auto grid w-full max-w-[1320px] gap-10 px-4 py-10 sm:py-12 md:grid-cols-[1.55fr_0.72fr_0.78fr] md:px-6 lg:px-8 xl:px-10">
        <div className="flex min-w-0 flex-col gap-6 sm:gap-8 md:flex-row md:items-center">
          <div className="grid h-[120px] w-[150px] shrink-0 place-items-center rounded-3xl bg-[var(--avad-bg-elevated)] px-4 sm:h-[160px] sm:w-[200px]">
            <Image src="/avad-logo.png" alt="AVAD logo badge" width={132} height={116} className="h-auto w-auto" />
          </div>
          <p className="max-w-[560px] text-[14px] leading-7">
            AVAD is focused on helping people know God deeply through His Word,
            prayer, worship, and daily devotion. The mission is to raise people who
            love God sincerely, walk in righteousness, and use their gifts to bless
            others and glorify God.
          </p>
        </div>

        <div>
          <h3 className="mb-4 font-serif text-[2rem] font-bold">Pages</h3>
          <ul className="space-y-2 text-lg">
            <li><Link href="/videos" className="cursor-pointer">Videos</Link></li>
            <li><Link href="/devotionals" className="cursor-pointer">Devotional</Link></li>
            <li><Link href="/community" className="cursor-pointer">Community</Link></li>
            <li><Link href="/blog" className="cursor-pointer">Blog</Link></li>
            <li><Link href="/about" className="cursor-pointer">About Us</Link></li>

          </ul>
        </div>

        <div>
          <h3 className="mb-4 font-serif text-[2rem] font-bold">Contacts</h3>
          <ul className="space-y-3 text-base">
            <li className="flex min-w-0 items-start gap-2"><Phone className="mt-1 shrink-0" size={17} /> <span className="flex min-w-0 flex-col"><a href="tel:+2348054463966" className="hover:underline">+234 805 446 3966</a><a href="tel:+2347030271341" className="hover:underline">+234 703 027 1341</a></span></li>
           <li className="flex min-w-0 items-start gap-2">
              <Mail className="mt-1 shrink-0" size={17} />
              <a
                href="mailto:contact@samsonbabajidefayoyiwa.org"
                className="min-w-0 break-words [overflow-wrap:anywhere] hover:underline"
              >
                contact@samsonbabajidefayoyiwa.org
              </a>
            </li>
          </ul>
          <h4 className="mb-3 mt-8 font-serif text-[2rem] font-bold">Follow us on</h4>
          <div className="flex gap-4">
            <Link href="https://www.youtube.com/@AVAD-365" target="_blank" rel="noreferrer" aria-label="AVAD on YouTube" className="cursor-pointer transition-opacity hover:opacity-80"><Youtube /></Link>
            <Link href="https://www.instagram.com/emperorpapillo" target="_blank" rel="noreferrer" aria-label="AVAD on Instagram (@emperorpapillo)" className="cursor-pointer transition-opacity hover:opacity-80"><Instagram /></Link>
            {/* X/Twitter handle temporarily disabled. */}
            {/* <Link href="https://twitter.com/emperorpapillo" target="_blank" rel="noreferrer" aria-label="AVAD on Twitter (@emperorpapillo)" className="cursor-pointer transition-opacity hover:opacity-80">
              <svg viewBox="0 0 24 24" aria-hidden="true" className="h-6 w-6" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
            </Link> */}
            <Link href="https://www.tiktok.com/@emperorpapillo" target="_blank" rel="noreferrer" aria-label="AVAD on TikTok (@emperorpapillo)" className="cursor-pointer transition-opacity hover:opacity-80">
              <svg viewBox="0 0 24 24" aria-hidden="true" className="h-6 w-6" fill="currentColor"><path d="M19.321 5.562a5.88 5.88 0 0 1-3.45-1.11A5.9 5.9 0 0 1 13.54 1h-3.3v14.011a2.61 2.61 0 1 1-2.61-2.61c.22 0 .433.027.637.078v-3.36a5.98 5.98 0 1 0 5.273 5.892V7.905a9.2 9.2 0 0 0 5.78 2.036V6.6a5.93 5.93 0 0 1-.001-1.038z" /></svg>
            </Link>
            <Link href="https://www.facebook.com/share/1EMzoBbWu7/?mibextid=wwXIfr" target="_blank" rel="noreferrer" aria-label="AVAD on Facebook" className="cursor-pointer transition-opacity hover:opacity-80"><Facebook /></Link>
          </div>
        </div>
      </div>

      <div className="border-t border-[#6e446f]/80 py-6 text-xs text-[#d7a45f]">
        <div className="mx-auto w-full max-w-[1320px] px-4 md:px-6 lg:px-8 xl:px-10">
          <div className="flex flex-col items-center justify-between gap-3 md:flex-row">
            <p>© 2026 AVAD - A Verse A Day. All rights reserved.</p>
            <Link
              href="https://alotdigitalagency.com/"
              target="_blank"
              rel="noreferrer"
              className="inline-flex cursor-pointer items-center gap-1.5 whitespace-nowrap text-[#f3dfbf] transition-opacity hover:opacity-80"
              aria-label="Designed and built by Alot Digital Agency"
            >
              <span>Designed &amp; Built by</span>
              <Image src="/alot-logo-yellow.svg" alt="Alot Digital Agency logo" width={76} height={20} className="h-4 w-auto" />
              <span>Alot Digital Agency</span>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
