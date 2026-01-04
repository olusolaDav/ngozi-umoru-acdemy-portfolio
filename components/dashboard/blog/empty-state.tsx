"use client"

interface EmptyStateProps {
  icon: "comments" | "notifications"
  title: string
  description: string
}

export function EmptyState({ icon, title, description }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="relative mb-6 h-40 w-40 opacity-30">
        {icon === "comments" ? (
          <svg viewBox="0 0 100 100" className="h-full w-full text-muted-foreground">
            <rect x="10" y="10" width="60" height="50" rx="8" fill="currentColor" opacity="0.3" />
            <rect x="30" y="40" width="60" height="50" rx="8" fill="currentColor" opacity="0.5" />
          </svg>
        ) : (
          <svg viewBox="0 0 100 100" className="h-full w-full text-muted-foreground">
            <path
              d="M50 10 L75 35 L75 55 L65 65 L65 80 L50 65 L35 80 L35 65 L25 55 L25 35 Z"
              fill="currentColor"
              opacity="0.3"
            />
            <circle cx="50" cy="42" r="8" fill="currentColor" opacity="0.5" />
          </svg>
        )}
      </div>
      <h3 className="mb-2 text-xl font-semibold text-muted-foreground">{title}</h3>
      <p className="max-w-sm text-center text-muted-foreground">{description}</p>
    </div>
  )
}
