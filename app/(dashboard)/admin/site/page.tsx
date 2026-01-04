"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AdminDashboardHeader } from "@/components/dashboard/admin-dashboard-header"
import { Switch } from "@/components/ui/switch"
import { 
  Home, 
  User, 
  Briefcase, 
  GraduationCap, 
  BookOpen,
  Loader2,
  Save,
  Plus,
  Trash2,
  ExternalLink,
  Settings,
  Link2,
  FileText,
  Linkedin,
  Facebook,
  Twitter,
  Instagram,
  Github,
  Youtube,
  CircleUser,
  RefreshCw
} from "lucide-react"
import { toast } from "sonner"
import type { SiteProfile, FooterContent, SiteMetadata, SocialLink } from "@/lib/site-types"
import { SOCIAL_PLATFORMS } from "@/lib/site-types"

interface HeroContent {
  badge: string
  name: string
  credentials: string
  description: string
  profileImage: string
}

interface Highlight {
  icon: string
  title: string
  description: string
}

interface AboutContent {
  section: string
  title: string
  paragraphs: string[]
  highlights: Highlight[]
}

interface ExperienceItem {
  position: string
  institution: string
  period: string
  responsibilities: string[]
}

interface ExperienceContent {
  section: string
  title: string
  items: ExperienceItem[]
}

interface EducationItem {
  degree: string
  institution: string
  year: string
}

interface EducationContent {
  section: string
  title: string
  items: EducationItem[]
}

interface PublicationItem {
  type: string
  date: string
  citations?: string
  title: string
  authors: string
  journal: string
  url: string
}

interface PublicationsContent {
  section: string
  title: string
  profiles: { label: string; url: string }[]
  items: PublicationItem[]
}

