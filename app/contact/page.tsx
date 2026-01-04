"use client"

import type React from "react"

import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer-dynamic"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Mail, Phone, ExternalLink, Send } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

export default function ContactPage() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    subject: "",
    message: "",
    agreePolicy: false,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullName: formData.fullName,
          email: formData.email,
          department: "general", // Changed from subject to department
          message: formData.message,
          agreePolicy: formData.agreePolicy,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        toast.error(data.error || "Failed to submit form. Please try again.")
      } else {
        toast.success("Thank you for your message! I will get back to you soon.")
        setFormData({ fullName: "", email: "", subject: "", message: "", agreePolicy: false })
      }
    } catch (err) {
      toast.error("An error occurred. Please try again.")
      console.error("Form submission error:", err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }))
  }

  return (
    <div className="min-h-screen">
      <Navigation />

      <div className="pt-32 pb-20 px-4">
        <div className="container mx-auto max-w-6xl">
          {/* Header */}
          <div className="mb-12 text-center">
            <div className="inline-block px-3 py-1 bg-muted border border-border text-sm font-medium rounded-full mb-4">
              CONTACT
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Get In Touch</h1>
            <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
              I'm always open to discussing new opportunities, collaborations, or answering questions about my research
              and teaching.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Contact Information */}
            <div className="lg:col-span-1 space-y-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="bg-primary/10 p-3 rounded-lg">
                      <Mail className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-2">Email</h3>
                      <a
                        href="mailto:ngoziblessingumoru@gmail.com"
                        className="text-muted-foreground hover:text-primary transition-colors break-all"
                      >
                        ngoziblessingumoru@gmail.com
                      </a>
                      <br />
                      <a
                        href="mailto:umorunn@gmail.com"
                        className="text-muted-foreground hover:text-primary transition-colors break-all"
                      >
                        umorunn@gmail.com
                      </a>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="bg-primary/10 p-3 rounded-lg">
                      <Phone className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-2">Phone</h3>
                      <a href="tel:07769753237" className="text-muted-foreground hover:text-primary transition-colors">
                        07769753237
                      </a>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="bg-primary/10 p-3 rounded-lg">
                      <ExternalLink className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-3">Academic Profiles</h3>
                      <div className="space-y-2">
                        <a
                          href="https://www.researchgate.net/scientific-contributions/Ngozi-Blessing-Umoru-2330422223"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block text-sm text-muted-foreground hover:text-primary transition-colors"
                        >
                          ResearchGate →
                        </a>
                        <a
                          href="https://scholar.google.com/citations?user=UT3Xz5UAAAAJ"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block text-sm text-muted-foreground hover:text-primary transition-colors"
                        >
                          Google Scholar →
                        </a>
                        <a
                          href="https://www.linkedin.com"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block text-sm text-muted-foreground hover:text-primary transition-colors"
                        >
                          LinkedIn →
                        </a>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <Card>
                <CardContent className="pt-6">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="fullName">Full Name *</Label>
                        <Input
                          id="fullName"
                          name="fullName"
                          placeholder="John Doe"
                          required
                          value={formData.fullName}
                          onChange={handleChange}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address *</Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          placeholder="john@example.com"
                          required
                          value={formData.email}
                          onChange={handleChange}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="subject">Subject *</Label>
                      <Input
                        id="subject"
                        name="subject"
                        placeholder="What is this regarding?"
                        required
                        value={formData.subject}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message">Message *</Label>
                      <Textarea
                        id="message"
                        name="message"
                        placeholder="Tell me more about your inquiry..."
                        rows={8}
                        required
                        value={formData.message}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="space-y-2 flex items-start gap-3">
                      <input
                        id="agreePolicy"
                        name="agreePolicy"
                        type="checkbox"
                        required
                        checked={formData.agreePolicy}
                        onChange={handleChange}
                        className="mt-1"
                      />
                      <Label htmlFor="agreePolicy" className="text-sm">
                        I agree to the Privacy Policy and understand that my information will be used to respond to my inquiry
                        *
                      </Label>
                    </div>

                    <Button 
                      type="submit" 
                      size="lg" 
                      className="w-full md:w-auto" 
                      disabled={isSubmitting || !formData.agreePolicy}
                    >
                      <Send className="mr-2 h-4 w-4" />
                      {isSubmitting ? "Sending..." : "Send Message"}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              <div className="mt-8 bg-muted/50 rounded-lg p-6">
                <h3 className="font-semibold text-lg mb-3">Office Hours</h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                  I typically respond to emails within 24-48 hours during business days. For urgent academic matters,
                  please indicate this in your subject line.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="font-medium mb-1">Availability</p>
                    <p className="text-muted-foreground">Monday - Friday</p>
                    <p className="text-muted-foreground">9:00 AM - 5:00 PM GMT</p>
                  </div>
                  <div>
                    <p className="font-medium mb-1">Best Time to Reach</p>
                    <p className="text-muted-foreground">Tuesday - Thursday</p>
                    <p className="text-muted-foreground">10:00 AM - 4:00 PM GMT</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
