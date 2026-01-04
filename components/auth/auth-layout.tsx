"use client"

import type React from "react"

import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

interface AuthLayoutProps {
  children: React.ReactNode
  showBackButton?: boolean
  backHref?: string
}

export function AuthLayout({
  children,
  showBackButton = true,
  backHref = "/auth/login",
}: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen items-center justify-center px-6 py-8">
      {/* Back Button */}
      {showBackButton && (
        <Link href={backHref} className="fixed left-6 top-6 z-10">
          <Button
            variant="default"
            size="sm"
            className="gap-2 rounded-full bg-[#0a1628] text-white hover:bg-[#0a1628]/90 cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </Link>
      )}

      {/* Form Container */}
      <div className="w-full max-w-md">{children}</div>
    </div>
  )
}
