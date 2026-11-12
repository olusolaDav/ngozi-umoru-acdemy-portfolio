import Image from "next/image";
import { Mail, Phone, Sparkles, Zap, Cog, Hammer } from "lucide-react";

import { ContactForm } from "@/components/forms/contact-form";
import { CommunityCta } from "@/components/sections/community-cta";
import { NewsletterSection } from "@/components/sections/newsletter-section";

type ValueItem = {
  title: string;
  description: string;
  scripture?: string;
  icon: React.ComponentType<{ className?: string; size?: number }>;
  iconClassName: string;
};

const values: ValueItem[] = [
  {
    title: "Excellence",
    description: "A commitment to diligence, quality, integrity, and continuous improvement in service to God and humanity.",
    scripture: "Proverbs 22:29",
    icon: Sparkles,
    iconClassName: "text-fuchsia-300",
  },
  {
    title: "Passion",
    description: "A lifelong pursuit of God, truth, learning, discipleship, and Kingdom advancement.",
    scripture: '"Zeal for Your house has consumed me." John 2:17',
    icon: Zap,
    iconClassName: "text-rose-300",
  },
  {
    title: "Impact",
    description: "Empowering people, mentoring future leaders, building capacity, and using technology as ministry tools.",
    scripture: "For transformation and lasting influence.",
    icon: Hammer,
    iconClassName: "text-orange-300",
  },
  {
    title: "Competence",
    description: "A belief that spiritual devotion and practical excellence should work together to glorify God and serve people.",
    scripture: "Advancing His Kingdom with clarity and discipline.",
    icon: Cog,
    iconClassName: "text-violet-300",
  },
];

