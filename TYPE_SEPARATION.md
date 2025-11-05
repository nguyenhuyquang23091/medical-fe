# Type Separation Documentation

## Overview

The appointment/booking system uses a **clear separation of concerns** between backend DTOs and frontend UI logic:

- **`@/types/appointment`** - Backend domain models and DTOs
- **`@/types/booking`** - Frontend UI state and wizard flow

## File Structure

```
src/
├── types/
│   ├── appointment.ts    ← Backend DTOs (AppointmentRequest/Response)
│   └── booking.ts        ← UI state (BookingState, wizard helpers)
└── actions/
    └── appointment/
        └── appointment.ts ← API service layer
```

---

## @/types/appointment.ts

**Purpose:** Backend-aligned types for API communication

### What belongs here:
✅ **Backend DTOs**
- `AppointmentRequest` - Maps to BE `AppointmentRequest`
- `AppointmentResponse` - Maps to BE `AppointmentResponse`

✅ **Backend Enums**
- `ConsultationType` - Maps to BE `ConsultationType`
- `AppointmentStatus` - Maps to BE `AppointmentStatus`

✅ **Validation helpers** (for backend rules)
- `isValidPhoneNumber()` - Validates BE pattern `^[0-9]{10,15}$`
- `isValidReasons()` - Validates BE max length 500
- `isValidAppointmentDate()` - Validates BE `@Future` constraint

✅ **Legacy types** (backward compatibility)
- `Appointment`, `AppointmentType`, `UpcomingAppointment` (deprecated)

### What does NOT belong here:
❌ UI wizard steps (BookingStep)
❌ UI form state (BookingState)
❌ UI helper types (TimeSlot, ClinicLocation)
❌ Payment method enums (PaymentMethod)
❌ Cost breakdown logic

### Example usage:
```typescript
import { AppointmentRequest, ConsultationType } from "@/types/appointment";
import appointmentService from "@/actions/appointment/appointment";

// Create appointment via API
const request: AppointmentRequest = {
  doctorId: "123",
  reasons: "Flu symptoms",
  phoneNumber: "0123456789",
  appointmentDateTime: "2025-11-05T10:00:00Z",
  specialtyRelationshipId: 1,
  serviceRelationshipId: 2,
  consultationType: ConsultationType.VIDEO_CALL,
};

const response = await appointmentService.createAppointment(request, token);
```

---

## @/types/booking.ts

**Purpose:** Frontend UI types for the booking wizard flow

### What belongs here:
✅ **UI Wizard State**
- `BookingState` - Tracks user selections across 6 steps
- `BookingStep` - Enum for wizard progression

✅ **UI-only Enums**
- `PaymentMethod` - For payment step (not in backend)
- `TimeSlotPeriod` - For grouping time slots (MORNING/AFTERNOON/EVENING)

✅ **UI Helper Types**
- `ClinicLocation` - For clinic selection display
- `TimeSlot` - For scheduling interface
- `BookingCostBreakdown` - For payment summary
- `BookingConfirmation` - For success screen

✅ **Conversion & Helper Functions**
- `convertBookingStateToRequest()` - UI → API conversion
- `calculateCostBreakdown()` - Cost calculation
- `generateBookingReference()` - User-friendly ID
- `isBookingStateComplete()` - Validation check
- `canProceedToNextStep()` - Step validation

### What does NOT belong here:
❌ Backend DTOs (AppointmentRequest/Response)
❌ Backend enums (AppointmentStatus)
❌ API validation rules
❌ Database relationship IDs logic

### Example usage:
```typescript
import {
  BookingState,
  convertBookingStateToRequest,
  calculateCostBreakdown
} from "@/types/booking";
import { ConsultationType } from "@/types/appointment";

// UI wizard state
const [bookingState, setBookingState] = useState<BookingState>({
  selectedSpecialtyId: 1,
  selectedServiceId: 2,
  consultationType: ConsultationType.VIDEO_CALL,
  selectedDate: new Date("2025-11-05"),
  selectedTimeSlot: "10:00 - 11:00",
  phoneNumber: "0123456789",
  reasonForVisit: "Flu symptoms",
});

// Convert to API request when submitting
const request = convertBookingStateToRequest(bookingState, doctorId);
const response = await appointmentService.createAppointment(request, token);

// Calculate cost for payment summary
const costBreakdown = calculateCostBreakdown(servicePrice, "VND");
```

