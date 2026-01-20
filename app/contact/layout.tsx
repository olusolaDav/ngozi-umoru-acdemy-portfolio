import type { Metadata } from "next"

// Optimized metadata for contact page
export const metadata: Metadata = {
  title: "Contact | Get in Touch with Ngozi Blessing Umoru (PhD)| Academic Collaboration UK",
  description: "Contact Ngozi Blessing Umoru (PhD)for academic collaborations, research inquiries, teaching opportunities, speaking engagements, or EAP/ESL consultations. Based in the UK, available for FE/HE institutions and educational initiatives.",
  keywords: [
    // Primary contact keywords
    "contact academic lecturer uk",
    "eap tutor contact",
    "academic collaboration uk",
    "teaching inquiry",
    // Collaboration types
    "research collaboration",
    "speaking engagement academic",
    "educational consultant uk",
    "curriculum development consultation",
    // Services
    "academic english consultation",
    "esl teaching services",
    "higher education services uk",
    "fe he lecturer contact",
    // Professional services
    "academic workshop facilitator",
    "education research collaboration",
    "thesis supervision inquiry",
    // Location-based
    "uk academic contact",
    "london education consultant",
    // Author branding
    "contact dr ngozi umoru",
    "ngozi umoru consultation"
  ].join(", "),
  authors: [{ name: "Ngozi Blessing Umoru (PhD)", url: "https://ngoziumoru.info" }],
  creator: "Ngozi Blessing Umoru (PhD)",
  publisher: "Ngozi Blessing Umoru (PhD)",
  alternates: {
    canonical: "https://ngoziumoru.info/contact",
  },
  openGraph: {
    title: "Contact | Get in Touch with Ngozi Blessing Umoru (PhD)",
    description: "Contact for academic collaborations, research inquiries, teaching opportunities, or EAP/ESL consultations. Available for UK FE/HE institutions.",
    url: "https://ngoziumoru.info/contact",
    siteName: "Ngozi Blessing Umoru (PhD)- Academic Portfolio",
    type: "website",
    locale: "en_GB",
    images: [
      {
        url: "https://ngoziumoru.info/og-image-contact.jpg",
        width: 1200,
        height: 630,
        alt: "Contact Ngozi Blessing Umoru (PhD)",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact | Ngozi Blessing Umoru (PhD)",
    description: "Get in touch for academic collaborations, research inquiries, or teaching opportunities.",
    images: ["https://ngoziumoru.info/og-image-contact.jpg"],
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

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
