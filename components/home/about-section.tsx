import { Card, CardContent } from "@/components/ui/card"
import { BookOpen, GraduationCap, Award } from "lucide-react"

interface Highlight {
  icon: string
  title: string
  description: string
}

interface AboutProps {
  section: string
  title: string
  paragraphs: string[]
  highlights: Highlight[]
}

const iconMap: Record<string, React.ReactNode> = {
  BookOpen: <BookOpen className="h-10 w-10 text-primary mb-4" />,
  GraduationCap: <GraduationCap className="h-10 w-10 text-primary mb-4" />,
  Award: <Award className="h-10 w-10 text-primary mb-4" />,
}

export function AboutSection({ section, title, paragraphs, highlights }: AboutProps) {
  return (
    <section id="about" className="py-20 px-4 bg-muted/30">
      <div className="container mx-auto max-w-6xl">
        <div className="mb-12">
          <div className="inline-block px-3 py-1 bg-background border border-border text-sm font-medium rounded-full mb-4">
            {section}
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-6">{title}</h2>
        </div>
        <div className="prose prose-lg max-w-none">
          {paragraphs.map((paragraph, index) => (
            <p key={index} className="text-muted-foreground leading-relaxed mb-4">
              {paragraph}
            </p>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          {highlights.map((highlight, index) => (
            <Card key={index}>
              <CardContent className="pt-6">
                {iconMap[highlight.icon]}
                <h3 className="font-semibold text-lg mb-2">{highlight.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{highlight.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