---

## @/actions/appointment/appointment.ts

**Purpose:** API service layer for appointment operations

### Responsibilities:
✅ HTTP requests to backend appointment endpoints
✅ Uses `AppointmentRequest`/`AppointmentResponse` from `@/types/appointment`
✅ Error handling and response validation
✅ Maps to BE controller methods 1:1

### Endpoints:
```typescript
appointmentService.createAppointment()       // POST /appointment/create
appointmentService.getDoctorAppointments()   // GET /appointment
appointmentService.getMyAppointments()       // GET /appointment/my-appointments
appointmentService.cancelAppointment()       // PUT /appointment/cancel
appointmentService.deleteAppointment()       // DELETE /appointment
```

### Example:
```typescript
import appointmentService from "@/actions/appointment/appointment";
import { AppointmentRequest } from "@/types/appointment";

const request: AppointmentRequest = { /* ... */ };
const response = await appointmentService.createAppointment(request, token);
```

---

## Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     BOOKING WIZARD (UI)                     │
│                                                             │
│  Step 1-6: User fills form                                 │
│  ↓                                                          │
│  BookingState (from @/types/booking)                       │
│    - selectedSpecialtyId                                    │
│    - consultationType                                       │
│    - selectedDate                                           │
│    - phoneNumber                                            │
│    - reasonForVisit                                         │
└─────────────────────────────────────────────────────────────┘
                          ↓
                          ↓ convertBookingStateToRequest()
                          ↓
┌─────────────────────────────────────────────────────────────┐
│               APPOINTMENT SERVICE (API Layer)               │
│                                                             │
│  AppointmentRequest (from @/types/appointment)             │
│    - doctorId: string                                       │
│    - reasons: string                                        │
│    - phoneNumber: string                                    │
│    - appointmentDateTime: string (ISO 8601)                 │
│    - specialtyRelationshipId: number                        │
│    - serviceRelationshipId: number                          │
│    - consultationType: ConsultationType                     │
└─────────────────────────────────────────────────────────────┘
                          ↓
                          ↓ HTTP POST /appointment/create
                          ↓
┌─────────────────────────────────────────────────────────────┐
│                  BACKEND (Spring Boot)                      │
│                                                             │
│  AppointmentRequest DTO (Java)                             │
│    @NotBlank String doctorId                                │
│    @Size(max=500) String reasons                            │
│    @Pattern String phoneNumber                              │
│    @Future LocalDateTime appointmentDateTime                │
│    @NotNull Long specialtyRelationshipId                    │
│    @NotNull Long serviceRelationshipId                      │
│    @NotNull ConsultationType consultationType               │
│  ↓                                                          │
│  Process & Validate                                         │
│  ↓                                                          │
│  AppointmentResponse DTO (Java)                            │
└─────────────────────────────────────────────────────────────┘
                          ↓
                          ↓ HTTP Response
                          ↓
┌─────────────────────────────────────────────────────────────┐
│               APPOINTMENT SERVICE (API Layer)               │
│                                                             │
│  AppointmentResponse (from @/types/appointment)            │
│    - id, userId, doctorId                                   │
│    - patientFullName, doctorFullName                        │
│    - appointmentDateTime                                    │
│    - appointmentStatus                                      │
│    - prices                                                 │
│    - paymentURL                                             │
└─────────────────────────────────────────────────────────────┘
                          ↓
                          ↓ Update UI state
                          ↓
