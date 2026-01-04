"use client"

import type React from "react"
import { Moon, Sun } from "lucide-react"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronDown, Menu, X, LogIn, LogOut, LayoutDashboard } from "lucide-react"
import { useTheme } from "next-themes"
import { cn } from "@/lib/utils"
import { serviceCategories } from "@/lib/services-data"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/hooks/use-auth"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Shield,
  FileSearch,
  UserCheck,
  FileText,
  Users,
  GraduationCap,
  Briefcase,
  BookOpen,
  Server,
  RefreshCw,
  CreditCard,
  Cloud,
  Lock,
  Monitor,
  Brain,
  Scale,
  AlertTriangle,
  BarChart3,
  Sparkles,
} from "lucide-react"

const serviceIcons: Record<string, React.ElementType> = {
  "compliance-audit": Shield,
  dpia: FileSearch,
  "outsourced-dpo": UserCheck,
  "remediation-policy": FileText,
  "third-party-risk": Users,
  "training-certification": GraduationCap,
  "management-training": Briefcase,
  "employee-awareness": BookOpen,
  "iso-27001": Server,
  "iso-22301": RefreshCw,
  "pci-dss": CreditCard,
  "iso-27017": Cloud,
  "iso-27032": Lock,
  "iso-20000": Monitor,
  "ai-compliance": Brain,
  "ai-risk-assessment": Scale,
  "ai-data-protection": AlertTriangle,
  "bias-audit": BarChart3,
  "data-analytics": Sparkles,
}

