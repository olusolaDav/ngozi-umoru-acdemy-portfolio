import type { Metadata } from "next";
import { Manrope, Playfair_Display } from "next/font/google";
import Script from "next/script";

import { SiteChrome } from "@/components/layout/site-chrome";
import { Providers } from "@/components/providers";
import { StructuredData } from "@/components/seo/structured-data";
import { absoluteUrl, DEFAULT_OG_IMAGE, getSiteUrl, SITE_DESCRIPTION, SITE_NAME } from "@/lib/seo";
import "./globals.css";

const bodyFont = Manrope({
  variable: "--font-body",
  subsets: ["latin"],
});

const headingFont = Playfair_Display({
  variable: "--font-heading",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: { default: SITE_NAME, template: `%s | ${SITE_NAME}` },
  description: SITE_DESCRIPTION,
  keywords: ["AVAD", "A Verse A Day", "daily Bible verse", "daily Scripture", "Christian devotionals", "Bible study", "Christian articles", "faith community", "Alot Digital Agency", "web design agency", "digital agency"],
  applicationName: SITE_NAME,
  category: "religion",
  classification: "Christian faith and Bible resources",
  creator: SITE_NAME,
  publisher: SITE_NAME,
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 },
  },
  alternates: { canonical: "/", types: { "application/rss+xml": "/feed/blog" } },
  openGraph: {
    type: "website", url: getSiteUrl(), siteName: SITE_NAME, locale: "en_US",
    title: SITE_NAME, description: SITE_DESCRIPTION,
    images: [{ url: DEFAULT_OG_IMAGE, width: 1200, height: 630, alt: SITE_NAME }],
  },
  twitter: { card: "summary_large_image", title: SITE_NAME, description: SITE_DESCRIPTION, images: [DEFAULT_OG_IMAGE] },
  icons: {
    icon: [
      { url: "/favicon.ico", type: "image/x-icon" },
      { url: "/favicon/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
    apple: [{ url: "/favicon/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  manifest: "/favicon/site.webmanifest",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className={`${bodyFont.variable} ${headingFont.variable} h-full antialiased`}>
      {/* Browser extensions may add attributes to body before React hydrates. */}
      <body suppressHydrationWarning className="min-h-full bg-[var(--avad-bg)] font-sans text-[var(--avad-text)]">
        <StructuredData data={{ "@context": "https://schema.org", "@type": "Organization", name: SITE_NAME, url: getSiteUrl(), logo: absoluteUrl("/avad-logo.svg"), image: absoluteUrl(DEFAULT_OG_IMAGE), description: SITE_DESCRIPTION }} />
        <StructuredData data={{ "@context": "https://schema.org", "@type": "WebSite", name: SITE_NAME, url: getSiteUrl(), creator: { "@type": "Organization", name: "Alot Digital Agency", url: "https://alotdigitalagency.com/", logo: absoluteUrl("/alot-logo-yellow.svg") } }} />
        {process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ? (
          <>
            <Script src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}`} strategy="afterInteractive" />
            <Script id="google-analytics" strategy="afterInteractive">
              {`window.dataLayer = window.dataLayer || []; function gtag(){dataLayer.push(arguments);} gtag('js', new Date()); gtag('config', '${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}', { anonymize_ip: true });`}
            </Script>
          </>
        ) : null}
        <Providers>
          <SiteChrome>{children}</SiteChrome>
        </Providers>
      </body>
    </html>
  );
}
