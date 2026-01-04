// ============================================================================
// Default Profile Data - Ngozi Blessing Umoru
// Academic Portfolio Profile Configuration
// ============================================================================

import type { SiteProfile } from "./site-types"

export const defaultProfile: SiteProfile = {
  // Core identity
  fullName: "Ngozi Blessing Umoru",
  displayName: "Dr. Ngozi Blessing Umoru",
  credentials: "B.Ed, MA, MA Edu, PhD",
  title: "Academic English Tutor & Lecturer",
  
  // Contact
  email: "ngoziblessingumoru@gmail.com",
  phone: undefined,
  location: "United Kingdom",
  
  // Professional
  institution: undefined,
  department: undefined,
  orcidId: undefined,
  
  // Biography
  shortBio: "Dynamic and student-centred Lecturer and Academic English Tutor with extensive experience teaching Academic English, EAP/ESL, Humanities, and Foundation-level courses across UK FE/HE settings.",
  
  // Images
  profileImage: "/Ngozi Umoru.png",
  coverImage: undefined,
  
  // Social links
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
}