export default function AdminSitePage() {
  const [activeTab, setActiveTab] = useState("hero")
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Content states
  const [hero, setHero] = useState<HeroContent>({
    badge: "",
    name: "",
    credentials: "",
    description: "",
    profileImage: "",
  })

  const [about, setAbout] = useState<AboutContent>({
    section: "ABOUT",
    title: "",
    paragraphs: [""],
    highlights: [],
  })

  const [experience, setExperience] = useState<ExperienceContent>({
    section: "EXPERIENCE",
    title: "",
    items: [],
  })

  const [education, setEducation] = useState<EducationContent>({
    section: "EDUCATION",
    title: "",
    items: [],
  })

  const [publications, setPublications] = useState<PublicationsContent>({
    section: "PUBLICATIONS",
    title: "",
    profiles: [],
    items: [],
  })

  const [profile, setProfile] = useState<SiteProfile>({
    fullName: "",
    displayName: "",
    credentials: "",
    title: "",
    email: "",
    location: "",
    shortBio: "",
    profileImage: "",
    socialLinks: [],
  })

  const [footer, setFooter] = useState<FooterContent>({
    about: { name: "", description: "" },
    quickLinks: { title: "", links: [] },
    researchLinks: { title: "", links: [] },
    socialLinks: [],
    contact: { email: "" },
    copyright: { text: "", year: new Date().getFullYear() },
  })

  const [metadata, setMetadata] = useState<SiteMetadata>({
    siteName: "",
    siteDescription: "",
    siteUrl: "",
    locale: "en_GB",
    pages: {
      home: { title: "", description: "", keywords: [] },
      blog: { title: "", description: "", keywords: [] },
      contact: { title: "", description: "", keywords: [] },
      resources: { title: "", description: "", keywords: [] },
    },
    schemaOrg: {
      type: "Person",
      name: "",
      jobTitle: "",
      alumniOf: [],
      sameAs: [],
    },
  })

  // Fetch site content on mount
  useEffect(() => {
    const fetchContent = async () => {
      try {
        const res = await fetch("/api/admin/site")
        const data = await res.json()
        if (data.ok && data.content) {
          setHero(data.content.hero || hero)
          setAbout(data.content.about || about)
          setExperience(data.content.experience || experience)
          setEducation(data.content.education || education)
          setPublications(data.content.publications || publications)
          setProfile(data.content.profile || profile)
          setFooter(data.content.footer || footer)
          setMetadata(data.content.metadata || metadata)
        }
      } catch (error) {
        console.error("Error fetching site content:", error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchContent()
  }, [])

  const saveSection = async (section: string, data: any) => {
    setIsSaving(true)
    try {
      const res = await fetch("/api/admin/site", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ section, data }),
      })
      if (res.ok) {
        toast.success(`${section.charAt(0).toUpperCase() + section.slice(1)} section updated successfully`)
      } else {
        toast.error("Failed to update content")
      }
    } catch (error) {
      toast.error("An error occurred")
    } finally {
      setIsSaving(false)
    }
  }

  // Profile helpers
  const addSocialLink = () => {
    const newLink: SocialLink = {
      id: `social-${Date.now()}`,
      platform: "linkedin",
      url: "",
      label: "LinkedIn",
      icon: "Linkedin",
      enabled: true,
    }
    setProfile({ ...profile, socialLinks: [...profile.socialLinks, newLink] })
  }

  const updateSocialLink = (index: number, updates: Partial<SocialLink>) => {
    const newLinks = [...profile.socialLinks]
    newLinks[index] = { ...newLinks[index], ...updates }
    setProfile({ ...profile, socialLinks: newLinks })
  }

  const removeSocialLink = (index: number) => {
    setProfile({ ...profile, socialLinks: profile.socialLinks.filter((_, i) => i !== index) })
  }

  // Footer helpers
  const addFooterQuickLink = () => {
    const newLink = { label: "", href: "" }
    setFooter({
      ...footer,
      quickLinks: { ...footer.quickLinks, links: [...footer.quickLinks.links, newLink] },
    })
  }

  const updateFooterQuickLink = (index: number, field: "label" | "href", value: string) => {
    const newLinks = [...footer.quickLinks.links]
    newLinks[index] = { ...newLinks[index], [field]: value }
    setFooter({
      ...footer,
      quickLinks: { ...footer.quickLinks, links: newLinks },
    })
  }

  const removeFooterQuickLink = (index: number) => {
    setFooter({
      ...footer,
      quickLinks: {
        ...footer.quickLinks,
        links: footer.quickLinks.links.filter((_, i) => i !== index),
      },
    })
  }

  const addFooterResearchLink = () => {
    const newLink = { label: "", href: "", external: true }
    setFooter({
      ...footer,
      researchLinks: { ...footer.researchLinks, links: [...footer.researchLinks.links, newLink] },
    })
  }

  const updateFooterResearchLink = (index: number, field: "label" | "href", value: string) => {
    const newLinks = [...footer.researchLinks.links]
    newLinks[index] = { ...newLinks[index], [field]: value }
    setFooter({
      ...footer,
      researchLinks: { ...footer.researchLinks, links: newLinks },
    })
  }

  const removeFooterResearchLink = (index: number) => {
    setFooter({
      ...footer,
      researchLinks: {
        ...footer.researchLinks,
        links: footer.researchLinks.links.filter((_, i) => i !== index),
      },
    })
  }

  // Metadata helpers
  const updateKeywords = (page: keyof SiteMetadata["pages"], keywords: string) => {
    setMetadata({
      ...metadata,
      pages: {
        ...metadata.pages,
        [page]: {
          ...metadata.pages[page],
          keywords: keywords.split(",").map(k => k.trim()).filter(k => k),
        },
      },
    })
  }

  // Paragraph helpers
  const addParagraph = () => {
    setAbout({ ...about, paragraphs: [...about.paragraphs, ""] })
  }

  const updateParagraph = (index: number, value: string) => {
    const newParagraphs = [...about.paragraphs]
    newParagraphs[index] = value
    setAbout({ ...about, paragraphs: newParagraphs })
  }

  const removeParagraph = (index: number) => {
    setAbout({ ...about, paragraphs: about.paragraphs.filter((_, i) => i !== index) })
  }

  // Highlight helpers
  const addHighlight = () => {
    setAbout({ ...about, highlights: [...about.highlights, { icon: "BookOpen", title: "", description: "" }] })
  }

  const updateHighlight = (index: number, field: keyof Highlight, value: string) => {
    const newHighlights = [...about.highlights]
    newHighlights[index] = { ...newHighlights[index], [field]: value }
    setAbout({ ...about, highlights: newHighlights })
  }

  const removeHighlight = (index: number) => {
    setAbout({ ...about, highlights: about.highlights.filter((_, i) => i !== index) })
  }

  // Experience helpers
  const addExperience = () => {
    setExperience({
      ...experience,
      items: [...experience.items, { position: "", institution: "", period: "", responsibilities: [""] }],
    })
  }

  const updateExperience = (index: number, field: keyof ExperienceItem, value: any) => {
    const newItems = [...experience.items]
    newItems[index] = { ...newItems[index], [field]: value }
    setExperience({ ...experience, items: newItems })
  }

  const removeExperience = (index: number) => {
    setExperience({ ...experience, items: experience.items.filter((_, i) => i !== index) })
  }

  // Education helpers
  const addEducation = () => {
    setEducation({
      ...education,
      items: [...education.items, { degree: "", institution: "", year: "" }],
    })
  }

  const updateEducationItem = (index: number, field: keyof EducationItem, value: string) => {
    const newItems = [...education.items]
    newItems[index] = { ...newItems[index], [field]: value }
    setEducation({ ...education, items: newItems })
  }

  const removeEducation = (index: number) => {
    setEducation({ ...education, items: education.items.filter((_, i) => i !== index) })
  }

  // Publication helpers
  const addPublication = () => {
    setPublications({
      ...publications,
      items: [...publications.items, { type: "Article", date: "", title: "", authors: "", journal: "", url: "" }],
    })
  }

  const updatePublication = (index: number, field: keyof PublicationItem, value: string) => {
    const newItems = [...publications.items]
    newItems[index] = { ...newItems[index], [field]: value }
    setPublications({ ...publications, items: newItems })
  }

  const removePublication = (index: number) => {
    setPublications({ ...publications, items: publications.items.filter((_, i) => i !== index) })
  }

  const addProfile = () => {
    setPublications({
      ...publications,
      profiles: [...publications.profiles, { label: "", url: "" }],
    })
  }

  const updateProfile = (index: number, field: "label" | "url", value: string) => {
    const newProfiles = [...publications.profiles]
    newProfiles[index] = { ...newProfiles[index], [field]: value }
    setPublications({ ...publications, profiles: newProfiles })
  }

  const removeProfile = (index: number) => {
    setPublications({ ...publications, profiles: publications.profiles.filter((_, i) => i !== index) })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50/50 dark:bg-gray-950/50">
        <AdminDashboardHeader
          title="Site Content"
          description="Manage your homepage content"
          breadcrumbs={[
            { label: "Admin", href: "/admin" },
            { label: "Site" },
          ]}
        />
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-950/50">
      <AdminDashboardHeader
        title="Site Content"
        description="Manage your homepage content"
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Site" },
        ]}
        actions={
          <a href="/" target="_blank" rel="noopener noreferrer">
            <Button variant="outline" className="gap-2">
              <ExternalLink className="h-4 w-4" />
              View Site
            </Button>
          </a>
        }
      />

      <div className="px-6 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 p-1 flex-wrap h-auto">
            <TabsTrigger value="hero" className="gap-2">
              <Home className="h-4 w-4" />
              Hero
            </TabsTrigger>
            <TabsTrigger value="about" className="gap-2">
              <User className="h-4 w-4" />
              About
            </TabsTrigger>
            <TabsTrigger value="experience" className="gap-2">
              <Briefcase className="h-4 w-4" />
              Experience
            </TabsTrigger>
            <TabsTrigger value="education" className="gap-2">
              <GraduationCap className="h-4 w-4" />
              Education
            </TabsTrigger>
            <TabsTrigger value="publications" className="gap-2">
              <BookOpen className="h-4 w-4" />
              Publications
            </TabsTrigger>
            <TabsTrigger value="profile" className="gap-2">
              <Settings className="h-4 w-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="footer" className="gap-2">
              <Link2 className="h-4 w-4" />
              Footer
            </TabsTrigger>
            <TabsTrigger value="metadata" className="gap-2">
              <FileText className="h-4 w-4" />
              SEO
            </TabsTrigger>
          </TabsList>

          {/* Hero Section */}
          <TabsContent value="hero" className="space-y-6">
            <Card className="border border-gray-200/50 dark:border-gray-700/50">
              <CardHeader>
                <CardTitle>Hero Section</CardTitle>
                <CardDescription>The main banner at the top of your homepage</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="badge">Badge Text</Label>
                    <Input
                      id="badge"
                      value={hero.badge}
                      onChange={(e) => setHero({ ...hero, badge: e.target.value })}
                      placeholder="Academic Portfolio"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="profileImage">Profile Image URL</Label>
                    <Input
                      id="profileImage"
                      value={hero.profileImage}
                      onChange={(e) => setHero({ ...hero, profileImage: e.target.value })}
                      placeholder="/profile.png"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={hero.name}
                    onChange={(e) => setHero({ ...hero, name: e.target.value })}
                    placeholder="Dr. John Doe (PhD)"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="credentials">Credentials</Label>
                  <Input
                    id="credentials"
                    value={hero.credentials}
                    onChange={(e) => setHero({ ...hero, credentials: e.target.value })}
                    placeholder="B.Ed, MA, PhD"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={hero.description}
                    onChange={(e) => setHero({ ...hero, description: e.target.value })}
                    placeholder="A brief professional description..."
                    rows={4}
                  />
                </div>

                <Button 
                  onClick={() => saveSection("hero", hero)} 
                  disabled={isSaving} 
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                  Save Hero Section
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* About Section */}
          <TabsContent value="about" className="space-y-6">
            <Card className="border border-gray-200/50 dark:border-gray-700/50">
              <CardHeader>
                <CardTitle>About Section</CardTitle>
                <CardDescription>Your professional profile and highlights</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="aboutSection">Section Label</Label>
                    <Input
                      id="aboutSection"
                      value={about.section}
                      onChange={(e) => setAbout({ ...about, section: e.target.value })}
                      placeholder="ABOUT"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="aboutTitle">Section Title</Label>
                    <Input
                      id="aboutTitle"
                      value={about.title}
                      onChange={(e) => setAbout({ ...about, title: e.target.value })}
                      placeholder="Professional Profile"
                    />
                  </div>
                </div>

                {/* Paragraphs */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>About Paragraphs</Label>
                    <Button variant="outline" size="sm" onClick={addParagraph}>
                      <Plus className="h-4 w-4 mr-1" /> Add Paragraph
                    </Button>
                  </div>
                  {about.paragraphs.map((para, index) => (
                    <div key={index} className="flex gap-2">
                      <Textarea
                        value={para}
                        onChange={(e) => updateParagraph(index, e.target.value)}
                        placeholder={`Paragraph ${index + 1}`}
                        rows={3}
                        className="flex-1"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeParagraph(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>

                {/* Highlights */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Highlights</Label>
                    <Button variant="outline" size="sm" onClick={addHighlight}>
                      <Plus className="h-4 w-4 mr-1" /> Add Highlight
                    </Button>
                  </div>
                  {about.highlights.map((highlight, index) => (
                    <div key={index} className="p-4 border rounded-lg space-y-3">
                      <div className="flex justify-between items-start">
                        <span className="text-sm font-medium">Highlight {index + 1}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeHighlight(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="grid gap-3 md:grid-cols-3">
                        <div className="space-y-1">
                          <Label className="text-xs">Icon</Label>
                          <select
                            value={highlight.icon}
                            onChange={(e) => updateHighlight(index, "icon", e.target.value)}
                            className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                          >
                            <option value="BookOpen">BookOpen</option>
                            <option value="GraduationCap">GraduationCap</option>
                            <option value="Award">Award</option>
                            <option value="Briefcase">Briefcase</option>
                            <option value="Globe">Globe</option>
                          </select>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Title</Label>
                          <Input
                            value={highlight.title}
                            onChange={(e) => updateHighlight(index, "title", e.target.value)}
                            placeholder="Title"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Description</Label>
                          <Input
                            value={highlight.description}
                            onChange={(e) => updateHighlight(index, "description", e.target.value)}
                            placeholder="Description"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <Button 
                  onClick={() => saveSection("about", about)} 
                  disabled={isSaving} 
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                  Save About Section
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Experience Section */}
          <TabsContent value="experience" className="space-y-6">
            <Card className="border border-gray-200/50 dark:border-gray-700/50">
              <CardHeader>
                <CardTitle>Experience Section</CardTitle>
                <CardDescription>Your teaching and work experience</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Section Label</Label>
                    <Input
                      value={experience.section}
                      onChange={(e) => setExperience({ ...experience, section: e.target.value })}
                      placeholder="EXPERIENCE"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Section Title</Label>
                    <Input
                      value={experience.title}
                      onChange={(e) => setExperience({ ...experience, title: e.target.value })}
                      placeholder="Teaching Experience"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Experience Items</Label>
                    <Button variant="outline" size="sm" onClick={addExperience}>
                      <Plus className="h-4 w-4 mr-1" /> Add Experience
                    </Button>
                  </div>
                  {experience.items.map((item, index) => (
                    <div key={index} className="p-4 border rounded-lg space-y-3">
                      <div className="flex justify-between items-start">
                        <span className="text-sm font-medium">Experience {index + 1}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeExperience(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="grid gap-3 md:grid-cols-2">
                        <div className="space-y-1">
                          <Label className="text-xs">Position</Label>
                          <Input
                            value={item.position}
                            onChange={(e) => updateExperience(index, "position", e.target.value)}
                            placeholder="Job Title"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Institution</Label>
                          <Input
                            value={item.institution}
                            onChange={(e) => updateExperience(index, "institution", e.target.value)}
                            placeholder="Company/Institution"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Period</Label>
                          <Input
                            value={item.period}
                            onChange={(e) => updateExperience(index, "period", e.target.value)}
                            placeholder="Jan 2020 - Present"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Responsibilities (comma-separated)</Label>
                          <Textarea
                            value={item.responsibilities.join(", ")}
                            onChange={(e) => updateExperience(index, "responsibilities", e.target.value.split(", "))}
                            placeholder="Responsibility 1, Responsibility 2"
                            rows={2}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <Button 
                  onClick={() => saveSection("experience", experience)} 
                  disabled={isSaving} 
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                  Save Experience Section
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Education Section */}
          <TabsContent value="education" className="space-y-6">
            <Card className="border border-gray-200/50 dark:border-gray-700/50">
              <CardHeader>
                <CardTitle>Education Section</CardTitle>
                <CardDescription>Your academic qualifications</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Section Label</Label>
                    <Input
                      value={education.section}
                      onChange={(e) => setEducation({ ...education, section: e.target.value })}
                      placeholder="EDUCATION"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Section Title</Label>
                    <Input
                      value={education.title}
                      onChange={(e) => setEducation({ ...education, title: e.target.value })}
                      placeholder="Academic Qualifications"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Education Items</Label>
                    <Button variant="outline" size="sm" onClick={addEducation}>
                      <Plus className="h-4 w-4 mr-1" /> Add Education
                    </Button>
                  </div>
                  {education.items.map((item, index) => (
                    <div key={index} className="p-4 border rounded-lg space-y-3">
                      <div className="flex justify-between items-start">
                        <span className="text-sm font-medium">Education {index + 1}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeEducation(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="grid gap-3 md:grid-cols-3">
                        <div className="space-y-1">
                          <Label className="text-xs">Degree</Label>
                          <Input
                            value={item.degree}
                            onChange={(e) => updateEducationItem(index, "degree", e.target.value)}
                            placeholder="PhD Education"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Institution</Label>
                          <Input
                            value={item.institution}
                            onChange={(e) => updateEducationItem(index, "institution", e.target.value)}
                            placeholder="University Name"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Year</Label>
                          <Input
                            value={item.year}
                            onChange={(e) => updateEducationItem(index, "year", e.target.value)}
                            placeholder="2023"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <Button 
                  onClick={() => saveSection("education", education)} 
                  disabled={isSaving} 
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                  Save Education Section
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Publications Section */}
          <TabsContent value="publications" className="space-y-6">
            <Card className="border border-gray-200/50 dark:border-gray-700/50">
              <CardHeader>
                <CardTitle>Publications Section</CardTitle>
                <CardDescription>Your research and publications</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Section Label</Label>
                    <Input
                      value={publications.section}
                      onChange={(e) => setPublications({ ...publications, section: e.target.value })}
                      placeholder="PUBLICATIONS"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Section Title</Label>
                    <Input
                      value={publications.title}
                      onChange={(e) => setPublications({ ...publications, title: e.target.value })}
                      placeholder="Research & Publications"
                    />
                  </div>
                </div>

                {/* Profile Links */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Profile Links</Label>
                    <Button variant="outline" size="sm" onClick={addProfile}>
                      <Plus className="h-4 w-4 mr-1" /> Add Profile
                    </Button>
                  </div>
                  {publications.profiles.map((profile, index) => (
                    <div key={index} className="flex gap-2 items-end">
                      <div className="flex-1 space-y-1">
                        <Label className="text-xs">Label</Label>
                        <Input
                          value={profile.label}
                          onChange={(e) => updateProfile(index, "label", e.target.value)}
                          placeholder="ResearchGate Profile"
                        />
                      </div>
                      <div className="flex-1 space-y-1">
                        <Label className="text-xs">URL</Label>
                        <Input
                          value={profile.url}
                          onChange={(e) => updateProfile(index, "url", e.target.value)}
                          placeholder="https://researchgate.net/..."
                        />
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeProfile(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>

                {/* Publication Items */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Publications</Label>
                    <Button variant="outline" size="sm" onClick={addPublication}>
                      <Plus className="h-4 w-4 mr-1" /> Add Publication
                    </Button>
                  </div>
                  {publications.items.map((item, index) => (
                    <div key={index} className="p-4 border rounded-lg space-y-3">
                      <div className="flex justify-between items-start">
                        <span className="text-sm font-medium">Publication {index + 1}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removePublication(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="grid gap-3 md:grid-cols-3">
                        <div className="space-y-1">
                          <Label className="text-xs">Type</Label>
                          <Input
                            value={item.type}
                            onChange={(e) => updatePublication(index, "type", e.target.value)}
                            placeholder="Article"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Date</Label>
                          <Input
                            value={item.date}
                            onChange={(e) => updatePublication(index, "date", e.target.value)}
                            placeholder="Nov 2025"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Citations</Label>
                          <Input
                            value={item.citations || ""}
                            onChange={(e) => updatePublication(index, "citations", e.target.value)}
                            placeholder="2 citations"
                          />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Title</Label>
                        <Input
                          value={item.title}
                          onChange={(e) => updatePublication(index, "title", e.target.value)}
                          placeholder="Publication Title"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Authors</Label>
                        <Input
                          value={item.authors}
                          onChange={(e) => updatePublication(index, "authors", e.target.value)}
                          placeholder="Author 1, Author 2, et al."
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Journal</Label>
                        <Input
                          value={item.journal}
                          onChange={(e) => updatePublication(index, "journal", e.target.value)}
                          placeholder="Journal Name, Vol. X"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">URL</Label>
                        <Input
                          value={item.url}
                          onChange={(e) => updatePublication(index, "url", e.target.value)}
                          placeholder="https://..."
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <Button 
                  onClick={() => saveSection("publications", publications)} 
                  disabled={isSaving} 
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                  Save Publications Section
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Profile Section */}
          <TabsContent value="profile" className="space-y-6">
            <Card className="border border-gray-200/50 dark:border-gray-700/50">
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>Manage your personal and professional details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Full Name</Label>
                    <Input
                      value={profile.fullName}
                      onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                      placeholder="Dr. John Doe"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Display Name</Label>
                    <Input
                      value={profile.displayName}
                      onChange={(e) => setProfile({ ...profile, displayName: e.target.value })}
                      placeholder="Dr. John Doe"
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Credentials</Label>
                    <Input
                      value={profile.credentials}
                      onChange={(e) => setProfile({ ...profile, credentials: e.target.value })}
                      placeholder="B.Ed, MA, PhD"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Professional Title</Label>
                    <Input
                      value={profile.title}
                      onChange={(e) => setProfile({ ...profile, title: e.target.value })}
                      placeholder="Academic English Tutor & Lecturer"
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input
                      type="email"
                      value={profile.email}
                      onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                      placeholder="email@example.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Location</Label>
                    <Input
                      value={profile.location}
                      onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                      placeholder="United Kingdom"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Profile Image URL</Label>
                  <Input
                    value={profile.profileImage}
                    onChange={(e) => setProfile({ ...profile, profileImage: e.target.value })}
                    placeholder="/profile.png"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Short Biography</Label>
                  <Textarea
                    value={profile.shortBio}
                    onChange={(e) => setProfile({ ...profile, shortBio: e.target.value })}
                    placeholder="A brief professional description..."
                    rows={3}
                  />
                </div>

                {/* Social Links */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Social Media Links</Label>
                    <Button variant="outline" size="sm" onClick={addSocialLink}>
                      <Plus className="h-4 w-4 mr-1" /> Add Social Link
                    </Button>
                  </div>
                  {profile.socialLinks.map((link, index) => (
                    <div key={index} className="p-4 border rounded-lg space-y-3">
                      <div className="flex justify-between items-start">
                        <span className="text-sm font-medium">Social Link {index + 1}</span>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={link.enabled}
                            onCheckedChange={(checked) => updateSocialLink(index, { enabled: checked })}
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeSocialLink(index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="grid gap-3 md:grid-cols-3">
                        <div className="space-y-1">
                          <Label className="text-xs">Platform</Label>
                          <select
                            value={link.platform}
                            onChange={(e) => {
                              const platform = e.target.value as SocialLink["platform"]
                              const platformData = SOCIAL_PLATFORMS.find(p => p.id === platform)
                              updateSocialLink(index, {
                                platform,
                                icon: platformData?.icon || "Link2",
                                label: platformData?.label || platform,
                              })
                            }}
                            className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                          >
                            {SOCIAL_PLATFORMS.map(platform => (
                              <option key={platform.id} value={platform.id}>
                                {platform.label}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Label</Label>
                          <Input
                            value={link.label}
                            onChange={(e) => updateSocialLink(index, { label: e.target.value })}
                            placeholder="Platform Name"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">URL</Label>
                          <Input
                            value={link.url}
                            onChange={(e) => updateSocialLink(index, { url: e.target.value })}
                            placeholder="https://..."
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <Button 
                  onClick={() => saveSection("profile", profile)} 
                  disabled={isSaving} 
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                  Save Profile
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Footer Section */}
          <TabsContent value="footer" className="space-y-6">
            <Card className="border border-gray-200/50 dark:border-gray-700/50">
              <CardHeader>
                <CardTitle>Footer Content</CardTitle>
                <CardDescription>Manage footer sections and links</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* About Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">About Section</h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Name</Label>
                      <Input
                        value={footer.about.name}
                        onChange={(e) => setFooter({
                          ...footer,
                          about: { ...footer.about, name: e.target.value }
                        })}
                        placeholder="Your Name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Description</Label>
                      <Textarea
                        value={footer.about.description}
                        onChange={(e) => setFooter({
                          ...footer,
                          about: { ...footer.about, description: e.target.value }
                        })}
                        placeholder="Brief description..."
                        rows={3}
                      />
                    </div>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Contact Information</h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Email</Label>
                      <Input
                        type="email"
                        value={footer.contact.email}
                        onChange={(e) => setFooter({
                          ...footer,
                          contact: { ...footer.contact, email: e.target.value }
                        })}
                        placeholder="email@example.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Location</Label>
                      <Input
                        value={footer.contact.location || ""}
                        onChange={(e) => setFooter({
                          ...footer,
                          contact: { ...footer.contact, location: e.target.value }
                        })}
                        placeholder="United Kingdom"
                      />
                    </div>
                  </div>
                </div>

                {/* Copyright */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Copyright</h3>
                  <div className="space-y-2">
                    <Label>Copyright Text</Label>
                    <Input
                      value={footer.copyright.text}
                      onChange={(e) => setFooter({
                        ...footer,
                        copyright: { ...footer.copyright, text: e.target.value }
                      })}
                      placeholder="Your Name. All rights reserved."
                    />
                  </div>
                </div>

                <Button 
                  onClick={() => saveSection("footer", footer)} 
                  disabled={isSaving} 
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                  Save Footer
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* SEO Metadata Section */}
          <TabsContent value="metadata" className="space-y-6">
            <Card className="border border-gray-200/50 dark:border-gray-700/50">
              <CardHeader>
                <CardTitle>SEO & Metadata</CardTitle>
                <CardDescription>Optimize your site for search engines and UK academic recruitment</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Site Settings */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Site Settings</h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Site Name</Label>
                      <Input
                        value={metadata.siteName}
                        onChange={(e) => setMetadata({ ...metadata, siteName: e.target.value })}
                        placeholder="Dr. Your Name | Academic Portfolio"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Site URL</Label>
                      <Input
                        value={metadata.siteUrl}
                        onChange={(e) => setMetadata({ ...metadata, siteUrl: e.target.value })}
                        placeholder="https://yoursite.com"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Site Description</Label>
                    <Textarea
                      value={metadata.siteDescription}
                      onChange={(e) => setMetadata({ ...metadata, siteDescription: e.target.value })}
                      placeholder="Site-wide description for SEO..."
                      rows={3}
                    />
                  </div>
                </div>

                {/* Home Page SEO */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Home Page SEO</h3>
                  <div className="space-y-2">
                    <Label>Page Title</Label>
                    <Input
                      value={metadata.pages.home.title}
                      onChange={(e) => setMetadata({
                        ...metadata,
                        pages: { ...metadata.pages, home: { ...metadata.pages.home, title: e.target.value } }
                      })}
                      placeholder="Dr. Your Name | Academic English Tutor & Lecturer | UK"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Meta Description</Label>
                    <Textarea
                      value={metadata.pages.home.description}
                      onChange={(e) => setMetadata({
                        ...metadata,
                        pages: { ...metadata.pages, home: { ...metadata.pages.home, description: e.target.value } }
                      })}
                      placeholder="SEO-optimized description for home page..."
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Keywords (comma-separated)</Label>
                    <Textarea
                      value={metadata.pages.home.keywords.join(", ")}
                      onChange={(e) => updateKeywords("home", e.target.value)}
                      placeholder="academic english tutor uk, eap tutor, higher education lecturer..."
                      rows={3}
                    />
                  </div>
                </div>

                <Button 
                  onClick={() => saveSection("metadata", metadata)} 
                  disabled={isSaving} 
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                  Save SEO Settings
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
