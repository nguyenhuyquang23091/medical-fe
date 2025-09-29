"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Video, MoreHorizontal, X } from "lucide-react"
import { UpcomingAppointment, AppointmentType } from "@/types/appointment"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface UpcomingAppointmentCardProps {
  appointment: UpcomingAppointment
  onJoin?: (appointmentId: string) => void
  onReschedule?: (appointmentId: string) => void
  onCancel?: (appointmentId: string) => void
  onDismiss?: () => void
}

export function UpcomingAppointmentCard({
  appointment,
  onJoin,
  onReschedule,
  onCancel,
  onDismiss
}: UpcomingAppointmentCardProps) {
  const formatAppointmentType = (type: AppointmentType) => {
    switch (type) {
      case AppointmentType.SUPPORTIVE_SESSION:
        return "Supportive session"
      case AppointmentType.CONSULTATION:
        return "Consultation"
      case AppointmentType.FOLLOWUP:
        return "Follow-up"
      case AppointmentType.CHECKUP:
        return "Checkup"
      case AppointmentType.EMERGENCY:
        return "Emergency"
      case AppointmentType.ROUTINE:
        return "Routine"
      default:
        return "Appointment"
    }
  }

  const handleJoin = () => {
    if (onJoin && appointment.canJoin) {
      onJoin(appointment.id)
    }
  }

  return (
    <Card className="relative p-3 bg-gradient-to-br from-cyan-50 to-blue-100 border-0 shadow-lg rounded-2xl w-full">
      {/* Close button */}
      {onDismiss && (
        <button
          className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-white shadow-sm border border-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors"
          onClick={onDismiss}
        >
          <X className="h-4 w-4" />
        </button>
      )}

      {/* Header */}
      <div className="mb-3">
        <p className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-2">
          UPCOMING APPOINTMENT
        </p>

        {/* Time badge */}
        <Badge
          variant="secondary"
          className="bg-gray-900 text-white text-sm font-semibold px-2 py-1 rounded-lg mb-3"
        >
          {appointment.time}
        </Badge>
      </div>

      {/* Appointment details */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-1">
          {formatAppointmentType(appointment.type)}
        </h3>
        <p className="text-gray-600 text-sm">
          with {appointment.patientName}
        </p>
      </div>

      {/* Action buttons */}
      <div className="flex items-center justify-between">
        <Button
          onClick={handleJoin}
          disabled={!appointment.canJoin}
          className="flex items-center gap-2 bg-white text-blue-600 hover:bg-blue-50 border border-blue-200 rounded-xl px-4 py-2 font-medium text-sm"
        >
          <Video className="h-4 w-4" />
          Join
        </Button>

        {/* More options dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="text-gray-600 hover:text-gray-800 hover:bg-white/50 rounded-full"
            >
              <MoreHorizontal className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={() => onReschedule?.(appointment.id)}>
              Reschedule
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onCancel?.(appointment.id)}>
              Cancel
            </DropdownMenuItem>
            <DropdownMenuItem>
              View Details
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </Card>
  )
}