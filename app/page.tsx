import type { Metadata } from "next"
import { HomeContent } from "@/components/home/home-content"

// Optimized metadata for homepage with UK academic keywords
export const metadata: Metadata = {
  title: "Dr. Ngozi Blessing Umoru | Academic English Lecturer & EAP Tutor UK | Education PhD",
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
  authors: [{ name: "Dr. Ngozi Blessing Umoru", url: "https://www.ngoziumoru.info" }],
  creator: "Dr. Ngozi Blessing Umoru",
  publisher: "Dr. Ngozi Blessing Umoru",
  alternates: {
    canonical: "https://www.ngoziumoru.info",
  },
  openGraph: {
    title: "Dr. Ngozi Blessing Umoru | Academic English Lecturer & EAP Tutor UK",
    description: "Award-winning PhD researcher and Academic English Tutor with extensive UK FE/HE teaching experience. Specialising in EAP/ESL, Academic Writing, and supporting international students in British higher education.",
    url: "https://www.ngoziumoru.info",
    siteName: "Dr. Ngozi Blessing Umoru - Academic Portfolio",
    type: "profile",
    locale: "en_GB",
    images: [
      {
          url: "/academic-portrait.png",
          width: 1024,
          height: 680,
        alt: "Dr. Ngozi Blessing Umoru - Academic English Lecturer",
          type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Dr. Ngozi Blessing Umoru | Academic English Lecturer UK",
    description: "PhD researcher and Academic English Tutor with extensive UK FE/HE teaching experience. Specialising in EAP/ESL and Academic Writing.",
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

export default function Home() {
  return <HomeContent />
}