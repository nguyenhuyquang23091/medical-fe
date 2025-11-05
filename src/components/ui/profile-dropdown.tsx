"use client"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { User, Settings, LogOut, CalendarCheck  } from "lucide-react"
import { ProfileDropdownProps } from "@/types"
import { useUserProfile } from "@/app/context/UserProfileContext"
import { useState, useEffect } from "react"
export function ProfileDropdown({
    onViewProfile,
    onSettings,
    onAppointments, 
    onLogout
}: Omit<ProfileDropdownProps, 'user'>) {
    const { userProfile, authData } = useUserProfile();
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);
    
   const user = {
       name: userProfile ? `${userProfile.firstName} ${userProfile.lastName}` : "",
       email: authData?.email || "",
       avatar: userProfile?.avatar || "/placeholder.svg"
   };

    const initials = userProfile?.firstName && userProfile?.lastName ?
        `${userProfile.firstName[0]}${userProfile.lastName[0]}`.toUpperCase() : "L";

    if (!isMounted) {
        return (
            <Button
              variant="ghost"
              className="relative h-10 w-10 rounded-full"
              aria-label="Loading user menu"
              disabled
            >
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-primary text-primary-foreground font-medium">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </Button>
        );
    }

return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="relative h-10 w-10 rounded-full focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          aria-label="Open user menu"
        >
          <Avatar className="h-10 w-10">
            <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name || "User avatar"} />
            <AvatarFallback className="bg-primary text-primary-foreground font-medium">{initials}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount sideOffset={8}>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {userProfile ? `${userProfile.firstName} ${userProfile.lastName}` : ""}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {authData?.email || ""}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={onViewProfile}
          className="cursor-pointer focus:bg-accent focus:text-accent-foreground"
        >
          <User className="mr-2 h-4 w-4" />
          <span>My Account</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onSettings} className="cursor-pointer focus:bg-accent focus:text-accent-foreground">
          <Settings className="mr-2 h-4 w-4" />
          <span>Settings</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onAppointments} className="cursor-pointer focus:bg-accent focus:text-accent-foreground">
          <CalendarCheck className="mr-2 h-4 w-4" />
          <span> My Appointments </span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={onLogout}
          className="cursor-pointer text-destructive focus:bg-accent focus:text-destructive-foreground"
        >
          <LogOut className="mr-2 h-4 w-4 hover:bg-muted" />
          <span>Log Out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

