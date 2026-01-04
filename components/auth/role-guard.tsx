"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/hooks/use-auth"
import type { UserRole } from "@/lib/auth-types"

interface RoleGuardProps {
  children: React.ReactNode
  allowedRoles: UserRole[]
  fallbackUrl?: string
}

/**
 * RoleGuard component provides client-side role-based access control.
 * It should be used in dashboard layouts to protect routes based on user roles.
 * 
 * Note: This is a client-side guard that works alongside the server-side middleware.
 * The middleware handles the initial request, while this component handles
 * client-side navigation and provides a better UX with loading states.
 */
export function RoleGuard({ children, allowedRoles, fallbackUrl }: RoleGuardProps) {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (isLoading) return

    if (!user) {
      // Not logged in, redirect to login
      const currentPath = window.location.pathname
      router.replace(`/auth/login?callbackUrl=${encodeURIComponent(currentPath)}`)
      return
    }

    if (!allowedRoles.includes(user.role)) {
      // User doesn't have access to this route
      if (fallbackUrl) {
        router.replace(fallbackUrl)
      } else {
        // Redirect to user's own dashboard
        const dashboardRoutes: Record<UserRole, string> = {
          admin: "/admin",
          client: "/dashboard",
          auditor: "/auditor",
          collaborator: "/collaborator",
        }
        router.replace(dashboardRoutes[user.role] || "/")
      }
    }
  }, [user, isLoading, allowedRoles, fallbackUrl, router])

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  // Don't render anything if user is not authenticated or doesn't have access
  if (!user || !allowedRoles.includes(user.role)) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="text-sm text-muted-foreground">Redirecting...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
