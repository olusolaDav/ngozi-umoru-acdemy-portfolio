import type { Metadata } from "next";

import { BlogPage } from "@/features/blog/blog-page-main";
import { contentMetadata } from "@/lib/seo";

export const metadata: Metadata = contentMetadata({ title: "Christian Blog and Bible Insights", description: "Read Christian articles, Bible insights, faith reflections, and practical spiritual encouragement from AVAD.", path: "/blog", type: "website" });

export default function BlogRoutePage() {
  return <BlogPage />;
}
