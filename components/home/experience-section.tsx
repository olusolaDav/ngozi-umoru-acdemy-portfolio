import { Card, CardContent } from "@/components/ui/card"
import { parseDateForSort } from "@/components/ui/month-year-picker"

interface ExperienceItem {
  position: string
  institution: string
  period: string
  startDate?: string
  endDate?: string
  responsibilities: string[]
}

interface ExperienceProps {
  section?: string
  title?: string
  items?: ExperienceItem[]
}

export function ExperienceSection(props: ExperienceProps) {
  const { section, title, items = [] } = props

  // Sort items by end date (most recent first), then by start date
  const sortedItems = [...items].sort((a, b) => {
    // Parse end dates - "present" should be treated as most recent
    const endDateA = parseDateForSort(a.endDate || a.startDate)
    const endDateB = parseDateForSort(b.endDate || b.startDate)
    
    // Sort descending (most recent first)
    if (endDateB !== endDateA) {
      return endDateB - endDateA
    }
    
    // If end dates are equal, sort by start date (more recent start first)
    const startDateA = parseDateForSort(a.startDate)
    const startDateB = parseDateForSort(b.startDate)
    return startDateB - startDateA
  })
  return (
    <section id="experience" className="py-20 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="mb-12">
          <div className="inline-block px-3 py-1 bg-muted border border-border text-sm font-medium rounded-full mb-4">
            {section}
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-6">{title}</h2>
        </div>

        <div className="space-y-8">
          {sortedItems.map((item, index) => (
            <Card key={index}>
              <CardContent className="pt-6">
                <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-2 mb-4">
                  <div>
                    <h3 className="font-semibold text-xl mb-1">{item.position}</h3>
                    <p className="text-muted-foreground">{item.institution}</p>
                  </div>
                  <span className="text-sm text-muted-foreground">{item.period}</span>
                </div>
                <ul className="space-y-2 text-muted-foreground">
                  {item.responsibilities.map((responsibility, idx) => (
                    <li key={idx} className="flex gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span>{responsibility}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
