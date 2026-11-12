import type { Metadata } from "next"

// Optimized metadata for resources page
export const metadata: Metadata = {
  title: "Academic Resources | Teaching Materials & Educational Resources UK | Dr. Ngozi Blessing Umoru",
  description: "Access free academic resources, teaching materials, worksheets, curriculum guides, and lesson plans for Academic English, EAP/ESL, and Foundation-level courses. Curated by Dr. Ngozi Blessing Umoru, experienced UK FE/HE lecturer with expertise in student-centred pedagogy.",
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
  authors: [{ name: "Dr. Ngozi Blessing Umoru", url: "https://www.ngoziumoru.info" }],
  creator: "Dr. Ngozi Blessing Umoru",
  publisher: "Dr. Ngozi Blessing Umoru",
  alternates: {
    canonical: "https://www.ngoziumoru.info/resources",
  },
  openGraph: {
    title: "Academic Resources | Teaching Materials & Educational Resources UK",
    description: "Access free academic resources, teaching materials, and worksheets for Academic English, EAP/ESL, and Foundation courses. Curated by an experienced UK FE/HE lecturer.",
    url: "https://www.ngoziumoru.info/resources",
    siteName: "Dr. Ngozi Blessing Umoru - Academic Portfolio",
    type: "website",
    locale: "en_GB",
    images: [
      {
          url: "/academic-portrait.png",
          width: 1024,
          height: 680,
        alt: "Academic Resources by Dr. Ngozi Blessing Umoru",
          type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Academic Resources | Teaching Materials UK",
    description: "Free academic resources, teaching materials, and worksheets for Academic English and EAP courses.",
    images: ["/academic-portrait.png"],
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
