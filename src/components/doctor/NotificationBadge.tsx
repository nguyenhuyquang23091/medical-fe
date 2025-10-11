"use client"

import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface NotificationBadgeProps {
  count: number
  className?: string
  showZero?: boolean
}

export const NotificationBadge = ({ count, className, showZero = false }: NotificationBadgeProps) => {
  if (count === 0 && !showZero) {
    return null
  }

  return (
    <Badge 
      variant="destructive" 
      className={cn(
        "h-5 w-5 flex items-center justify-center text-xs font-medium bg-red-500 hover:bg-red-600 text-white border-0 rounded-full min-w-[20px] px-1",
        count > 99 && "px-1.5",
        className
      )}
    >
      {count > 99 ? "99+" : count}
    </Badge>
  )
}
