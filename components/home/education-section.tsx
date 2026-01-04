import { Card, CardContent } from "@/components/ui/card"
import { GraduationCap } from "lucide-react"
import { homeData } from "@/lib/home-data"

interface EducationItem {
  degree: string
  institution: string
  year: string
}

interface EducationProps {
  section?: string
  title?: string
  items?: EducationItem[]
}

export function EducationSection(props: EducationProps) {
  // Use props if provided, otherwise fall back to homeData defaults
  const section = props.section ?? homeData.education.section
  const title = props.title ?? homeData.education.title
  const items = props.items ?? homeData.education.items
  return (
    <section id="education" className="py-20 px-4 bg-muted/30">
      <div className="container mx-auto max-w-6xl">
        <div className="mb-12">
          <div className="inline-block px-3 py-1 bg-background border border-border text-sm font-medium rounded-full mb-4">
            {section}
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-6">{title}</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {items.map((item, index) => (
            <Card key={index}>
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="bg-primary/10 p-3 rounded-lg">
                    <GraduationCap className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-1">{item.degree}</h3>
                    <p className="text-muted-foreground mb-1">{item.institution}</p>
                    <p className="text-sm text-muted-foreground">{item.year}</p>
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
