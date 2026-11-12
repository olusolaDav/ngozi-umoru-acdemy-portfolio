"use client"

import { motion } from "framer-motion"
import { MessageSquare } from "lucide-react"
import { ScrollAnimation } from "@/components/ui/scroll-animation"

export function BlogListingHero() {
  return (
    <section className="pt-32 pb-16 bg-gradient-to-br from-background via-background to-muted/30">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="text-center max-w-4xl mx-auto">
          {/* Badge */}
          <ScrollAnimation>
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-primary/30 bg-primary/10 text-sm font-semibold text-primary mb-8"
            >
              <MessageSquare className="w-4 h-4" />
              INSIGHTS & UPDATES
            </motion.span>
          </ScrollAnimation>

          {/* Title */}
          <ScrollAnimation delay={0.1}>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6">
              Our <span className="text-primary">Blog</span>
            </h1>
          </ScrollAnimation>

          {/* Subtitle */}
          <ScrollAnimation delay={0.2}>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Discover insights, tutorials, and stories from our team. Stay updated with the latest in technology, design, and digital transformation.
            </p>
          </ScrollAnimation>
        </div>
      </div>
    </section>
  )
}
