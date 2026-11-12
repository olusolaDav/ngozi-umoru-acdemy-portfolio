import { Mail, Phone, Sparkles } from "lucide-react";

import { BlogCard } from "@/components/cards/blog-card";
import { DevotionalCard } from "@/components/cards/devotional-card";
import { VideoCard } from "@/components/cards/video-card";
import { ContactForm } from "@/components/forms/contact-form";
import { CommunityCta } from "@/components/sections/community-cta";
import { NewsletterSection } from "@/components/sections/newsletter-section";
import { SectionShell } from "@/components/ui/section-shell";
import { stripHtml, toRelativePostedTime, type BlogSummary } from "@/lib/blog";
import { type DailyScriptureSummary } from "@/lib/daily-scripture";
import { stripHtml as stripDevotionalHtml, type DevotionalSummary } from "@/lib/devotional";
import type { VideoItem } from "@/types/content";
import type { LatestYoutubeVideo } from "@/lib/youtube";
import { HomeHeroVideoRotator } from "./home-hero-video-rotator";

type HomePageProps = {
  latestVideo: LatestYoutubeVideo;
  avadVideos: VideoItem[];
  rotateAvadVideo: boolean;
  recentBlogs: BlogSummary[];
  dailyScripture: DailyScriptureSummary | null;
  recentDevotionals: DevotionalSummary[];
  recommendedVideos: VideoItem[];
  latestFeaturedVideoIsToday: boolean;
};

function isSameLocalDay(value: string | null | undefined, now: Date) {
  if (!value) {
    return false;
  }

  const date = new Date(value);
  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  );
}

function devotionalDateScore(item: DevotionalSummary) {
  return new Date(item.devotionalDate || item.createdAt).getTime();
}

export function HomePage({ latestVideo, avadVideos, rotateAvadVideo, recentBlogs, dailyScripture, recentDevotionals, recommendedVideos, latestFeaturedVideoIsToday }: HomePageProps) {
  const scriptureHeadline = dailyScripture?.verse?.trim() || "Daily Scripture";
  const scriptureBody = dailyScripture?.content || dailyScripture?.excerpt || "";
  const latestVideoBadge = latestFeaturedVideoIsToday ? "Latest Upload Today" : "Latest Upload";
  const today = new Date();

  const devotionalCards = [...recentDevotionals]
    .sort((left, right) => devotionalDateScore(right) - devotionalDateScore(left));

  const todaysPriority = devotionalCards.find((item) => isSameLocalDay(item.devotionalDate, today));
  const orderedDevotionals = todaysPriority
    ? [todaysPriority, ...devotionalCards.filter((item) => item.id !== todaysPriority.id)]
    : devotionalCards;

  return (
    <>
      <section id="about" className="mx-auto mt-12 w-full max-w-[1320px] px-4 text-center md:mt-14 md:px-6 lg:px-8 xl:mt-16 xl:px-10 2xl:mt-20">
        <div className="mx-auto inline-flex rounded-full bg-[var(--avad-gold)] px-4 py-1 text-[11px] font-bold uppercase tracking-wide text-white">
          AVAD- A Verse A Day
        </div>
        <h1 className="mx-auto mt-6 max-w-[680px] font-serif text-[clamp(2.8rem,6vw,4.5rem)] font-bold leading-[1.08] text-[var(--avad-text-strong)]">
          Know God. Love God. Live For God.
        </h1>
        <p className="mx-auto mt-4 max-w-[540px] text-base leading-6 text-[var(--avad-text-soft)]">
          Our mission is to raise people who love God sincerely, walk in righteousness,
          and use their gifts to bless others and glorify God.
        </p>

        <div className="relative mx-auto mt-11 w-full max-w-[980px] rounded-[28px] bg-gradient-to-b from-[#d89d58] to-[var(--avad-purple)] p-3 md:p-8">
          <div className="mx-auto w-[94%] overflow-hidden rounded-[20px] border-[6px] border-[var(--avad-purple)] bg-black md:w-full md:border-[12px]">
            <HomeHeroVideoRotator
              initialVideo={latestVideo}
              avadVideos={avadVideos}
              enabled={rotateAvadVideo}
            />
          </div>
        </div>
      </section>

      <section className="mt-14 md:mt-16 xl:mt-20 2xl:mt-24">
        <SectionShell title="Latest & Featured Videos" actionLabel="SEE ALL" actionHref="/videos">
          <p className="mb-5 max-w-[780px] text-sm leading-6 text-[var(--avad-text-soft)]">
            Fresh Bible-based encouragement, practical faith insights, and the latest AVAD moments in one place.
          </p>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {recommendedVideos.map((video, index) => (
              <VideoCard
                key={video.id}
                video={video}
                featured={index === 0}
                badgeLabel={index === 0 ? latestVideoBadge : undefined}
              />
            ))}
          </div>
        </SectionShell>
      </section>

      {dailyScripture ? (
        <section className="mx-auto mt-14 w-full max-w-[1320px] px-4 md:mt-16 md:px-6 lg:px-8 xl:mt-20 xl:px-10 2xl:mt-24">
          <div className="rounded-[28px] bg-[var(--avad-purple)] px-6 py-7 md:px-10">
            <div className="mb-2 inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-[var(--avad-gold)]">
              <Sparkles size={14} /> Verse of the Day
            </div>
            <h2 className="font-serif text-[44px] font-bold text-[var(--avad-gold)]">{scriptureHeadline}</h2>
            <p className="mt-3 max-w-[970px] whitespace-normal text-[19px] leading-[1.35] text-[#f5e6ff]">
              {scriptureBody}
            </p>
          </div>
        </section>
      ) : null}

      <section id="devotionals" className="mt-14 md:mt-16 xl:mt-20 2xl:mt-24">
          <SectionShell title="Daily Devotionals" actionLabel="SEE ALL" actionHref="/devotionals">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {orderedDevotionals.map((devotional) => (
              <DevotionalCard
                key={devotional.id}
                devotional={{
                  id: devotional.id,
                  title: devotional.title,
                  excerpt:
                    devotional.excerpt ||
                    stripDevotionalHtml(devotional.content).slice(0, 170),
                  authorName: devotional.authorName,
                  likes: devotional.likes,
                  comments: devotional.commentsCount,
                  shares: devotional.shares,
                  bookmarks: 0,
                  thumbnail: devotional.thumbnail,
                  devotionalDate: devotional.devotionalDate,
                }}
                badgeLabel={isSameLocalDay(devotional.devotionalDate, today) ? "Today's Devotional" : undefined}
                href={`/devotionals/${devotional.slug}`}
              />
            ))}
          </div>
        </SectionShell>
      </section>

      <CommunityCta className="mt-14 md:mt-16 xl:mt-20 2xl:mt-24" />

      <section id="blog" className="mt-14 md:mt-16 xl:mt-20 2xl:mt-24">
          <SectionShell title="Blog Posts" actionLabel="SEE ALL" actionHref="/blog">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {recentBlogs.map((blog) => (
              <BlogCard
                key={blog.id}
                blog={{
                  id: blog.id,
                  title: blog.title,
                  excerpt: blog.excerpt || stripHtml(blog.content).slice(0, 160),
                  authorName: blog.authorName,
                  likes: blog.likes,
                  comments: blog.commentsCount,
                  bookmarks: 0,
                  shares: blog.shares,
                  postedAgo: toRelativePostedTime(blog.publishedAt ?? blog.createdAt),
                  thumbnail: blog.thumbnail,
                  href: `/blog/${blog.slug}`,
                }}
              />
            ))}
          </div>
        </SectionShell>
      </section>

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
