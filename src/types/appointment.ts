export interface Appointment {
  id: string
  title: string
  patientName: string
  patientId: string
  doctorId: string
  scheduledTime: string
  duration: number // in minutes
  type: AppointmentType
  status: AppointmentStatus
  meetingLink?: string
  notes?: string
  createdAt: string
  updatedAt: string
}

export enum AppointmentType {
  CONSULTATION = 'consultation',
  FOLLOWUP = 'followup',
  CHECKUP = 'checkup',
  EMERGENCY = 'emergency',
  SUPPORTIVE_SESSION = 'supportive_session',
  ROUTINE = 'routine'
}

export enum AppointmentStatus {
  SCHEDULED = 'scheduled',
  CONFIRMED = 'confirmed',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  NO_SHOW = 'no_show'
}

export interface UpcomingAppointment {
  id: string
  time: string
  title: string
  patientName: string
  type: AppointmentType
  status: AppointmentStatus
  meetingLink?: string
  canJoin: boolean
}