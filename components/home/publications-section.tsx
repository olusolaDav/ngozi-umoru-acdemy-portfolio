import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, ExternalLink } from "lucide-react"
import { homeData } from "@/lib/home-data"

interface PublicationProfile {
  label: string
  url: string
}

interface Publication {
  type: string
  date: string
  citations?: string
  title: string
  authors: string
  journal: string
  url: string
}

interface PublicationsProps {
  section?: string
  title?: string
  profiles?: PublicationProfile[]
  items?: Publication[]
}

export function PublicationsSection({ 
  section = homeData.publications.section, 
  title = homeData.publications.title, 
  profiles = homeData.publications.profiles, 
  items = homeData.publications.items 
}: PublicationsProps) {
  return (
    <section id="publications" className="py-20 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="flex items-center justify-between mb-12">
          <div>
            <div className="inline-block px-3 py-1 bg-muted border border-border text-sm font-medium rounded-full mb-4">
              {section}
            </div>
            <h2 className="text-3xl md:text-4xl font-bold">
              {title.split("&")[0]}
              <span className="text-primary"> {title.split("&")[1]}</span>
            </h2>
          </div>
          <a href={profiles[1]?.url} target="_blank" rel="noopener noreferrer">
            <Button size="lg" className="hidden md:inline-flex">
              View All
            </Button>
          </a>
        </div>

        <div className="mb-8 flex flex-wrap gap-4">
          {profiles.map((profile, index) => (
            <a
              key={index}
              href={profile.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-muted hover:bg-muted/80 rounded-lg transition-colors"
            >
              <FileText className="h-4 w-4" />
              <span className="text-sm font-medium">{profile.label}</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          ))}
          <a href={profiles[1]?.url} target="_blank" rel="noopener noreferrer" className="md:hidden">
            <Button variant="outline" size="sm">
              View All Publications
            </Button>
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {items.map((publication, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs font-medium rounded">
                        {publication.type}
                      </span>
                      <span className="text-xs text-muted-foreground">{publication.date}</span>
                      {publication.citations && (
                        <span className="text-xs text-primary font-medium">{publication.citations}</span>
                      )}
                    </div>
                    <h3 className="font-semibold text-lg mb-2 leading-relaxed">{publication.title}</h3>
                    <p className="text-sm text-muted-foreground mb-3">{publication.authors}</p>
                    <p className="text-xs text-muted-foreground mb-4">{publication.journal}</p>
                    <a href={publication.url} target="_blank" rel="noopener noreferrer">
                      <Button size="sm" variant="outline">
                        <ExternalLink className="mr-2 h-3 w-3" />
                        Read
                      </Button>
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
