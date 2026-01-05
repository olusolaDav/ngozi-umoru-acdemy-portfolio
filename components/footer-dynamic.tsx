"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { 
  Mail, 
  FileText, 
  Linkedin, 
  Facebook, 
  Twitter, 
  Instagram, 
  Github, 
  Youtube, 
  CircleUser,
  GraduationCap,
  ExternalLink,
  Globe,
  BookOpen,
  Music,
  MessageCircle,
  Send,
  Pin,
  AtSign,
  Link2
} from "lucide-react"
import type { FooterContent, SocialLink } from "@/lib/site-types"

// Icon mapping for social platforms - maps platform name to Lucide icon
const platformIcons: Record<string, React.ElementType> = {
  linkedin: Linkedin,
  facebook: Facebook, 
  twitter: Twitter,
  instagram: Instagram,
  github: Github,
  youtube: Youtube,
  tiktok: Music,
  researchgate: BookOpen,
  googlescholar: GraduationCap,
  orcid: CircleUser,
  whatsapp: MessageCircle,
  telegram: Send,
  pinterest: Pin,
  threads: AtSign,
  other: Link2,
}

// Legacy icon mapping for backwards compatibility
const socialIcons = {
  Mail,
  FileText,
  Linkedin,
  Facebook, 
  Twitter,
  Instagram,
  Github,
  Youtube,
  CircleUser,
  GraduationCap,
  ExternalLink,
  Globe,
  BookOpen,
  Music,
  MessageCircle,
  Send,
  Pin,
  AtSign,
  Link2
} as const

export function Footer() {
  const [footerData, setFooterData] = useState<FooterContent | null>(null)
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchFooterData = async () => {
      try {
        const res = await fetch("/api/admin/site")
        const data = await res.json()
        if (data.ok && data.content?.footer) {
          setFooterData(data.content.footer)
        }
        // Get social links from profile section
        if (data.ok && data.content?.profile?.socialLinks) {
          setSocialLinks(data.content.profile.socialLinks)
        }
      } catch (error) {
        console.error("Failed to fetch footer data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchFooterData()
  }, [])

  // Get the correct icon for a social platform
  const getSocialIcon = (platform: string, iconName?: string) => {
    // First try to get by platform name
    const PlatformIcon = platformIcons[platform.toLowerCase()]
    if (PlatformIcon) return <PlatformIcon className="h-4 w-4" />
    
    // Fallback to icon name if provided
    if (iconName) {
      const IconComponent = socialIcons[iconName as keyof typeof socialIcons]
      if (IconComponent) return <IconComponent className="h-4 w-4" />
    }
    
    return <ExternalLink className="h-4 w-4" />
  }

  // Fallback data if loading or API fails
  const fallbackData: FooterContent = {
    about: {
      name: "Dr. Ngozi Blessing Umoru",
      description: "Dynamic and student-centred Lecturer and Academic English Tutor with extensive experience in UK FE/HE settings."
    },
    quickLinks: {
      title: "Quick Links",
      links: [
        { label: "About", href: "/#about" },
        { label: "Experience", href: "/#experience" },
        { label: "Publications", href: "/#publications" },
        { label: "Resources", href: "/resources" },
        { label: "Blog", href: "/blog" },
        { label: "Contact", href: "/contact" }
      ]
    },
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
        }
      ]
    },
    socialLinks: [],
    contact: {
      email: "hello@ngoziumoru.info"
    },
    copyright: {
      text: "Dr. Ngozi Blessing Umoru. All rights reserved.",
      year: new Date().getFullYear()
    }
  }

  const data = footerData || fallbackData

  return (
    <footer className="bg-muted/50 border-t border-border mt-20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About Section */}
          <div className="md:col-span-1">
            <h3 className="font-semibold text-lg mb-4">{data.about.name}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {data.about.description}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-lg mb-4">{data.quickLinks.title}</h3>
            <div className="flex flex-col gap-2">
              {data.quickLinks.links.map((link, index) => (
                <Link 
                  key={index} 
                  href={link.href} 
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  {...(link.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                >
                  {link.label}
                  {link.external && <ExternalLink className="inline h-3 w-3 ml-1" />}
                </Link>
              ))}
            </div>
          </div>

          {/* Research Links */}
          <div>
            <h3 className="font-semibold text-lg mb-4">{data.researchLinks.title}</h3>
            <div className="flex flex-col gap-2">
              {data.researchLinks.links.map((link, index) => (
                <a
                  key={index}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  <FileText className="h-4 w-4" />
                  {link.label}
                </a>
              ))}
            </div>
          </div>

          {/* Contact & Social */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Connect</h3>
            <div className="flex flex-col gap-3">
              {/* Email */}
              <a
                href={`mailto:${data.contact.email}`}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                <Mail className="h-4 w-4" />
                {data.contact.email}
              </a>

              {/* Social Links from Profile - only show enabled ones */}
              {socialLinks
                .filter(link => link.enabled && link.url)
                .map((link, index) => (
                <a
                  key={link.id || index}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  {getSocialIcon(link.platform, link.icon)}
                  {link.label}
                </a>
              ))}

              {/* Fallback: show footer socialLinks if profile socialLinks are empty */}
              {socialLinks.length === 0 && data.socialLinks
                .filter(link => link.enabled && link.url)
                .map((link, index) => (
                <a
                  key={index}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  {getSocialIcon(link.platform, link.icon)}
                  {link.label}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Copyright & Agency Credit */}
        <div className="mt-8 pt-8 border-t border-border">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
            <div>
              © {data.copyright.year} {data.copyright.text}
            </div>
            <div className="flex items-center gap-1">
              <span>Powered by</span>
              <a 
                href="https://agency.alotacademy.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline font-medium"
              >
                Alot Digital Agency
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}