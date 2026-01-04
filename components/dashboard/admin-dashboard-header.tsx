"use client"

import React from "react"
import Link from "next/link"
import { ChevronRight } from "lucide-react"

interface Breadcrumb {
  label: string
  href?: string
}

interface AdminDashboardHeaderProps {
  title: string
  description?: string
  breadcrumbs?: Breadcrumb[]
  actions?: React.ReactNode
}

export function AdminDashboardHeader({
  title,
  description,
  breadcrumbs = [],
  actions,
}: AdminDashboardHeaderProps) {
  return (
    <div className="border-b border-gray-200/50 dark:border-gray-800/50 bg-white dark:bg-gray-950 mb-8">
      {/* Breadcrumbs */}
      {breadcrumbs.length > 0 && (
        <div className="px-6 pt-4 pb-3">
          <nav className="flex items-center gap-1 text-xs">
            {breadcrumbs.map((crumb, index) => (
              <React.Fragment key={index}>
                {index > 0 && <ChevronRight className="h-3 w-3 text-gray-400" />}
                {crumb.href ? (
                  <Link
                    href={crumb.href}
                    className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
                  >
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="text-gray-900 dark:text-gray-100 font-medium">{crumb.label}</span>
                )}
              </React.Fragment>
            ))}
          </nav>
        </div>
      )}

      {/* Header Content */}
      <div className="px-6 py-6 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-50 mb-2">
            {title}
          </h1>
          {description && (
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {description}
            </p>
          )}
        </div>

        {/* Actions */}
        {actions && (
          <div className="flex items-center gap-3">
            {actions}
          </div>
        )}
      </div>
    </div>
  )
}
