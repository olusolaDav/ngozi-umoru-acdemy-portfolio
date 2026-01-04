"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Menu } from "lucide-react"
import { useState } from "react"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
        
           <Link href="/" className="flex items-center gap-2 text-xl font-semibold">
                            <Avatar>
                              <AvatarImage src="/ngozi-icon.png" />
                              <AvatarFallback>NU</AvatarFallback>
                          </Avatar>
                          <p>Ngozi B. Umoru</p>
                    
                            </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="/#about" className="text-sm hover:text-primary transition-colors">
              About
            </Link>
            <Link href="/#experience" className="text-sm hover:text-primary transition-colors">
              Experience
            </Link>
            <Link href="/#education" className="text-sm hover:text-primary transition-colors">
              Education
            </Link>
            <Link href="/#publications" className="text-sm hover:text-primary transition-colors">
              Publications
            </Link>
            <Link href="/resources" className="text-sm hover:text-primary transition-colors">
              Resources
            </Link>
            <Link href="/blog" className="text-sm hover:text-primary transition-colors">
              Blog
            </Link>
            <Link href="/contact">
              <Button size="sm">Contact</Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setIsOpen(!isOpen)}>
            <Menu className="h-5 w-5" />
          </Button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden mt-4 pb-4 flex flex-col gap-4">
            <Link
              href="/#about"
              className="text-sm hover:text-primary transition-colors"
              onClick={() => setIsOpen(false)}
            >
              About
            </Link>
            <Link
              href="/#experience"
              className="text-sm hover:text-primary transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Experience
            </Link>
            <Link
              href="/#education"
              className="text-sm hover:text-primary transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Education
            </Link>
            <Link
              href="/#publications"
              className="text-sm hover:text-primary transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Publications
            </Link>
            <Link
              href="/resources"
              className="text-sm hover:text-primary transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Resources
            </Link>
            <Link
              href="/blog"
              className="text-sm hover:text-primary transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Blog
            </Link>
            <Link href="/contact" onClick={() => setIsOpen(false)}>
              <Button size="sm" className="w-full">
                Contact
              </Button>
            </Link>
          </div>
        )}
      </div>
    </nav>
  )
}
