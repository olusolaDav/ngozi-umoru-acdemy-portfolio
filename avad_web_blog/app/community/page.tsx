import type { Metadata } from "next";

import { CommunityPage } from "@/features/community/community-page";
import { contentMetadata } from "@/lib/seo";

export const metadata: Metadata = contentMetadata({ title: "Christian Community and Faith Conversations", description: "Join AVAD's Christian community for faith conversations, personal reflections, prayer, and encouragement.", path: "/community", type: "website" });

export default function CommunityRoutePage() {
  return <CommunityPage />;
}
