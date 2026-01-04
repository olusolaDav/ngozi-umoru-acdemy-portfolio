"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getInitials } from "@/lib/dashboard-data"
import { cn } from "@/lib/utils"

interface UserAvatarProps {
  name: string
  image?: string
  isCompanyLogo?: boolean
  size?: "sm" | "md" | "lg" | "xl"
  className?: string
}

const sizeClasses = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-12 w-12 text-base",
  xl: "h-20 w-20 text-xl",
}

export function UserAvatar({ name, image, isCompanyLogo, size = "md", className }: UserAvatarProps) {
  const initials = getInitials(name)

  return (
    <Avatar className={cn(sizeClasses[size], className)}>
      <AvatarImage
        src={image || "/placeholder.svg"}
        alt={name}
        className={isCompanyLogo ? "object-contain p-1" : "object-cover"}
      />
      <AvatarFallback
        className={cn(
          "font-medium",
          isCompanyLogo
            ? "bg-gradient-to-br from-cyan-400 to-blue-600 text-white"
            : "bg-gradient-to-br from-primary/20 to-accent/20 text-foreground",
        )}
      >
        {initials}
      </AvatarFallback>
    </Avatar>
  )
}
