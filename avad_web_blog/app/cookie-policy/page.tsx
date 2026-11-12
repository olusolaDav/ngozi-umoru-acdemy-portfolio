import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { LegalPage } from "@/components/legal/legal-page";

export const metadata: Metadata = {
  title: "Cookie Policy | AVAD",
  description: "Learn how AVAD uses essential cookies and local browser storage for authentication, preferences, and platform functionality.",
};

export default function CookiePolicyPage() {
  // Temporarily disabled. Keep this page intact so it can be restored by removing this line.
  notFound();

  return (
    <LegalPage
      title="Cookie Policy"
      eyebrow="Cookies and local storage"
      description="This policy explains the small amount of browser storage AVAD currently uses to keep the platform secure, remember preferences, and make content interactions work."
      lastUpdated="August 8, 2026"
      sections={[
        { id: "what-are-cookies", title: "What cookies are", content: <p>Cookies are small text files placed on your device by a website. Similar technologies, including local storage, can save information in your browser without sending it to a server on every request. This policy covers both cookies and those similar technologies used by AVAD.</p> },
        { id: "what-we-use", title: "What AVAD currently uses", content: <><p>AVAD currently uses limited, functional browser storage:</p><ul><li><strong>Authentication and security:</strong> session or refresh cookies may be used to keep signed-in members authenticated and to protect account requests. These are essential to member features.</li><li><strong>Consent preference:</strong> the first-party <strong>avad_cookie_consent</strong> cookie remembers whether you accepted all or rejected non-essential technologies for up to one year.</li><li><strong>Consent visitor identifier:</strong> a random identifier in local storage lets the platform update your consent record without using your name or email. It is not used for advertising or behavioral profiling.</li><li><strong>Theme preference:</strong> the light/dark appearance preference is stored locally so the interface can remember your choice.</li><li><strong>Devotional interactions:</strong> local browser markers may remember that you viewed or liked a devotional or comment, helping prevent duplicate interactions on the same device.</li><li><strong>Basic operation:</strong> temporary storage may be used by the application, framework, or browser to support navigation, form state, and security.</li></ul><p>Names, durations, and providers can vary by deployment. The current public site does not intentionally use advertising cookies, cross-site behavioral tracking, or an analytics tag. We will update this policy before introducing new non-essential tracking.</p></> },
        { id: "third-party", title: "Third-party content", content: <p>Links and embedded or shared content from services such as YouTube, Instagram, LinkedIn, Facebook, or X may allow those providers to set or read their own storage when you interact with them. Their use of data is controlled by their own policies, not this one. Opening a third-party service in a new tab does not make AVAD responsible for that service.</p> },
        { id: "your-choices", title: "Your choices", content: <><p>On your first visit, AVAD presents a cookie notice where you can accept or reject optional cookies. Your choice is saved for up to one year in a first-party preference cookie and local browser storage. AVAD currently does not deploy non-essential analytics or advertising cookies, so accepting optional cookies does not activate a marketing tracker today. If optional technologies are introduced, your saved choice will determine whether they are enabled and the notice will be updated.</p><p>You can delete local storage and block or restrict cookies through your browser settings. Blocking essential authentication or security storage may prevent sign-in and member features from working. Browser controls differ by device and browser; consult your browser’s privacy or cookie settings for help.</p></> },
        { id: "future-changes", title: "Future changes and contact", content: <><p>If we add analytics, personalization, advertising, or other non-essential technologies, we will identify them here, explain their purpose and retention, and provide consent or opt-out controls where required by law. We may also revise this policy when the platform changes.</p><p>Questions about cookies or privacy can be sent to <a href="mailto:support@samsonbabajidefayoyiwa.org" className="font-semibold text-[var(--avad-text-strong)] underline decoration-[var(--avad-gold)] underline-offset-4">support@samsonbabajidefayoyiwa.org</a>.</p></> },
      ]}
    />
  );
}
