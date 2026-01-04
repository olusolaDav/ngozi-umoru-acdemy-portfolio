"use client"

import type React from "react"

import { useState } from "react"
import { usePathname } from "next/navigation"
import { SidebarNav } from "@/components/dashboard/sidebar-nav"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import type { UserRole } from "@/lib/auth-types"
import { useAuth } from "@/lib/hooks/use-auth"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const pathname = usePathname()
  const { user } = useAuth()

  // Use the user's actual role from auth context, fallback to path-based detection
  const getRoleFromPath = (): UserRole => {
    // First priority: use the authenticated user's role
    if (user?.role) return user.role as UserRole
    
    // Fallback: determine role from pathname (for initial render before auth loads)
    if (pathname.startsWith("/admin")) return "admin"
    if (pathname.startsWith("/auditor")) return "auditor"
    if (pathname.startsWith("/collaborator")) return "collaborator"
    if (pathname.startsWith("/dashboard")) return "client"
    return "client" // default
  }

  const role = getRoleFromPath()

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <SidebarNav role={role} isCollapsed={isCollapsed} onToggleCollapse={() => setIsCollapsed(!isCollapsed)} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <DashboardHeader />
        <main className="flex-1 overflow-y-auto bg-muted/30 p-6">{children}</main>
      </div>
    </div>
  )
}
