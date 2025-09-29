"use client"

import { usePathname } from "next/navigation"
import Navbar from "@/components/navbar/navbar"

export default function ConditionalNavbar() {
  const pathname = usePathname()

  // Don't show navbar for doctor routes
  const isDoctorRoute = pathname.startsWith('/doctor')

  if (isDoctorRoute) {
    return null
  }

  return <Navbar />
}