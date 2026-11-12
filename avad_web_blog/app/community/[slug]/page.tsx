//apps/web/app/community/[slug]/page.tsx

import { redirect } from "next/navigation";

type LegacyCommunitySlugPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function LegacyCommunitySlugPage({ params }: LegacyCommunitySlugPageProps) {
  const { slug } = await params;
  redirect(`/community/thread/${slug}`);
}
