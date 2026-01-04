"use client"

import type React from "react"
import { RoleGuard } from "@/components/auth/role-guard"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard allowedRoles={["admin"]}>
      <div className="flex h-screen flex-col bg-gray-50 dark:bg-gray-950">
        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </RoleGuard>
  )
}
