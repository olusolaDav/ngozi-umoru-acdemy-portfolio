import Link from "next/link"
import { Mail, FileText } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-muted/50 border-t border-border mt-20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="font-semibold text-lg mb-4">Dr. Ngozi Blessing Umoru</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Dynamic and student-centred Lecturer and Academic English Tutor with extensive experience in UK FE/HE
              settings.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-4">Quick Links</h3>
            <div className="flex flex-col gap-2">
              <Link href="/#about" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                About
              </Link>
              <Link href="/#experience" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Experience
              </Link>
              <Link
                href="/#publications"
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Publications
              </Link>
              <Link href="/blog" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Blog
              </Link>
              <Link href="/contact" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Contact
              </Link>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-4">Connect</h3>
            <div className="flex flex-col gap-3">
              <a
                href="mailto:hello@ngoziumoru.info"
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                <Mail className="h-4 w-4" />
                hello@ngoziumoru.info
              </a>
              <a
                href="https://www.researchgate.net/scientific-contributions/Ngozi-Blessing-Umoru-2330422223"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                <FileText className="h-4 w-4" />
                ResearchGate
              </a>
              <a
                href="https://scholar.google.com/citations?user=UT3Xz5UAAAAJ"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                <FileText className="h-4 w-4" />
                Google Scholar
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-border text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} Dr. Ngozi Blessing Umoru. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
