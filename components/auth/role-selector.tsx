"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, Building2, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type Role = "client" | "auditor"

interface RoleSelectorProps {
  onSelect?: (role: Role) => void
}

export function RoleSelector({ onSelect }: RoleSelectorProps) {
  const [selectedRole, setSelectedRole] = useState<Role>("client")

  const roles = [
    {
      id: "client" as Role,
      label: "Client",
      icon: Building2,
      href: "/admin/users/register/client",
    },
    {
      id: "auditor" as Role,
      label: "Auditor",
      icon: User,
      href: "/admin/users/register/auditor",
    },
  ]

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <div className="flex items-left justify-start px-6 py-8 lg:px-12">

        <Link href="/admin/users">
          <Button
            variant="default"
            size="sm"
            className="gap-2 rounded-full bg-[#0a1628] text-white hover:bg-[#0a1628]/90 cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </Link>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col items-center justify-center px-6">
        <div className="w-full max-w-2xl text-center">
          <h1 className="text-4xl font-bold tracking-tight text-foreground md:text-5xl">Choose User Role!</h1>
          <p className="mt-3 text-muted-foreground">What is your relationship with your User?</p>

          {/* Role Cards */}
          <div className="mt-12 flex flex-col items-center justify-center gap-6 sm:flex-row">
            {roles.map((role) => {
              const Icon = role.icon
              const isSelected = selectedRole === role.id

              return (
                <Link
                  key={role.id}
                  href={role.href}
                  onClick={() => {
                    setSelectedRole(role.id)
                    onSelect?.(role.id)
                  }}
                  className={cn(
                    "group flex h-48 w-48 flex-col items-center justify-center rounded-2xl border-2 transition-all duration-200 hover:border-primary hover:shadow-lg",
                    isSelected ? "border-primary bg-primary/5 shadow-md" : "border-border bg-card",
                  )}
                >
                  <div
                    className={cn(
                      "flex h-20 w-20 items-center justify-center rounded-xl transition-colors",
                      isSelected ? "bg-primary/10" : "bg-muted group-hover:bg-primary/10",
                    )}
                  >
                    <Icon
                      className={cn(
                        "h-10 w-10 transition-colors",
                        isSelected ? "text-primary" : "text-muted-foreground group-hover:text-primary",
                      )}
                    />
                  </div>
                  <span
                    className={cn(
                      "mt-4 text-lg font-semibold transition-colors",
                      isSelected ? "text-primary" : "text-foreground group-hover:text-primary",
                    )}
                  >
                    {role.label}
                  </span>
                </Link>
              )
            })}
          </div>
        </div>
      </div>

      {/* Bottom Gradient */}
      <div className="h-32 bg-gradient-to-t from-cyan-50/50 via-cyan-50/20 to-transparent dark:from-cyan-950/20 dark:via-transparent" />
    </div>
  )
}
