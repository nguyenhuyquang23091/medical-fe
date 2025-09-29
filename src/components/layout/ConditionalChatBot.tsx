"use client"

import { usePathname } from "next/navigation"
import ChatBot from "@/components/chatBot/chatBot"

export default function ConditionalChatBot() {
  const pathname = usePathname()

  // Don't show chatbot for doctor routes
  const isDoctorRoute = pathname.startsWith('/doctor')

  if (isDoctorRoute) {
    return null
  }

  return <ChatBot />
}