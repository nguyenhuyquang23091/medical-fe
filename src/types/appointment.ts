/**
 * Appointment types - Backend DTOs and domain models
 * Maps directly to BE AppointmentController and AppointmentRequest/Response
 */

import * as z from "zod";

// ==================== BACKEND ENUMS ====================

/**
 * Appointment consultation type - maps to BE ConsultationType enum
 * Represents HOW the appointment will be conducted (delivery method)
 */
export enum ConsultationType {
  IN_PERSON = "IN_PERSON",
  VIDEO_CALL = "VIDEO_CALL",
}

/**
 * Appointment status - maps to BE AppointmentStatus enum
 */
export enum AppointmentStatus {
  PENDING = "PENDING",
  CONFIRMED = "CONFIRMED",
  CANCELLED = "CANCELLED",
  COMPLETED = "COMPLETED",
  NO_SHOW = "NO_SHOW",
}


export interface AppointmentRequest {
  doctorId: string;
  reasons: string; // Max 500 characters
  phoneNumber: string; // Pattern: 10-15 digits
  appointmentDateTime: string; // ISO 8601 format (LocalDateTime in BE)
  specialtyRelationshipId: number; // Long in BE
  serviceRelationshipId: number; // Long in BE
  consultationType: ConsultationType;
}


export interface AppointmentResponse {
  id: string;
  userId: string;
  doctorId: string;
  patientFullName: string;
  doctorFullName: string;
  reasons: string;
  phoneNumber: string;
  appointmentDateTime: string; // ISO 8601 format
  specialty: string; // Specialty name (not ID)
  services: string; // Service name (not ID)
  appointmentStatus: AppointmentStatus;
  consultationType: ConsultationType;
  prices: number; // BigDecimal in BE, mapped to number
  paymentURL?: string; // Optional VNPay URL
  createdDate: string; // Instant in BE, ISO 8601 timestamp
  modifiedDate: string; // Instant in BE, ISO 8601 timestamp
}

// ==================== VALIDATION SCHEMAS ====================

/**
 * Appointment request validation schema
 * Matches backend validation rules:
 * - doctorId: @NotBlank
 * - reasons: @NotBlank, @Size(max=500)
 * - phoneNumber: @NotBlank, @Pattern(regexp="^[0-9]{10,15}$")
 * - appointmentDateTime: @NotNull, @Future
 * - specialtyRelationshipId: @NotNull
 * - serviceRelationshipId: @NotNull
 * - consultationType: @NotNull
 */
export const appointmentRequestSchema = z.object({
  doctorId: z
    .string()
    .min(1, "Doctor ID is required"),

  reasons: z
    .string()
    .min(1, "Reason for appointment is required")
    .max(500, "Reason must be less than 500 characters"),

  phoneNumber: z
    .string()
    .min(1, "Phone number is required")
    .regex(/^[0-9]{10,15}$/, "Phone number must be 10-15 digits"),

  appointmentDateTime: z
    .string()
    .min(1, "Appointment date and time is required")
    .refine(
      (dateStr) => new Date(dateStr) > new Date(),
      "Appointment date must be in the future"
    ),

  specialtyRelationshipId: z
    .number()
    .int("Specialty ID must be an integer")
    .positive("Specialty ID must be positive"),

  serviceRelationshipId: z
    .number()
    .int("Service ID must be an integer")
    .positive("Service ID must be positive"),

  consultationType: z.nativeEnum(ConsultationType, {
    errorMap: () => ({ message: "Invalid consultation type" }),
  }),
});

/**
 * Phone number validation schema (standalone)
 * Used in booking form validation
 */
export const phoneNumberSchema = z
  .string()
  .regex(/^[0-9]{10,15}$/, "Phone number must be 10-15 digits");

/**
 * Reasons validation schema (standalone)
 * Used in booking form validation
 */
export const reasonsSchema = z
  .string()
  .min(1, "Reason is required")
  .max(500, "Reason must be less than 500 characters");

// Inferred type from schema
export type AppointmentRequestValidation = z.infer<typeof appointmentRequestSchema>;

// ==================== UI-SPECIFIC TYPES ====================
// These types are used for UI components (doctor dashboard, patient view)
// Not from backend - used for mock data and UI display

/**
 * Appointment type - Represents the PURPOSE of the appointment
 * UI-only enum used in doctor dashboard for categorizing appointments
 * Note: This is different from ConsultationType (delivery method)
 */
export enum AppointmentType {
  CONSULTATION = "consultation",
  FOLLOWUP = "followup",
  CHECKUP = "checkup",
  EMERGENCY = "emergency",
  SUPPORTIVE_SESSION = "supportive_session",
  ROUTINE = "routine",
}

/**
 * Upcoming appointment display type
 * UI-only interface for doctor dashboard upcoming appointment card
 * Used for quick-view appointment information in sidebar
 */
export interface UpcomingAppointment {
  id: string;
  time: string; // Formatted display time (e.g., "2:30PM")
  title: string; // Appointment title or type description
  patientName: string;
  type: AppointmentType; // Purpose/category of appointment
  status: AppointmentStatus;
  meetingLink?: string; // For video/audio consultations
  canJoin: boolean; // Whether the appointment can be joined now
}