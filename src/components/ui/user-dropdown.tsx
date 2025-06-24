"use client"

import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Settings, User, Bell, LogOut } from "lucide-react"

interface UserDropdownProps {
  userName?: string
  userEmail?: string
  userImage?: string
  onLogout: () => void
  onAccountClick?: () => void
  onBillingClick?: () => void
  onNotificationsClick?: () => void
}

export function UserDropdown({
  userName = "shadcn",
  userEmail = "m@example.com",
  userImage,
  onLogout,
  onAccountClick,
  onBillingClick,
  onNotificationsClick,
}: UserDropdownProps) {
  const [open, setOpen] = useState(false)

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild className="cursor-pointer">
        <div className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-800 transition-colors">
          <Avatar className="h-8 w-8 border border-gray-700">
            <AvatarImage src={userImage} alt={userName} />
            <AvatarFallback className="bg-purple-600 text-white">
              {userName.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col text-left">
            <span className="text-sm font-medium">{userName}</span>
            <span className="text-xs text-gray-400">{userEmail}</span>
          </div>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        className="w-56 bg-gray-900 border border-gray-800 text-gray-100" 
        align="end"
      >
        <div className="flex items-center gap-3 p-3">
          <Avatar className="h-10 w-10 border border-gray-700">
            <AvatarImage src={userImage} alt={userName} />
            <AvatarFallback className="bg-purple-600 text-white">
              {userName.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="text-sm font-medium">{userName}</span>
            <span className="text-xs text-gray-400">{userEmail}</span>
          </div>
        </div>
        <DropdownMenuSeparator className="bg-gray-800" />
        <DropdownMenuItem 
          className="flex items-center gap-3 p-3 cursor-pointer hover:bg-gray-800"
          onClick={onAccountClick}
        >
          <User className="h-4 w-4 text-gray-400" />
          <span>Account</span>
        </DropdownMenuItem>
        <DropdownMenuItem 
          className="flex items-center gap-3 p-3 cursor-pointer hover:bg-gray-800"
          onClick={onBillingClick}
        >
          <Settings className="h-4 w-4 text-gray-400" />
          <span>Billing</span>
        </DropdownMenuItem>
        <DropdownMenuItem 
          className="flex items-center gap-3 p-3 cursor-pointer hover:bg-gray-800"
          onClick={onNotificationsClick}
        >
          <Bell className="h-4 w-4 text-gray-400" />
          <span>Notifications</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-gray-800" />
        <DropdownMenuItem 
          className="flex items-center gap-3 p-3 cursor-pointer hover:bg-gray-800 text-gray-100"
          onClick={onLogout}
        >
          <LogOut className="h-4 w-4 text-gray-400" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
} 