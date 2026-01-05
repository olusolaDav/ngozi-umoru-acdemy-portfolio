import type { Metadata } from "next"
import { HomeContent } from "@/components/home/home-content"

// Static metadata for homepage  
export const metadata: Metadata = {
  title: "Ngozi Blessing Umoru (PhD) | Academic English Tutor & Lecturer | UK",
  description: "Dynamic and student-centred Lecturer and Academic English Tutor with extensive experience teaching Academic English, EAP/ESL, Humanities, and Foundation-level courses across UK FE/HE settings. PhD in Education & Pedagogy.",
  keywords: "academic english tutor uk, eap tutor united kingdom, esl lecturer uk, higher education lecturer, education phd researcher, ngozi umoru",
  authors: [{ name: "Ngozi Blessing Umoru (PhD)" }],
  creator: "Ngozi Blessing Umoru (PhD)",
  openGraph: {
    title: "Ngozi Blessing Umoru (PhD) | Academic English Tutor & Lecturer",
    description: "PhD researcher and Academic English Tutor with extensive UK FE/HE teaching experience. Specialising in EAP/ESL, Academic Writing, and Humanities instruction.",
    type: "website",
    locale: "en_GB",
  },
  twitter: {
    card: "summary_large_image",
    title: "Ngozi Blessing Umoru (PhD) | Academic English Tutor & Lecturer",
    description: "PhD researcher and Academic English Tutor with extensive UK FE/HE teaching experience.",
  },
}

export default function Home() {
  return <HomeContent />
}
