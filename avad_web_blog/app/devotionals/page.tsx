import type { Metadata } from "next";

import { DevotionalsPage } from "@/features/devotionals/devotionals-page";
import { contentMetadata } from "@/lib/seo";

export const metadata: Metadata = contentMetadata({ title: "Daily Christian Devotionals", description: "Find daily Christian devotionals, Bible reflections, prayers, and encouragement for a deeper walk with God.", path: "/devotionals", type: "website" });

export default function DevotionalsRoutePage() {
  return <DevotionalsPage />;
}
