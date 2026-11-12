import type { Metadata } from "next";

import { AboutPage } from "@/features/about/about-page";
import { contentMetadata } from "@/lib/seo";

export const metadata: Metadata = contentMetadata({ title: "About AVAD - A Verse A Day", description: "Learn about AVAD's mission to help people grow in faith through daily Scripture, devotionals, and Christian community.", path: "/about", type: "website" });

export default function AboutRoutePage() {
  return <AboutPage />;
}
