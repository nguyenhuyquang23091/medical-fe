/**
 * Booking flow types - UI-specific types for the 6-step booking wizard
 * This file handles the booking flow UI state and presentation logic
 * For backend appointment DTOs, see @/types/appointment
 */

// Re-export commonly used appointment types for convenience
export { ConsultationType } from "./appointment"; // Enum (value + type)
export type { AppointmentRequest } from "./appointment"; // Type-only
import { ConsultationType, appointmentRequestSchema } from "./appointment";
import type { AppointmentRequest } from "./appointment";

// ==================== UI WIZARD FLOW ====================

/**
 * Booking wizard step progression
 */
export enum BookingStep {
  SPECIALTY_SELECTION = 1,
  APPOINTMENT_TYPE = 2,
  DATE_TIME = 3,
  BASIC_INFO = 4,
  PAYMENT = 5,
  CONFIRMATION = 6,
}

/**
 * Payment method options (UI-only, for payment step)
 */
export enum PaymentMethod {
  CREDIT_CARD = "CREDIT_CARD",
  PAYPAL = "PAYPAL",
  STRIPE = "STRIPE",
  VN_PAY = "VN_PAY",
}

/**
 * Time slot period grouping (UI-only, for scheduling interface)
 */
export enum TimeSlotPeriod {
  MORNING = "MORNING",
  AFTERNOON = "AFTERNOON",
  EVENING = "EVENING",
}

// ==================== UI STATE MANAGEMENT ====================

/**
 * Local booking state for wizard flow
 * Tracks user selections across the 6-step booking wizard
 * This state is eventually converted to AppointmentRequest for API submission
 */
export interface BookingState {
  // Step 1: Specialty Selection
  selectedSpecialtyId?: number; // Maps to AppointmentRequest.specialtyRelationshipId
  selectedServiceId?: number; // Maps to AppointmentRequest.serviceRelationshipId

  // Step 2: Appointment Type
  consultationType?: ConsultationType; // Maps to AppointmentRequest.consultationType
  selectedClinicId?: string; // UI-only: for clinic selection

  // Step 3: Date & Time
  selectedDate?: Date; // Combined with selectedTimeSlot → AppointmentRequest.appointmentDateTime
  selectedTimeSlot?: string; // Format: "HH:mm - HH:mm"

  // Step 4: Basic Information
  firstName?: string; // UI-only: combined to build patient full name
  lastName?: string; // UI-only: combined to build patient full name
  phoneNumber?: string; // Maps to AppointmentRequest.phoneNumber
  email?: string; // UI-only: for confirmation email
  patientId?: string; // UI-only: for selecting existing patient
  symptoms?: string; // UI-only: additional context
  reasonForVisit?: string; // Maps to AppointmentRequest.reasons
  attachments?: File[]; // UI-only: for future attachment support

  // Step 5: Payment
  paymentMethod?: PaymentMethod; // UI-only: payment method selection
  cardHolderName?: string; // UI-only: for credit card payment
  cardNumber?: string; // UI-only: for credit card payment
  expiryDate?: string; // UI-only: for credit card payment
  cvv?: string; // UI-only: for credit card payment

  // Step 6: Confirmation (populated from AppointmentResponse)
  appointmentId?: string; // From AppointmentResponse.id
  bookingReferenceNumber?: string; // UI-friendly display of appointmentId
  paymentURL?: string; // From AppointmentResponse.paymentURL
}

// ==================== UI HELPER TYPES ====================

/**
 * Clinic location for clinic selection step
 * UI-only: fetched from doctor profile or locations API
 */
export interface ClinicLocation {
  clinicId: string;
  name: string;
  address: string;
  distance: string;
  isAvailable: boolean;
}

/**
 * Time slot for scheduling step
 * UI-only: generated from doctor's availability
 */
export interface TimeSlot {
  id: string;
  startTime: string; // Format: "HH:mm"
  endTime: string; // Format: "HH:mm"
  period: TimeSlotPeriod;
  isAvailable: boolean;
}

/**
 * Cost breakdown for payment summary
 * UI-only: computed from service prices and fees
 */
export interface BookingCostBreakdown {
  serviceCharge: number; // From DoctorService.price
  bookingFee: number; // Platform booking fee
  tax: number; // Calculated tax (e.g., 10%)
  discount: number; // Applied discounts
  total: number; // Final amount (should match AppointmentResponse.prices)
  currency: string; // VND, USD, etc.
}

/**
 * Confirmation display data
 * UI-only: formatted data for confirmation step display
 */
export interface BookingConfirmation {
  bookingReferenceNumber: string;
  qrCode?: string; // Generated QR code for appointment
  doctorName: string;
  appointmentDate: string; // Formatted date string
  appointmentTime: string; // Formatted time string
  consultationType: ConsultationType;
  location?: string;
  costBreakdown: BookingCostBreakdown;
}

// ==================== CONVERSION HELPERS ====================

/**
 * Convert BookingState to AppointmentRequest for API submission
 * Uses Zod validation to ensure all backend constraints are met
 *
 * @param state - Current booking state from wizard
 * @param doctorId - Selected doctor's ID
 * @returns AppointmentRequest ready for API call
 * @throws ZodError if validation fails with detailed error messages
 */