const categoryIcons: Record<string, React.ElementType> = {
  "data-privacy": Shield,
  "management-systems": Server,
  "ai-governance": Brain,
}

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="relative p-2 rounded-full border border-border/50 bg-card/50 hover:bg-card transition-colors"
      aria-label="Toggle theme"
    >
      <AnimatePresence mode="wait">
        {mounted && (
          <motion.div
            key={theme}
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 180 }}
            transition={{ duration: 0.3 }}
          >
            {theme === "dark" ? (
              <Moon className="w-4 h-4 text-foreground" />
            ) : (
              <Sun className="w-4 h-4 text-foreground" />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  )
}

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isServicesOpen, setIsServicesOpen] = useState(false)
  const [activeMobileCategory, setActiveMobileCategory] = useState<string | null>(null)
  const { user, isAuthenticated, logout } = useAuth()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/about", label: "About Us" },
    { href: "#", label: "Our Services", hasDropdown: true },
    { href: "/blog", label: "Blog" },
  ]

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
          isScrolled
            ? "bg-background/80 backdrop-blur-xl border-b border-border/50 shadow-sm"
            : "bg-gradient-to-b from-background/90 to-background/0",
        )}
      >
        <nav className="container mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <Link href="/" className="relative z-10 flex-shrink-0">
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="relative">
                <Image
                  src="/logo.png"
                  alt="Academic Portfolio Limited"
                  width={160}
                  height={40}
                  className="h-8 lg:h-10 w-auto dark:brightness-110"
                  priority
                />
              </motion.div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => (
                <div
                  key={link.label}
                  className="relative"
                  onMouseEnter={() => link.hasDropdown && setIsServicesOpen(true)}
                  onMouseLeave={() => link.hasDropdown && setIsServicesOpen(false)}
                >
                  {link.hasDropdown ? (
                    <button
                      className={cn(
                        "flex items-center gap-1 px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-lg",
                        isServicesOpen && "text-foreground",
                      )}
                    >
                      {link.label}
                      <motion.div animate={{ rotate: isServicesOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                        <ChevronDown className="w-4 h-4" />
                      </motion.div>
                    </button>
                  ) : (
                    <Link
                      href={link.href}
                      className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-lg"
                    >
                      {link.label}
                    </Link>
                  )}

                  {/* Mega Menu Dropdown */}
                  {link.hasDropdown && (
                    <AnimatePresence>
                      {isServicesOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.98 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.98 }}
                          transition={{ duration: 0.2, ease: "easeOut" }}
                          className="absolute top-full left-1/2 -translate-x-1/2 pt-2"
                        >
                          <div className="bg-card rounded-2xl shadow-2xl border border-border/50 p-6 w-[900px] max-w-[90vw]">
                            <div className="grid grid-cols-3 gap-8">
                              {serviceCategories.map((category, categoryIndex) => {
                                const CategoryIcon = categoryIcons[category.id] || Shield
                                return (
                                  <motion.div
                                    key={category.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: categoryIndex * 0.1 }}
                                    className="space-y-4"
                                  >
                                    {/* Category Header */}
                                    <div className="flex items-start gap-2">
                                      <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider leading-tight">
                                        {category.title.toUpperCase()} ({category.services.length})
                                      </div>
                                    </div>

                                    {/* Service Links */}
                                    <div className="space-y-1">
                                      {category.services.map((service, serviceIndex) => {
                                        const ServiceIcon = serviceIcons[service.id] || Shield
                                        return (
                                          <motion.div
                                            key={service.id}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: categoryIndex * 0.1 + serviceIndex * 0.03 }}
                                          >
                                            <Link
                                              href={`/services/${service.id}`}
                                              className="group flex items-start gap-3 p-2 rounded-lg hover:bg-muted/50 transition-all duration-200"
                                            >
                                              <motion.div whileHover={{ scale: 1.1, rotate: 5 }} className="mt-0.5">
                                                <ServiceIcon className="w-4 h-4 text-primary/70 group-hover:text-primary transition-colors" />
                                              </motion.div>
                                              <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors leading-tight">
                                                  {service.shortTitle}
                                                </p>
                                                <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                                                  {service.description.slice(0, 60)}...
                                                </p>
                                              </div>
                                            </Link>
                                          </motion.div>
                                        )
                                      })}
                                    </div>
                                  </motion.div>
                                )
                              })}
                            </div>

                            {/* View All Services Button */}
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ delay: 0.3 }}
                              className="mt-6 pt-4 border-t border-border/50 flex justify-end"
                            >
                              <Link href="/services">
                                <Button
                                  variant="default"
                                  className="bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity"
                                >
                                  View All Services
                                </Button>
                              </Link>
                            </motion.div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  )}
                </div>
              ))}
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-2 lg:gap-3">
              {/* Theme Toggle */}
              <ThemeToggle />

              {/* Login button / User Avatar */}
              {isAuthenticated && user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="relative flex items-center justify-center"
                    >
                      <Avatar className="h-9 w-9 border-2 border-primary/20 hover:border-primary/50 transition-colors cursor-pointer">
                        <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground text-sm font-semibold">
                          {user.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()
                            .slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                    </motion.button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <div className="px-3 py-2">
                      <p className="text-sm font-medium">{user.name}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                      <span className="inline-block mt-1 text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary capitalize">
                        {user.role}
                      </span>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                          {
                            user.role === "client" ? (
                               <Link href={`/dashboard`} className="cursor-pointer">
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        Dashboard
                      </Link>
                            ) : (
                                    <Link href={`/${user.role}`} className="cursor-pointer">
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        Dashboard
                      </Link>
                            )
                          }  

                     
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={logout}
                      className="cursor-pointer text-destructive focus:text-destructive"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Log out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Link href="/auth/login">
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="hidden lg:flex items-center gap-2 text-muted-foreground hover:text-foreground cursor-pointer"
                    >
                      <LogIn className="w-4 h-4" />
                      Login
                    </Button>
                  </motion.div>
                </Link>
              )}

              {/* CTA Buttons - Desktop */}
              <div className="hidden lg:flex items-center gap-2">
                {/* <Link href="/contact">
                  <Button
                    variant="outline"
                    className="rounded-full px-5 border-primary/30 text-foreground hover:bg-primary/5 hover:border-primary/50 transition-all bg-transparent"
                  >
                    Contact Us
                  </Button>
                </Link> */}
                <Link href="/contact/#booking">
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button className="rounded-full px-5 bg-gradient-to-r from-primary to-accent cursor-pointer text-primary-foreground hover:opacity-90 transition-opacity shadow-lg shadow-primary/20">
                      Book a Free Session
                    </Button>
                  </motion.div>
                </Link>
              </div>

              {/* Mobile Menu Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 rounded-lg hover:bg-muted transition-colors"
                aria-label="Toggle menu"
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={isMobileMenuOpen ? "close" : "menu"}
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                  </motion.div>
                </AnimatePresence>
              </motion.button>
            </div>
          </div>
        </nav>
      </motion.header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 lg:hidden"
          >
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-background/80 backdrop-blur-md"
              onClick={() => setIsMobileMenuOpen(false)}
            />

            {/* Menu Panel */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="absolute right-0 top-0 bottom-0 w-full max-w-sm bg-card border-l border-border shadow-2xl overflow-y-auto"
            >
              <div className="p-6 pt-20">
                {/* Nav Links */}
                <div className="space-y-2">
                  {navLinks.map((link, index) => (
                    <motion.div
                      key={link.label}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      {link.hasDropdown ? (
                        <div>
                          <button
                            onClick={() =>
                              setActiveMobileCategory(activeMobileCategory === "services" ? null : "services")
                            }
                            className="flex items-center justify-between w-full p-3 rounded-lg hover:bg-muted transition-colors"
                          >
                            <span className="font-medium">{link.label}</span>
                            <motion.div
                              animate={{ rotate: activeMobileCategory === "services" ? 180 : 0 }}
                              transition={{ duration: 0.2 }}
                            >
                              <ChevronDown className="w-4 h-4" />
                            </motion.div>
                          </button>

                          <AnimatePresence>
                            {activeMobileCategory === "services" && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.3 }}
                                className="overflow-hidden"
                              >
                                <div className="pl-4 py-2 space-y-4">
                                  {serviceCategories.map((category) => (
                                    <div key={category.id} className="space-y-2">
                                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3">
                                        {category.shortTitle}
                                      </p>
                                      <div className="space-y-1">
                                        {category.services.slice(0, 4).map((service) => {
                                          const ServiceIcon = serviceIcons[service.id] || Shield
                                          return (
                                            <Link
                                              key={service.id}
                                              href={`/services/${service.id}`}
                                              onClick={() => setIsMobileMenuOpen(false)}
                                              className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted transition-colors text-sm"
                                            >
                                              <ServiceIcon className="w-4 h-4 text-primary/70" />
                                              {service.shortTitle}
                                            </Link>
                                          )
                                        })}
                                        {category.services.length > 4 && (
                                          <Link
                                            href="/services"
                                            onClick={() => setIsMobileMenuOpen(false)}
                                            className="block p-2 text-sm text-primary hover:underline"
                                          >
                                            + {category.services.length - 4} more services
                                          </Link>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      ) : (
                        <Link
                          href={link.href}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="block p-3 rounded-lg hover:bg-muted transition-colors font-medium"
                        >
                          {link.label}
                        </Link>
                      )}
                    </motion.div>
                  ))}
                </div>

                {/* Mobile CTA Buttons */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="mt-8 space-y-3"
                >
                  {/* Login/User section for mobile */}
                  {isAuthenticated && user ? (
                    <>
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                        <Avatar className="h-10 w-10 border-2 border-primary/20">
                          <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground text-sm font-semibold">
                            {user.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .toUpperCase()
                              .slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{user.name}</p>
                          <p className="text-xs text-muted-foreground capitalize">{user.role}</p>
                        </div>
                      </div>


                      <Link
                        href={user.role === "client" ? "/dashboard" : `/${user.role}`}
                        className="block"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <Button variant="outline" className="w-full rounded-full bg-transparent">
                          <LayoutDashboard className="mr-2 h-4 w-4" />
                          Dashboard
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        className="w-full rounded-full text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => {
                          logout()
                          setIsMobileMenuOpen(false)
                        }}
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        Log out
                      </Button>
                    </>
                  ) : (
                    <Link href="/auth/login" className="block" onClick={() => setIsMobileMenuOpen(false)}>
                      <Button variant="outline" className="w-full rounded-full bg-transparent cursor-pointer">
                        <LogIn className="mr-2 h-4 w-4" />
                        Login
                      </Button>
                    </Link>
                  )}
                  {/* <Link href="/contact" className="block" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button variant="outline" className="w-full rounded-full bg-transparent">
                      Contact Us
                    </Button>
                  </Link> */}
                  <Link href="/contact/#booking" className="block" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button className="w-full rounded-full bg-gradient-to-r from-primary to-accent cursor-pointer">
                      Book a Free Session
                    </Button>
                  </Link>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
