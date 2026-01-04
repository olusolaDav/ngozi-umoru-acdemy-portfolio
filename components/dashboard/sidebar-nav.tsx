"use client"

import type React from "react"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import type { UserRole } from "@/lib/auth-types"
import {
  LayoutDashboard,
  FileText,
  Users,
  Diamond,
  Receipt,
  BookOpen,
  Settings,
  LogOut,
  ChevronDown,
  Building2,
  ClipboardCheck,
  UserCircle,
  MessageSquare,
} from "lucide-react"
import { useState, useEffect } from "react"
import { LogoutConfirmModal } from "@/components/dashboard/logout-confirm-modal"
import { useAuth } from "@/lib/hooks/use-auth"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"

interface NavItem {
  title: string
  href: string
  icon: React.ElementType
  children?: { title: string; href: string }[]
}

// Navigation items per role
const adminNav: NavItem[] = [
  { title: "Overview", href: "/admin", icon: LayoutDashboard },
  { title: "Site", href: "/admin/site", icon: Building2 },
  { title: "Contacts", href: "/admin/contacts", icon: MessageSquare },
  { title: "Resources", href: "/admin/resources", icon: Diamond },
  { title: "Blog", href: "/admin/blog", icon: BookOpen },
  { title: "Settings", href: "/admin/settings", icon: Settings },
]




const navByRole: Record<UserRole, NavItem[]> = {
  admin: adminNav,

}

interface SidebarNavProps {
  role: UserRole
  isCollapsed?: boolean
  onToggleCollapse?: () => void
}

export function SidebarNav({ role, isCollapsed = false, onToggleCollapse }: SidebarNavProps) {
  const pathname = usePathname()
  const navItems = navByRole[role]
  const [collabChildren, setCollabChildren] = useState<{ title: string; href: string }[] | null>(null)
  const [expandedItems, setExpandedItems] = useState<string[]>([])
  const [showLogout, setShowLogout] = useState(false)
  const { logout } = useAuth()

  const toggleExpand = (title: string) => {
    setExpandedItems((prev) => (prev.includes(title) ? prev.filter((t) => t !== title) : [...prev, title]))
  }

  const isActive = (href: string) => {
    if (href === `/dashboard` || href === `/admin` || href === `/auditor` || href === `/collaborator` || href === `/${role}`) {
      return pathname === href
    }
    return pathname.startsWith(href)
  }

  // If collaborator role, fetch assigned forms and limit the Forms children
  useEffect(() => {
    if (role !== "collaborator") return

    let mounted = true

 

    ;(async () => {
      try {
        const res = await fetch("/api/collaborator/forms", { credentials: "include" })
        if (!res.ok) return
        const data = await res.json()
        const formsWithStatus = data.forms || []
        const children = formsWithStatus.map((f: any) => {
          const id = f.formDefinition?.id || f.assignment?.formId || f.formDefinition?._id
          const title = f.formDefinition?.name || f.assignment?.formName || id
          const href = routeMap[id] || `/collaborator/forms/${id}`
          return { title, href }
        })
        if (mounted) setCollabChildren(children)
      } catch (err) {
        // ignore - keep default nav
        console.error("Failed to fetch collaborator forms for sidebar:", err)
      }
    })()

    return () => { mounted = false }
  }, [role])

  return (
    <aside
      className={cn(
        "flex h-screen flex-col border-r border-border bg-card transition-all duration-300",
        isCollapsed ? "w-16" : "w-56",
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center justify-between border-b border-border px-4">
        {!isCollapsed && (

           <Link href="/" className="flex items-center gap-2 font-semibold">
                    <Avatar>
                      <AvatarImage src="/ngozi-icon.png" />
                    
                  </Avatar>
                  <p>Ngozi B. Umoru</p>
            
                    </Link>
         
      
        )}
        <button
          onClick={onToggleCollapse}
          className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-muted"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="15" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {navItems.map((item) => {
          const Icon = item.icon
          const active = isActive(item.href)
          const hasChildren = item.children && item.children.length > 0
          const isExpanded = expandedItems.includes(item.title)

          return (
            <div key={item.title}>
              {hasChildren ? (
                <button
                  onClick={() => toggleExpand(item.title)}
                  className={cn(
                    "flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    active
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="h-5 w-5" />
                    {!isCollapsed && <span>{item.title}</span>}
                  </div>
                  {!isCollapsed && (
                    <ChevronDown className={cn("h-4 w-4 transition-transform", isExpanded && "rotate-180")} />
                  )}
                </button>
              ) : (
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    active
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  <Icon className="h-5 w-5" />
                  {!isCollapsed && <span>{item.title}</span>}
                </Link>
              )}

              {/* Children */}
              {hasChildren && isExpanded && !isCollapsed && (
                <div className="ml-8 mt-1 space-y-1">
                  {(item.title === "Forms" && role === "collaborator" && collabChildren) ? (
                    collabChildren.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        className={cn(
                          "block rounded-lg px-3 py-2 text-sm transition-colors",
                          pathname === child.href ? "text-primary" : "text-muted-foreground hover:text-foreground",
                        )}
                      >
                        {child.title}
                      </Link>
                    ))
                  ) : (
                    item.children?.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        className={cn(
                          "block rounded-lg px-3 py-2 text-sm transition-colors",
                          pathname === child.href ? "text-primary" : "text-muted-foreground hover:text-foreground",
                        )}
                      >
                        {child.title}
                      </Link>
                    ))
                  )}
                </div>
              )}
            </div>
          )
        })}
      </nav>

      {/* Sign Out */}
      <div className="border-t border-border p-3">
        <button
          className={cn(
            "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
          )}
          onClick={() => setShowLogout(true)}
        >
          <LogOut className="h-5 w-5" />
          {!isCollapsed && <span>Sign Out</span>}
        </button>
        <LogoutConfirmModal
          open={showLogout}
          onConfirm={() => {
            setShowLogout(false)
            logout()
          }}
          onCancel={() => setShowLogout(false)}
        />
      </div>
    </aside>
  )
}
