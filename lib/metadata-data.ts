// ============================================================================
// Default Page Metadata - SEO Optimized for UK Academic Recruitment
// Academic Portfolio SEO Configuration
// ============================================================================

import type { SiteMetadata } from "./site-types"

export const defaultMetadata: SiteMetadata = {
  // Site-wide settings
  siteName: "Dr. Ngozi Blessing Umoru | Academic Portfolio",
  siteDescription: "Dynamic and student-centred Lecturer and Academic English Tutor with extensive experience teaching Academic English, EAP/ESL, Humanities, and Foundation-level courses across UK FE/HE settings.",
  siteUrl: "https://ngoziumoru.com",
  locale: "en_GB",
  twitterHandle: undefined,
  
  // Page-specific metadata
  pages: {
    home: {
      title: "Dr. Ngozi Blessing Umoru | Academic English Tutor & Lecturer | UK",
      description: "Dynamic and student-centred Lecturer and Academic English Tutor with extensive experience teaching Academic English, EAP/ESL, Humanities, and Foundation-level courses across UK FE/HE settings. PhD in Education & Pedagogy.",
      keywords: [
        "academic english tutor uk",
        "eap tutor united kingdom",
        "esl lecturer uk",
        "higher education lecturer",
        "further education tutor",
        "academic writing tutor",
        "ielts preparation tutor",
        "education phd researcher",
        "humanities lecturer uk",
        "foundation course tutor",
        "ngozi umoru",
        "academic portfolio",
        "university of nottingham",
        "education pedagogy researcher",
        "ks3 ks4 tutor",
        "adult learner education",
        "curriculum development",
        "academic skills tutor",
      ],
      ogTitle: "Dr. Ngozi Blessing Umoru | Academic English Tutor & Lecturer",
      ogDescription: "PhD researcher and Academic English Tutor with extensive UK FE/HE teaching experience. Specialising in EAP/ESL, Academic Writing, and Humanities instruction.",
      ogImage: "/Ngozi Umoru.png",
      canonicalUrl: "https://ngoziumoru.com",
    },
    blog: {
      title: "Blog | Dr. Ngozi Blessing Umoru | Academic Insights & Education",
      description: "Explore academic insights, education research, teaching methodologies, and scholarly perspectives from Dr. Ngozi Blessing Umoru - PhD researcher and Academic English Tutor.",
      keywords: [
        "academic blog",
        "education research blog",
        "teaching insights",
        "eap teaching tips",
        "academic writing advice",
        "higher education insights",
        "pedagogy research",
        "education phd blog",
        "uk academic blog",
        "scholarly articles",
      ],
      ogTitle: "Blog | Dr. Ngozi Blessing Umoru",
      ogDescription: "Academic insights, education research, and teaching perspectives from a PhD researcher and Academic English Tutor.",
      ogImage: "/Ngozi Umoru.png",
      canonicalUrl: "https://ngoziumoru.com/blog",
    },
    contact: {
      title: "Contact | Dr. Ngozi Blessing Umoru | Academic Collaboration & Enquiries",
      description: "Get in touch with Dr. Ngozi Blessing Umoru for academic collaboration, tutoring enquiries, research partnerships, or speaking engagements in the UK.",
      keywords: [
        "contact academic tutor",
        "hire eap tutor uk",
        "academic collaboration",
        "education consultant contact",
        "tutor enquiries",
        "speaking engagements",
        "research collaboration",
        "academic partnership",
      ],
      ogTitle: "Contact | Dr. Ngozi Blessing Umoru",
      ogDescription: "Reach out for academic collaboration, tutoring enquiries, or research partnerships.",
      ogImage: "/Ngozi Umoru.png",
      canonicalUrl: "https://ngoziumoru.com/contact",
    },
    resources: {
      title: "Resources | Dr. Ngozi Blessing Umoru | Academic Materials & Downloads",
      description: "Access free academic resources, teaching materials, research papers, and educational downloads from Dr. Ngozi Blessing Umoru - Academic English Tutor & PhD Researcher.",
      keywords: [
        "academic resources",
        "teaching materials",
        "eap resources",
        "academic writing guides",
        "education research papers",
        "free academic downloads",
        "teaching resources uk",
        "study materials",
        "learning resources",
      ],
      ogTitle: "Resources | Dr. Ngozi Blessing Umoru",
      ogDescription: "Free academic resources, teaching materials, and educational downloads.",
      ogImage: "/Ngozi Umoru.png",
      canonicalUrl: "https://ngoziumoru.com/resources",
    },
  },
  
  // Schema.org structured data for academics
  schemaOrg: {
    type: "Person",
    name: "Dr. Ngozi Blessing Umoru",
    jobTitle: "Academic English Tutor & Lecturer",
    worksFor: undefined,
    alumniOf: [
      {
        type: "EducationalOrganization",
        name: "University of Nottingham",
      },
      {
        type: "EducationalOrganization",
        name: "University of Lagos",
      },
      {
        type: "EducationalOrganization",
        name: "Obafemi Awolowo University",
      },
      {
        type: "EducationalOrganization",
        name: "Terra Nova University",
      },
    ],
    sameAs: [
      "https://www.researchgate.net/scientific-contributions/Ngozi-Blessing-Umoru-2330422223",
      "https://scholar.google.com/citations?user=UT3Xz5UAAAAJ",
    ],
  },
}
