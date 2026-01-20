import type { Metadata } from "next"
import { HomeContent } from "@/components/home/home-content"

// Optimized metadata for homepage with UK academic keywords
export const metadata: Metadata = {
  title: "Ngozi Blessing Umoru (PhD)| Academic English Lecturer & EAP Tutor UK | Education PhD",
  description: "Award-winning Academic English Lecturer and EAP/ESL Tutor based in the UK. PhD in Education & Pedagogy. Specialising in Academic Writing, English for Academic Purposes, and Foundation-level teaching across FE/HE institutions. Experienced in curriculum development, student-centred learning, and supporting international students.",
  keywords: [
    // Primary UK academic keywords
    "academic english tutor uk",
    "eap tutor united kingdom", 
    "english for academic purposes lecturer",
    "esl teacher uk higher education",
    "academic writing tutor uk",
    "education phd researcher uk",
    // Secondary keywords
    "foundation year lecturer",
    "higher education lecturer uk",
    "fe he lecturer",
    "humanities lecturer",
    "international student support uk",
    "academic skills tutor",
    "curriculum development specialist",
    // Location-based
    "london academic tutor",
    "uk university lecturer",
    // Specific expertise
    "thesis writing support",
    "academic english workshops",
    "student-centred teaching",
    "ngozi umoru phd",
    "dr ngozi umoru"
  ].join(", "),
  authors: [{ name: "Ngozi Blessing Umoru (PhD)", url: "https://ngoziumoru.info" }],
  creator: "Ngozi Blessing Umoru (PhD)",
  publisher: "Ngozi Blessing Umoru (PhD)",
  alternates: {
    canonical: "https://ngoziumoru.info",
  },
  openGraph: {
    title: "Ngozi Blessing Umoru (PhD)| Academic English Lecturer & EAP Tutor UK",
    description: "Award-winning PhD researcher and Academic English Tutor with extensive UK FE/HE teaching experience. Specialising in EAP/ESL, Academic Writing, and supporting international students in British higher education.",
    url: "https://ngoziumoru.info",
    siteName: "Ngozi Blessing Umoru (PhD)- Academic Portfolio",
    type: "profile",
    locale: "en_GB",
    images: [
      {
        url: "https://ngoziumoru.info/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Ngozi Blessing Umoru (PhD)- Academic English Lecturer",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Ngozi Blessing Umoru (PhD)| Academic English Lecturer UK",
    description: "PhD researcher and Academic English Tutor with extensive UK FE/HE teaching experience. Specialising in EAP/ESL and Academic Writing.",
    images: ["https://ngoziumoru.info/og-image.jpg"],
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

export default function Home() {
  return <HomeContent />
}