export function AboutPage() {
  return (
    <>
      <section className="mt-0">
        <div className="w-full border-y border-[#ead8c1] bg-[#f0dcc5] py-16 dark:border-[var(--avad-border)] dark:bg-[radial-gradient(120%_130%_at_10%_10%,rgba(217,157,88,0.16),transparent_55%),radial-gradient(100%_120%_at_90%_100%,rgba(123,63,180,0.22),transparent_52%),linear-gradient(135deg,#1f0f31_0%,#140924_60%,#0f0719_100%)] md:py-20">
          <div className="mx-auto w-full max-w-[1320px] px-4 text-center md:px-6 lg:px-8 xl:px-10">
            <h1 className="font-serif text-[clamp(2.4rem,5vw,3.8rem)] font-bold text-[#16101f] dark:text-white">About Us</h1>
            <p className="mx-auto mt-4 max-w-[640px] text-base leading-7 text-[#5f536e] dark:text-[#d8cdeb] md:text-lg">
              Our story, mission, and commitment to spiritual growth.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto mt-14 w-full max-w-[1320px] px-4 md:mt-16 md:px-6 lg:px-8 xl:mt-20 xl:px-10 2xl:mt-24">
        <article className="rounded-[26px] border border-[#ead6bc] bg-[#f8ebda] p-6 dark:border-[var(--avad-border)] dark:bg-[linear-gradient(135deg,#25113b_0%,#1a0d2e_75%,#170a27_100%)] md:p-10">
          <h2 className="border-b border-[#e2ccb1] pb-3 font-serif text-[clamp(2rem,3.4vw,3.2rem)] font-bold text-[#171220] dark:border-[#4b3968] dark:text-white">Our Story</h2>
          <div className="mt-6 space-y-6 text-[1.03rem] leading-8 text-[#61516e] dark:text-[#d6c9e8]">
            <p>
              Welcome to A Verse A Day, your daily source for Bible verses, Christian devotionals, and Scripture-based encouragement,
              engagement, and enlightenment. In a noisy digital world, this platform is a sanctuary of truth where God&apos;s Word speaks clearly
              to everyday life.
            </p>
            <p>
              Each day, we share prayerfully chosen verses to ignite faith, renew passion, and deepen your walk with Christ, riding on God&apos;s
              grace and inspiration of the Holy Spirit. Anchored on Acts 20:32, Daniel 11:32b, 2 Timothy 3:16-17, and Psalm 119:11.
            </p>
            <p>
              Enjoy daily Bible verses, short devotionals, and practical prompts that inspire spiritual growth and victorious living.
              Join a community committed to living by the Word and shaping culture with truth, one verse at a time.
            </p>
          </div>

          <div className="mt-9 grid grid-cols-1 gap-4 md:grid-cols-2">
            <article className="rounded-3xl border border-[#e2ccb1] bg-[#f1dec7] p-6 dark:border-[#4a3768] dark:bg-[#2a1542]/90">
              <h3 className="font-serif text-[2rem] font-bold leading-none text-[#171220] dark:text-white md:text-[2.15rem]">Our Mission</h3>
              <p className="mt-4 text-[1.02rem] leading-7 text-[#61516e] dark:text-[#d8cbe8]">
                Our mission is to help you grow in grace and truth through consistent exposure to Scripture,
                being a compendium of light, wisdom, grace, glory, and unction.
              </p>
            </article>
            <article className="rounded-3xl border border-[#e2ccb1] bg-[#f1dec7] p-6 dark:border-[#4a3768] dark:bg-[#2a1542]/90">
              <h3 className="font-serif text-[2rem] font-bold leading-none text-[#171220] dark:text-white md:text-[2.15rem]">Our Vision</h3>
              <p className="mt-4 text-[1.02rem] leading-7 text-[#61516e] dark:text-[#d8cbe8]">
                To steward technological innovation that will help believers grow in intimacy with God through His Word,
                and to advance the Kingdom of God.
              </p>
            </article>
          </div>
        </article>
      </section>

      <section className="mx-auto mt-14 w-full max-w-[1320px] px-4 md:mt-16 md:px-6 lg:px-8 xl:mt-20 xl:px-10 2xl:mt-24">
        <h2 className="border-b border-[var(--avad-border)] pb-3 font-serif text-[clamp(2rem,3.2vw,3.1rem)] font-bold text-[var(--avad-text-strong)]">
          Core Values
        </h2>
        <div className="mt-7 grid grid-cols-1 gap-4 md:grid-cols-2">
          {values.map((value) => {
            const Icon = value.icon;

            return (
              <article key={value.title} className="rounded-[22px] border border-[#e2ccb1] bg-[#f1dec7] p-5 dark:border-[var(--avad-border)] dark:bg-[var(--avad-bg-elevated)] md:p-6">
                <div className="flex items-start gap-3">
                  <span className="mt-1 inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#f7e9d8] dark:bg-[var(--avad-bg-soft)]">
                    <Icon size={16} className={value.iconClassName} />
                  </span>
                  <div>
                    <h3 className="font-serif text-[2rem] font-bold leading-none text-[var(--avad-text-strong)] md:text-[2.05rem]">
                      {value.title}
                    </h3>
                    <p className="mt-3 text-[1rem] leading-7 text-[var(--avad-text-soft)]">{value.description}</p>
                    {value.scripture ? <p className="mt-1 text-[0.95rem] leading-7 text-[var(--avad-text-soft)]">{value.scripture}</p> : null}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="mx-auto mt-14 w-full max-w-[1320px] px-4 md:mt-16 md:px-6 lg:px-8 xl:mt-20 xl:px-10 2xl:mt-24">
        <h2 className="border-b border-[var(--avad-border)] pb-3 font-serif text-[clamp(2rem,3.2vw,3.1rem)] font-bold text-[var(--avad-text-strong)]">
          Meet the Founder
        </h2>
        <div className="mt-7 overflow-hidden rounded-[28px] border border-[#e2ccb1] bg-[#f1dec7] dark:border-[#4b3968] dark:bg-[linear-gradient(140deg,#27113f_0%,#1c0e2f_55%,#170a26_100%)]">
          <div className="grid grid-cols-1 items-stretch lg:grid-cols-[1.1fr_0.9fr]">
            <div className="p-6 text-[1rem] leading-7 text-[#61516e] dark:text-[#dbcfeb] md:p-10">
              <div className="mb-7 inline-flex items-center gap-2 rounded-full bg-[#f7e9d8] px-3 py-1.5 text-xs font-bold uppercase tracking-[0.16em] text-[#704322] dark:bg-[#351a4e] dark:text-[#e4a45f]">
                Founder&apos;s note
              </div>
              <h3 className="max-w-lg font-serif text-3xl font-bold leading-tight text-[#211329] dark:text-white md:text-4xl">
                Building a home for the Word of God.
              </h3>
              <p>
                Samson Fayoyiwa is a passionate follower of Christ, student of Scripture, technology leader, and the visioner behind
                A Verse A Day (AVAD) and several Kingdom-advancing initiatives dedicated to helping believers grow in intimacy with God
                through His Word.
              </p>
              <p className="mt-5">
                Beyond engineering and innovation, my deepest passion is seeing lives transformed by God&apos;s Word and the ministry of His Presence.
                I firmly believe that when believers pursue God&apos;s Presence, His gifts, blessings, wisdom, favour, and provision naturally follow.
              </p>
              <p className="mt-5">This conviction is the heartbeat of AVAD.</p>
            </div>
            <div className="relative min-h-[300px] overflow-hidden border-t border-[#e2ccb1] bg-[#160b22] dark:border-[#4b3968] md:min-h-[420px] lg:border-l lg:border-t-0">
              <Image
                src="/Mr.Samson.jpeg"
                alt="Samson Fayoyiwa, founder of A Verse A Day"
                fill
                className="object-cover object-center transition duration-500 hover:scale-[1.02]"
              />
              <div className="absolute inset-x-4 bottom-4 rounded-2xl border border-white/20 bg-[#1c0d2b]/80 p-4 text-white backdrop-blur-md">
                <p className="font-serif text-xl font-semibold">Samson Fayoyiwa</p>
                <p className="mt-1 text-sm text-[#e4c18e]">Founder &amp; visioner, AVAD</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <CommunityCta className="mt-14 md:mt-16 xl:mt-20 2xl:mt-24" />

      <section id="contact" className="mx-auto mt-14 grid w-full max-w-[1320px] gap-10 px-4 md:mt-16 md:grid-cols-2 md:px-6 lg:px-8 xl:mt-20 xl:px-10 2xl:mt-24">
        <div className="py-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-[var(--avad-purple)] px-3 py-1 text-[11px] uppercase text-[var(--avad-purple)]">
            Contact Us
          </div>
          <h2 className="mt-5 font-serif text-[clamp(2.5rem,5vw,4rem)] font-bold text-[var(--avad-text-strong)]">Contact Us</h2>
          <p className="mt-4 max-w-[500px] text-xl leading-8 text-[var(--avad-text-soft)]">
            Learn more about God&apos;s Word. Complete the form to learn how AVAD — A Verse A Day — can help.
          </p>
          <ul className="mt-6 space-y-3 text-2xl text-[var(--avad-text-soft)]">
            <li className="flex min-w-0 items-start gap-2"><Mail size={20} className="mt-1 shrink-0 text-[var(--avad-gold)]" /> <a href="mailto:contact@samsonbabajidefayoyiwa.org" className="break-words text-base hover:underline [overflow-wrap:anywhere]">contact@samsonbabajidefayoyiwa.org</a></li>
            <li className="flex items-start gap-2"><Phone size={20} className="mt-1 shrink-0 text-[var(--avad-gold)]" /> <span className="flex flex-col text-base"><a href="tel:+2348054463966" className="hover:underline">+234 805 446 3966</a><a href="tel:+2347030271341" className="hover:underline">+234 703 027 1341</a></span></li>
          </ul>
          <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
            <article>
              <h3 className="font-serif text-[21px] font-bold leading-[1.08] text-[var(--avad-text-strong)] md:text-[24px]">Customer Support</h3>
              <p className="mt-2 text-base leading-7 text-[var(--avad-text-soft)]">
                Our support team is available around the clock to address any concerns or queries you may have.
              </p>
            </article>
            <article>
              <h3 className="font-serif text-[21px] font-bold leading-[1.08] text-[var(--avad-text-strong)] md:text-[24px]">Feedback and Suggestions</h3>
              <p className="mt-2 text-base leading-7 text-[var(--avad-text-soft)]">
                We value your feedback and are continually working to improve our services.
              </p>
            </article>
          </div>
        </div>
        <ContactForm />
      </section>

      <NewsletterSection className="mt-14 md:mt-16 xl:mt-20 2xl:mt-24" />
    </>
  );
}
