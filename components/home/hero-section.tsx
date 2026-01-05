import { Button } from "@/components/ui/button"
import Link from "next/link"

interface HeroProps {
  badge?: string
  name?: string
  credentials?: string
  description?: string
  profileImage?: string
}

export function HeroSection(props: HeroProps) {
  const { badge, name, credentials, description, profileImage } = props
  return (
    <section className="pt-32 pb-20 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-block px-4 py-1.5 bg-primary/10 text-primary text-sm font-medium rounded-full mb-6">
              {badge}
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-balance leading-tight">
              {name}
            </h1>
            <p className="text-xl text-muted-foreground mb-4 leading-relaxed">{credentials}</p>
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">{description}</p>
            <div className="flex flex-wrap gap-4">
              <Link href="/contact">
                <Button size="lg">Get in Touch</Button>
              </Link>
            </div>
          </div>
          <div className="relative">
            <div className="aspect-square bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl flex items-center justify-center">
              <img src={profileImage} alt={name} className="rounded-2xl w-full h-full object-cover" />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
