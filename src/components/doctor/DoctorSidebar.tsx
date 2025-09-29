"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import {
  CalendarCheck,
  Users,
  FileText,
  BarChart3,
  Settings,
  Home,
  Bell,
  MessageSquare
} from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar"
import { useAuth } from "@/app/context/AuthContext"
import { useRouter } from "next/navigation"
import { DoctorProfileDropdown } from "./DoctorProfileDropdown"
import { UpcomingAppointmentCard } from "./UpcomingAppointmentCard"
import { UpcomingAppointment, AppointmentType, AppointmentStatus } from "@/types/appointment"
import { useState } from "react"

const navigation = [
  {
    title: "Dashboard",
    url: "/doctor",
    icon: Home,
  },
  {
    title: "Appointments",
    url: "/doctor/appointments",
    icon: CalendarCheck,
  },
  {
    title: "Patients",
    url: "/doctor/patients",
    icon: Users,
  },
  {
    title: "Messages",
    url: "/doctor/messages",
    icon: MessageSquare,
  },
  {
    title: "Notifications",
    url: "/doctor/notifications",
    icon: Bell,
  },
  {
    title: "Analytics",
    url: "/doctor/analytics",
    icon: BarChart3,
  },
]

const settingsNavigation = [
  {
    title: "Settings",
    url: "/doctor/settings",
    icon: Settings,
  },
]

export function DoctorSidebar() {
  const pathname = usePathname()
  const { logout } = useAuth()
  const router = useRouter()
  const [showUpcomingAppointment, setShowUpcomingAppointment] = useState(true)

  // Mock upcoming appointment data
  const upcomingAppointment: UpcomingAppointment = {
    id: "1",
    time: "2:30PM",
    title: "Supportive session",
    patientName: "Justin Korsgaard",
    type: AppointmentType.SUPPORTIVE_SESSION,
    status: AppointmentStatus.CONFIRMED,
    meetingLink: "https://meet.example.com/room-123",
    canJoin: true
  }

  const handleJoinAppointment = (appointmentId: string) => {
    console.log("Joining appointment:", appointmentId)
    if (upcomingAppointment.meetingLink) {
      window.open(upcomingAppointment.meetingLink, '_blank')
    }
  }

  const handleRescheduleAppointment = (appointmentId: string) => {
    console.log("Rescheduling appointment:", appointmentId)
  }

  const handleCancelAppointment = (appointmentId: string) => {
    console.log("Cancelling appointment:", appointmentId)
  }

  const handleDismissAppointment = () => {
    setShowUpcomingAppointment(false)
  }

  const handleViewProfile = () => {
    router.push("/doctor/profile")
  }

  const handleSettings = () => {
    router.push("/doctor/settings")
  }

  const handleLogout = async () => {
    try {
      await logout()
      router.push('/')
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  return (
    <Sidebar variant="inset">
      <SidebarHeader>
        <div className="flex items-center gap-2 px-4 py-2">
          <Image
            src="/images/logo2.jpg"
            alt="MedConnect Logo"
            width={40}
            height={40}
            className="rounded-full"
          />
          <div className="flex flex-col">
            <span className="text-lg font-bold text-blue-600">MedConnect</span>
            <span className="text-xs text-muted-foreground">Doctor Portal</span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Main</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigation.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.url}
                  >
                    <Link href={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        {/* Upcoming Appointment Card */}
        {showUpcomingAppointment && (
          <div className="px-2 py-2">
            <UpcomingAppointmentCard
              appointment={upcomingAppointment}
              onJoin={handleJoinAppointment}
              onReschedule={handleRescheduleAppointment}
              onCancel={handleCancelAppointment}
              onDismiss={handleDismissAppointment}
            />
          </div>
        )}

        <SidebarSeparator />

        <SidebarGroup>
          <SidebarGroupLabel>Account</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {settingsNavigation.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.url}
                  >
                    <Link href={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DoctorProfileDropdown
              onViewProfileAction={handleViewProfile}
              onSettingsAction={handleSettings}
              onLogoutAction={handleLogout}
            />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}