export function convertBookingStateToRequest(
  state: BookingState,
  doctorId: string
): AppointmentRequest {
  // Validate required fields exist
  if (!state.selectedSpecialtyId || !state.selectedServiceId) {
    throw new Error("Missing specialty or service selection");
  }

  if (!state.consultationType) {
    throw new Error("Missing consultation type");
  }

  if (!state.selectedDate || !state.selectedTimeSlot) {
    throw new Error("Missing appointment date or time");
  }

  if (!state.phoneNumber || !state.reasonForVisit) {
    throw new Error("Missing patient information");
  }

  // Combine date and time slot with validation
  const [startTime] = state.selectedTimeSlot.split(" - ");
  
  // Validate and create appointment date
  let appointmentDate: Date;
  
  // Handle different date input types
  if (state.selectedDate instanceof Date) {
    appointmentDate = new Date(state.selectedDate.getTime());
  } else if (typeof state.selectedDate === 'string') {
    appointmentDate = new Date(state.selectedDate);
  } else {
    throw new Error(`Unsupported date type: ${typeof state.selectedDate}`);
  }
  
  if (isNaN(appointmentDate.getTime())) {
    throw new Error(`Invalid appointment date provided: ${state.selectedDate}`);
  }
  
  // Parse and validate time
  const timeParts = startTime.split(":");
  if (timeParts.length !== 2) {
    throw new Error("Invalid time slot format. Expected HH:mm format");
  }
  
  const hours = parseInt(timeParts[0], 10);
  const minutes = parseInt(timeParts[1], 10);
  
  if (isNaN(hours) || isNaN(minutes) || hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
    throw new Error("Invalid time values in time slot");
  }
  
  appointmentDate.setHours(hours, minutes, 0, 0);
  
  // Final validation of the combined date/time
  if (isNaN(appointmentDate.getTime())) {
    throw new Error("Invalid appointment date/time combination");
  }

  // Build AppointmentRequest object
  const request: AppointmentRequest = {
    doctorId,
    reasons: state.reasonForVisit,
    phoneNumber: state.phoneNumber,
    appointmentDateTime: appointmentDate.toISOString(),
    specialtyRelationshipId: state.selectedSpecialtyId,
    serviceRelationshipId: state.selectedServiceId,
    consultationType: state.consultationType,
  };

  // Validate with Zod schema (throws ZodError if invalid)
  return appointmentRequestSchema.parse(request);
}

/**
 * Calculate cost breakdown from service price
 * UI helper for payment summary display
 *
 * @param servicePrice - Base service price
 * @param currency - Currency code (VND, USD, etc.)
 * @returns Complete cost breakdown
 */
export function calculateCostBreakdown(
  servicePrice: number,
  currency: string = "VND"
): BookingCostBreakdown {
  const bookingFee = 20000; // Fixed platform fee
  const taxRate = 0.1; // 10% tax
  const tax = Math.round(servicePrice * taxRate);
  const discount = 0; // Can be calculated based on promotions

  return {
    serviceCharge: servicePrice,
    bookingFee,
    tax,
    discount,
    total: servicePrice + bookingFee + tax - discount,
    currency,
  };
}

/**
 * Format time slot for display
 * Converts 24h format to readable string
 *
 * @param startTime - Start time (HH:mm)
 * @param endTime - End time (HH:mm)
 * @returns Formatted time slot string
 */
export function formatTimeSlot(startTime: string, endTime: string): string {
  return `${startTime} - ${endTime}`;
}

/**
 * Generate booking reference number from appointment ID
 * Converts UUID to user-friendly format
 *
 * @param appointmentId - Appointment UUID from backend
 * @returns Short reference number (e.g., "APT-12345")
 */
export function generateBookingReference(appointmentId: string): string {
  // Take last 8 characters of UUID and convert to uppercase
  const shortId = appointmentId.substring(appointmentId.length - 8).toUpperCase();
  return `APT-${shortId}`;
}

// ==================== TYPE GUARDS ====================

/**
 * Check if booking state has all required fields for submission
 */
export function isBookingStateComplete(state: BookingState): boolean {
  return !!(
    state.selectedSpecialtyId &&
    state.selectedServiceId &&
    state.consultationType &&
    state.selectedDate &&
    state.selectedTimeSlot &&
    state.phoneNumber &&
    state.reasonForVisit
  );
}

/**
 * Check if current step has required data before proceeding
 */
export function canProceedToNextStep(
  currentStep: BookingStep,
  state: BookingState
): boolean {
  switch (currentStep) {
    case BookingStep.SPECIALTY_SELECTION:
      return !!(state.selectedSpecialtyId && state.selectedServiceId);

    case BookingStep.APPOINTMENT_TYPE:
      return !!(
        state.consultationType &&
        (state.consultationType !== ConsultationType.IN_PERSON ||
          state.selectedClinicId)
      );

    case BookingStep.DATE_TIME:
      return !!(state.selectedDate && state.selectedTimeSlot);

    case BookingStep.BASIC_INFO:
      return !!(state.phoneNumber && state.reasonForVisit);

    case BookingStep.PAYMENT:
      return !!state.paymentMethod;

    default:
      return false;
  }
}
