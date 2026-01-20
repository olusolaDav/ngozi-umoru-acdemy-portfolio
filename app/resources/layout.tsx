import type { Metadata } from "next"

// Optimized metadata for resources page
export const metadata: Metadata = {
  title: "Academic Resources | Teaching Materials & Educational Resources UK | Ngozi Blessing Umoru (PhD)",
  description: "Access free academic resources, teaching materials, worksheets, curriculum guides, and lesson plans for Academic English, EAP/ESL, and Foundation-level courses. Curated by Ngozi Blessing Umoru (PhD), experienced UK FE/HE lecturer with expertise in student-centred pedagogy.",
  keywords: [
    // Primary resource keywords
    "academic resources uk",
    "eap teaching materials",
    "academic english resources",
    "teaching worksheets uk",
    "esl resources higher education",
    // Specific resource types
    "curriculum guides",
    "lesson plans fe he",
    "academic writing resources",
    "foundation year materials",
    "student worksheets",
    // Academic areas
    "english for academic purposes materials",
    "humanities teaching resources",
    "pedagogy resources uk",
    "international student resources",
    // Free resources
    "free academic resources",
    "free teaching materials uk",
    "downloadable worksheets",
    // Author branding
    "ngozi umoru resources",
    "education phd materials"
  ].join(", "),
  authors: [{ name: "Ngozi Blessing Umoru (PhD)", url: "https://ngoziumoru.info" }],
  creator: "Ngozi Blessing Umoru (PhD)",
  publisher: "Ngozi Blessing Umoru (PhD)",
  alternates: {
    canonical: "https://ngoziumoru.info/resources",
  },
  openGraph: {
    title: "Academic Resources | Teaching Materials & Educational Resources UK",
    description: "Access free academic resources, teaching materials, and worksheets for Academic English, EAP/ESL, and Foundation courses. Curated by an experienced UK FE/HE lecturer.",
    url: "https://ngoziumoru.info/resources",
    siteName: "Ngozi Blessing Umoru (PhD)- Academic Portfolio",
    type: "website",
    locale: "en_GB",
    images: [
      {
        url: "https://ngoziumoru.info/og-image-resources.jpg",
        width: 1200,
        height: 630,
        alt: "Academic Resources by Ngozi Blessing Umoru (PhD)",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Academic Resources | Teaching Materials UK",
    description: "Free academic resources, teaching materials, and worksheets for Academic English and EAP courses.",
    images: ["https://ngoziumoru.info/og-image-resources.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  category: "Education",
}

export default function ResourcesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
