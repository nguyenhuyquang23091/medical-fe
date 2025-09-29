"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { User, Settings, LogOut, Sparkles, CreditCard, Bell } from "lucide-react"
import { useUserProfile } from "@/app/context/UserProfileContext"
import { useState, useEffect } from "react"
import { SidebarMenuButton } from "@/components/ui/sidebar"

interface DoctorProfileDropdownProps {
  onViewProfileAction: () => void
  onSettingsAction: () => void
  onLogoutAction: () => void
}

export function DoctorProfileDropdown({
  onViewProfileAction,
  onSettingsAction,
  onLogoutAction
}: DoctorProfileDropdownProps) {
  const { userProfile, authData } = useUserProfile()
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const user = {
    name: userProfile ? `${userProfile.firstName} ${userProfile.lastName}` : "",
    email: authData?.email || "",
    avatar: userProfile?.avatar || "/placeholder.svg"
  }

  const initials = userProfile?.firstName && userProfile?.lastName ?
    `${userProfile.firstName[0]}${userProfile.lastName[0]}`.toUpperCase() : "D"

  if (!isMounted) {
    return null
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <SidebarMenuButton
          size="lg"
          className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
        >
          <Avatar className="h-8 w-8 rounded-lg">
            <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name || "Doctor avatar"} />
            <AvatarFallback className="rounded-lg bg-primary text-primary-foreground font-medium">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-semibold">
              {user.name || "Dr. Johnson"}
            </span>
            <span className="truncate text-xs text-muted-foreground">
              {user.email || "doctor@medconnect.com"}
            </span>
          </div>
        </SidebarMenuButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
        side="right"
        align="end"
        sideOffset={4}
      >
        <DropdownMenuLabel className="p-0 font-normal">
          <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
            <Avatar className="h-8 w-8 rounded-lg">
              <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name || "Doctor avatar"} />
              <AvatarFallback className="rounded-lg bg-primary text-primary-foreground font-medium">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-semibold">
                {user.name || "Dr. Johnson"}
              </span>
              <span className="truncate text-xs text-muted-foreground">
                {user.email || "doctor@medconnect.com"}
              </span>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onViewProfileAction} className="cursor-pointer">
          <User className="mr-2 h-4 w-4" />
          Account
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => {}} className="cursor-pointer">
          <CreditCard className="mr-2 h-4 w-4" />
          Billing
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => {}} className="cursor-pointer">
          <Bell className="mr-2 h-4 w-4" />
          Notifications
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={onLogoutAction}
          className="cursor-pointer text-destructive focus:bg-accent focus:text-destructive-foreground"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}