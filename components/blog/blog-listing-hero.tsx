"use client"

import { motion } from "framer-motion"
import { MessageSquare } from "lucide-react"
import { ScrollAnimation } from "@/components/ui/scroll-animation"

export function BlogListingHero() {
  return (
    <section className="pt-32 pb-12 bg-background">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="text-center max-w-3xl mx-auto">
          {/* Badge */}
          <ScrollAnimation>
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/20 bg-primary/5 text-sm font-medium text-primary mb-6"
            >
              <MessageSquare className="w-4 h-4" />
              WHAT WE HAVE TO SAY
            </motion.span>
          </ScrollAnimation>

          {/* Title */}
          <ScrollAnimation delay={0.1}>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-8">Our Blog</h1>
          </ScrollAnimation>
        </div>
      </div>
    </section>
  )
}
