"use client"

import { HelpCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/ui/navbar"
import { NotificationBell } from "@/components/ui/notification-bell"

export function DashboardHeader() {
  return (
    <header className="flex h-16 items-center justify-end gap-2 border-b border-border bg-card px-6">
      <NotificationBell />
      <ThemeToggle />
      <Button variant="ghost" size="icon" className="h-9 w-9">
        <HelpCircle className="h-5 w-5" />
      </Button>
    </header>
  )
}