┌─────────────────────────────────────────────────────────────┐
│               CONFIRMATION SCREEN (UI)                      │
│                                                             │
│  Display AppointmentResponse data                          │
│  Show booking reference, payment URL, etc.                 │
└─────────────────────────────────────────────────────────────┘
```

---

## Import Guidelines

### ✅ Correct Imports

**In UI Components (pages, components):**
```typescript
import { BookingState, BookingStep, convertBookingStateToRequest } from "@/types/booking";
import { ConsultationType } from "@/types/appointment"; // Re-exported in booking.ts
```

**In API Service Layer:**
```typescript
import { AppointmentRequest, AppointmentResponse } from "@/types/appointment";
```

**In Booking Wizard Components:**
```typescript
// Import UI types
import { BookingState, TimeSlot, ClinicLocation } from "@/types/booking";
// Import shared enum (re-exported from appointment)
import { ConsultationType } from "@/types/appointment";
```

### ❌ Incorrect Imports

**DON'T mix concerns:**
```typescript
// ❌ BAD: Importing backend DTOs in UI components
import { AppointmentRequest } from "@/types/appointment";
const [formState, setFormState] = useState<AppointmentRequest>({...});

// ✅ GOOD: Use BookingState for UI
import { BookingState } from "@/types/booking";
const [bookingState, setBookingState] = useState<BookingState>({...});
```

```typescript
// ❌ BAD: Importing UI types in service layer
import { BookingState } from "@/types/booking";
const response = await httpClient.post<BookingState>(...);

// ✅ GOOD: Use backend DTOs
import { AppointmentRequest } from "@/types/appointment";
const response = await httpClient.post<AppointmentRequest>(...);
```

---

## Type Re-exports

**`@/types/booking` re-exports from `@/types/appointment`:**
```typescript
// In booking.ts
import { ConsultationType, AppointmentRequest } from "./appointment";

// UI components can import from booking.ts directly
import { ConsultationType } from "@/types/booking"; // OK
```

**Why?** UI components work with booking flow and need `ConsultationType` for selections. Re-exporting avoids needing two imports.

---

## When to Add New Types

### Add to `appointment.ts` when:
- Backend adds new DTO fields
- Backend adds new enum values
- Backend changes validation rules
- Need to add API response types

### Add to `booking.ts` when:
- Adding new wizard steps
- Adding UI-only form fields
- Creating new display/presentation types
- Adding UI helper functions
- Adding client-side validation

---

## Migration Notes

### Legacy Components
Existing components using deprecated types (`Appointment`, `AppointmentType`) should gradually migrate to:
- `AppointmentResponse` for API data
- `BookingState` for UI form state

### Breaking Changes
- `AppointmentModalityType` renamed to `ConsultationType` (✅ Already updated in all components)
- `bookingState.appointmentModality` → `bookingState.consultationType` (✅ Already updated)

---

## Summary Table

| Concern                  | File                    | Purpose                           |
|--------------------------|-------------------------|-----------------------------------|
| **Backend DTOs**         | `types/appointment.ts`  | API request/response types        |
| **Backend Enums**        | `types/appointment.ts`  | Domain model enums                |
| **API Validation**       | `types/appointment.ts`  | Backend constraint helpers        |
| **UI Wizard State**      | `types/booking.ts`      | Form state management             |
| **UI Presentation**      | `types/booking.ts`      | Display/formatting helpers        |
| **UI Helpers**           | `types/booking.ts`      | Client-side utilities             |
| **API Calls**            | `actions/appointment/*` | HTTP service layer                |

---

## Questions?

**Q: Where do I put `ConsultationType`?**
A: In `types/appointment.ts` (backend enum), re-exported in `types/booking.ts` for convenience.

**Q: Where do I put form validation logic?**
A: Backend validation rules → `types/appointment.ts` (e.g., phone pattern)
   UI-only validation → `types/booking.ts` (e.g., step completion)

**Q: Can I import from both files in one component?**
A: Yes! Import backend types for API calls, UI types for state management.

**Q: What if I need to convert between types?**
A: Use helper functions in `types/booking.ts` (e.g., `convertBookingStateToRequest()`)
