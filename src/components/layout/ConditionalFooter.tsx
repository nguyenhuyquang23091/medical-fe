"use client"

import { usePathname } from "next/navigation"
import Footer from "@/components/footer/footer"

export default function ConditionalFooter() {
  const pathname = usePathname()

  // Don't show footer for doctor routes
  const isDoctorRoute = pathname.startsWith('/doctor')

  if (isDoctorRoute) {
    return null
  }

  return <Footer />
}