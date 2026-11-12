import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { LegalPage } from "@/components/legal/legal-page";

export const metadata: Metadata = {
  title: "Terms of Service | AVAD",
  description: "The rules, community standards, content rights, and responsibilities that apply when using AVAD.",
};

export default function TermsOfServicePage() {
  // Temporarily disabled. Keep this page intact so it can be restored by removing this line.
  notFound();

  return (
    <LegalPage
      title="Terms of Service"
      eyebrow="Using AVAD"
      description="These terms set the ground rules for using AVAD responsibly, participating in the community, and contributing content to the platform."
      lastUpdated="August 8, 2026"
      sections={[
        { id: "agreement", title: "Agreement to these terms", content: <p>By accessing or using AVAD, you agree to these Terms of Service and our <Link href="/privacy-policy" className="font-semibold underline decoration-[var(--avad-gold)] underline-offset-4">Privacy Policy</Link>. If you do not agree, do not use the service. If you use AVAD on behalf of an organization, you confirm that you have authority to bind that organization.</p> },
        { id: "service", title: "The AVAD service", content: <p>AVAD provides faith-based articles, devotionals, daily Scripture, videos, community features, account tools, and related communications. Content is provided for general spiritual reflection and education. It is not medical, mental-health, financial, legal, or emergency advice, and it does not replace qualified professional care or local emergency services.</p> },
        { id: "accounts", title: "Accounts and security", content: <p>You must provide accurate information, keep your login credentials confidential, and promptly tell us if you suspect unauthorized access. You are responsible for activity under your account unless it resulted from our failure to use reasonable security measures. We may suspend or deactivate accounts that are inactive, unsafe, fraudulent, or in breach of these terms.</p> },
        { id: "community", title: "Community standards", content: <><p>When you submit a post, comment, reply, profile detail, or other material, you must have the right to share it and must not submit content that:</p><ul><li>is unlawful, threatening, harassing, hateful, sexually exploitative, defamatory, or deliberately deceptive;</li><li>infringes another person’s privacy, intellectual-property, or other rights;</li><li>contains malware, spam, unauthorized advertising, or attempts to collect credentials;</li><li>promotes harm, discrimination, exploitation, or illegal activity; or</li><li>pretends to be another person or misrepresents an affiliation with AVAD.</li></ul><p>We may review, moderate, limit visibility of, edit for safety, or remove content that violates these standards or creates risk. Moderation decisions may include rejecting submissions or restricting participation. If your content is removed, you may contact us with relevant context.</p></> },
        { id: "content-rights", title: "Content and intellectual property", content: <p>You retain ownership of original content you submit. You grant AVAD a non-exclusive, worldwide, royalty-free license to host, store, reproduce, adapt for formatting and moderation, publish, and display that content as needed to operate and promote the service. This license ends within a reasonable period after you delete the content, except for copies needed for legal, security, backup, or dispute-resolution purposes. AVAD’s name, design, software, and original platform materials belong to AVAD or its licensors and may not be copied or reused without permission.</p> },
        { id: "third-party", title: "Third-party services and links", content: <p>AVAD may link to or integrate with third-party services, including social networks, email providers, hosting providers, or video platforms. Those services operate under their own terms and privacy policies. We are not responsible for their availability, content, security, or practices.</p> },
        { id: "availability", title: "Availability and disclaimers", content: <p>We aim to keep AVAD reliable, but the service may be changed, interrupted, or unavailable for maintenance, security, technical, or operational reasons. To the fullest extent permitted by law, AVAD is provided on an “as is” and “as available” basis without warranties that it will always be uninterrupted, error-free, or suitable for a particular purpose.</p> },
        { id: "liability", title: "Liability and indemnity", content: <p>To the fullest extent permitted by applicable law, AVAD and its team will not be liable for indirect, incidental, special, consequential, or punitive loss arising from use of the service. Nothing in these terms excludes liability that cannot legally be excluded. You agree to reimburse reasonable losses, claims, and costs arising from your unlawful use of AVAD, your submitted content, or your breach of these terms.</p> },
        { id: "termination", title: "Termination and changes", content: <p>You may stop using AVAD at any time. We may suspend or terminate access where reasonably necessary to protect the service, users, or our legal interests. Sections that by their nature should survive termination will continue to apply. We may update these terms by publishing a revised version; continued use after the effective date means you accept the revised terms.</p> },
        { id: "contact", title: "Contact and governing law", content: <p>Questions about these terms can be sent to <a href="mailto:support@samsonbabajidefayoyiwa.org" className="font-semibold text-[var(--avad-text-strong)] underline decoration-[var(--avad-gold)] underline-offset-4">support@samsonbabajidefayoyiwa.org</a>. Any governing law, venue, consumer protections, or dispute process should be completed with advice from qualified counsel for the jurisdictions in which AVAD operates.</p> },
      ]}
    />
  );
}
