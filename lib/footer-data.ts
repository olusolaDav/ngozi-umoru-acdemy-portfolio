// ============================================================================
// Default Footer Data - Ngozi Blessing Umoru
// Academic Portfolio Footer Configuration
// ============================================================================

import type { FooterContent } from "./site-types"

export const defaultFooter: FooterContent = {
  // About column
  about: {
    name: "Dr. Ngozi Blessing Umoru",
    description: "Dynamic and student-centred Lecturer and Academic English Tutor with extensive experience in UK FE/HE settings.",
    profileImage: "/Ngozi Umoru.png",
  },
  
  // Quick links
  quickLinks: {
    title: "Quick Links",
    links: [
      { label: "About", href: "/#about" },
      { label: "Experience", href: "/#experience" },
      { label: "Education", href: "/#education" },
      { label: "Publications", href: "/#publications" },
      { label: "Resources", href: "/resources" },
      { label: "Blog", href: "/blog" },
      { label: "Contact", href: "/contact" },
    ],
  },
  
  // Research links
  researchLinks: {
    title: "Research Profiles",
    links: [
      { 
        label: "ResearchGate", 
        href: "https://www.researchgate.net/scientific-contributions/Ngozi-Blessing-Umoru-2330422223",
        external: true 
      },
      { 
        label: "Google Scholar", 
        href: "https://scholar.google.com/citations?user=UT3Xz5UAAAAJ",
        external: true 
      },
    ],
  },
  
  // Social media
  socialLinks: [
    {
      id: "researchgate",
      platform: "researchgate",
      url: "https://www.researchgate.net/scientific-contributions/Ngozi-Blessing-Umoru-2330422223",
      label: "ResearchGate",
      icon: "FileText",
      enabled: true,
    },
    {
      id: "googlescholar",
      platform: "googlescholar",
      url: "https://scholar.google.com/citations?user=UT3Xz5UAAAAJ",
      label: "Google Scholar",
      icon: "GraduationCap",
      enabled: true,
    },
    {
      id: "linkedin",
      platform: "linkedin",
      url: "",
      label: "LinkedIn",
      icon: "Linkedin",
      enabled: false,
    },
    {
      id: "facebook",
      platform: "facebook",
      url: "",
      label: "Facebook",
      icon: "Facebook",
      enabled: false,
    },
  ],
  
  // Contact info
  contact: {
    email: "hello@ngoziumoru.info",
    phone: undefined,
    location: "United Kingdom",
  },
  
  // Copyright
  copyright: {
    text: "Dr. Ngozi Blessing Umoru. All rights reserved.",
    year: new Date().getFullYear(),
  },
}
