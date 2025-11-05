# Builder Pattern Integration Guide

## Overview

This document explains how to integrate the `AppointmentRequestBuilder` pattern into the existing booking flow.

**Key Principle:** Separate UI state from API state
- **BookingState:** UI-specific fields (payment info, email, etc.)
- **AppointmentRequestBuilder:** API-specific fields (validated at each step)

---

## Architecture Comparison

### Before (Current Implementation)

```typescript
// Single state object with mixed concerns
const [bookingState, setBookingState] = useState<BookingState>({});

// Validation happens at the end
const request = convertBookingStateToRequest(bookingState, doctorId);
// ❌ Errors discovered only at submission
```

### After (Builder Pattern)

```typescript
// Separate UI state and API builder
const [bookingState, setBookingState] = useState<BookingState>({}); // UI only
const builderRef = useRef(createAppointmentRequestBuilder()); // API construction

// Validation happens at each step
const result = builderRef.current.withSpecialty(specialtyId);
if (!result.success) {
  // ✅ Show error immediately
  alert(result.error);
  return;
}
builderRef.current = result.data; // Update builder
```

---

## Integration Steps

### Step 1: Update Booking Page

**File:** `src/app/booking/[doctorId]/page.tsx`

```typescript
"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { BookingStep, BookingState } from "@/types/booking";
import { DoctorProfileResponse } from "@/types/doctorProfile";
import { BookingProgress } from "@/components/booking/BookingProgress";
import { DoctorInfoHeader } from "@/components/booking/DoctorInfoHeader";
import { SpecialtySelection } from "@/components/booking/steps/SpecialtySelection";
import { AppointmentTypeSelection } from "@/components/booking/steps/AppointmentTypeSelection";
import { DateTimeSelection } from "@/components/booking/steps/DateTimeSelection";
import { BasicInformation } from "@/components/booking/steps/BasicInformation";
import { PaymentGateway } from "@/components/booking/steps/PaymentGateway";
import { BookingConfirmationStep } from "@/components/booking/steps/BookingConfirmation";
import { Card } from "@/components/ui/card";
import {
  AppointmentRequestBuilder,
  createAppointmentRequestBuilder,
} from "@/lib/builders/AppointmentRequestBuilder";
import appointmentService from "@/actions/appointment/appointment";

export default function BookingPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const doctorId = params.doctorId as string;

  const [currentStep, setCurrentStep] = useState<BookingStep>(
    BookingStep.SPECIALTY_SELECTION
  );

  // UI state (payment info, email, etc.)
  const [bookingState, setBookingState] = useState<BookingState>({});

  // API request builder (validation at each step)
  const builderRef = useRef<AppointmentRequestBuilder>(
    createAppointmentRequestBuilder()
  );

  const [doctorProfile, setDoctorProfile] =
    useState<DoctorProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch doctor profile
  useEffect(() => {
    const fetchDoctorProfile = async () => {
      try {
        setLoading(true);
        const { mockDoctorProfile } = await import("@/lib/mock/bookingData");
        await new Promise((resolve) => setTimeout(resolve, 500));
        setDoctorProfile(mockDoctorProfile);
      } catch (error) {
        console.error("Error fetching doctor profile:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDoctorProfile();
  }, [doctorId]);

  const handleNext = () => {
    if (currentStep < BookingStep.CONFIRMATION) {
      setCurrentStep((currentStep + 1) as BookingStep);
    }
  };

  const handleBack = () => {
    if (currentStep > BookingStep.SPECIALTY_SELECTION) {
      setCurrentStep((currentStep - 1) as BookingStep);
    }
  };

  const handleStepUpdate = (updates: Partial<BookingState>) => {
    setBookingState((prev) => ({
      ...prev,
      ...updates,
    }));
  };

  /**
   * Submit appointment to backend
   * Called from PaymentGateway step after payment is confirmed
   */
  const handleSubmitAppointment = async () => {
    try {
      // Build final validated request
      const buildResult = builderRef.current.build();

      if (!buildResult.success) {
        alert(`Validation error: ${buildResult.error}`);
        return;
      }

      // Submit to backend
      if (!session?.accessToken) {
        alert("Please log in to book an appointment");
        router.push("/login");
        return;
      }

      const response = await appointmentService.createAppointment(
        buildResult.data,
        session.accessToken
      );

      // Update booking state with response data
      handleStepUpdate({
        appointmentId: response.id,
        bookingReferenceNumber: `APT-${response.id.substring(0, 8).toUpperCase()}`,
        paymentURL: response.paymentURL,
      });

      // Move to confirmation step
      handleNext();
    } catch (error) {
      console.error("Error creating appointment:", error);
      alert("Failed to create appointment. Please try again.");
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case BookingStep.SPECIALTY_SELECTION:
        return (
          <SpecialtySelection
            doctorProfile={doctorProfile}
            bookingState={bookingState}
            builder={builderRef.current}
            onBuilderUpdate={(newBuilder) => {
              builderRef.current = newBuilder;
            }}
            onUpdate={handleStepUpdate}
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      case BookingStep.APPOINTMENT_TYPE:
        return (
          <AppointmentTypeSelection
            doctorProfile={doctorProfile}
            bookingState={bookingState}
            builder={builderRef.current}
            onBuilderUpdate={(newBuilder) => {
              builderRef.current = newBuilder;
            }}
            onUpdate={handleStepUpdate}
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      case BookingStep.DATE_TIME:
        return (
          <DateTimeSelection
            doctorProfile={doctorProfile}
            bookingState={bookingState}
            builder={builderRef.current}
            onBuilderUpdate={(newBuilder) => {
              builderRef.current = newBuilder;
            }}
            onUpdate={handleStepUpdate}
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      case BookingStep.BASIC_INFO:
        return (
          <BasicInformation
            bookingState={bookingState}
            builder={builderRef.current}
            onBuilderUpdate={(newBuilder) => {
              builderRef.current = newBuilder;
            }}
            onUpdate={handleStepUpdate}
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      case BookingStep.PAYMENT:
        return (
          <PaymentGateway
            bookingState={bookingState}
            doctorProfile={doctorProfile}
            onUpdate={handleStepUpdate}
            onNext={handleNext}
            onBack={handleBack}
            onSubmit={handleSubmitAppointment} // New: submit handler
          />
        );
      case BookingStep.CONFIRMATION:
        return (
          <BookingConfirmationStep
            bookingState={bookingState}
            doctorProfile={doctorProfile}
          />
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading doctor information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8">
          <BookingProgress currentStep={currentStep} />
        </div>

        {currentStep !== BookingStep.CONFIRMATION && doctorProfile && (
          <div className="mb-6">
            <DoctorInfoHeader doctor={doctorProfile} />
          </div>
        )}

        <Card className="bg-white border border-gray-200 rounded-xl p-6 md:p-8">
          {renderStep()}
        </Card>
      </div>
    </div>
  );
}
```

---

### Step 2: Update Step Components

Each step component needs to:
1. Receive `builder` and `onBuilderUpdate` props
2. Call builder methods when data changes
3. Handle validation errors immediately

**Example: SpecialtySelection.tsx**

```typescript
import { AppointmentRequestBuilder } from "@/lib/builders/AppointmentRequestBuilder";

interface SpecialtySelectionProps {
  doctorProfile: DoctorProfileResponse | null;
  bookingState: BookingState;
  builder: AppointmentRequestBuilder; // NEW
  onBuilderUpdate: (builder: AppointmentRequestBuilder) => void; // NEW
  onUpdate: (updates: Partial<BookingState>) => void;
  onNext: () => void;
  onBack: () => void;
}

export const SpecialtySelection: React.FC<SpecialtySelectionProps> = ({
  doctorProfile,
  bookingState,
  builder, // NEW
  onBuilderUpdate, // NEW
  onUpdate,
  onNext,
  onBack,
}) => {
  const [selectedSpecialtyId, setSelectedSpecialtyId] = useState<number | undefined>(
    bookingState.selectedSpecialtyId
  );
  const [selectedServiceId, setSelectedServiceId] = useState<number | undefined>(
    bookingState.selectedServiceId
  );
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleNext = () => {
    // Clear previous errors
    setValidationError(null);

    // Validate and update builder
    let currentBuilder = builder;

    // Step 1a: Set doctor
    const doctorResult = currentBuilder.withDoctor(doctorProfile?.id || "");
    if (!doctorResult.success) {
      setValidationError(doctorResult.error);
      return;
    }
    currentBuilder = doctorResult.data;

    // Step 1b: Set specialty
    if (!selectedSpecialtyId) {
      setValidationError("Please select a specialty");
      return;
    }
    const specialtyResult = currentBuilder.withSpecialty(selectedSpecialtyId);
    if (!specialtyResult.success) {
      setValidationError(specialtyResult.error);
      return;
    }
    currentBuilder = specialtyResult.data;

    // Step 1c: Set service
    if (!selectedServiceId) {
      setValidationError("Please select a service");
      return;
    }
    const serviceResult = currentBuilder.withService(selectedServiceId);
    if (!serviceResult.success) {
      setValidationError(serviceResult.error);
      return;
    }

    // Update builder in parent
    onBuilderUpdate(serviceResult.data);

    // Update UI state
    onUpdate({
      selectedSpecialtyId,
      selectedServiceId,
    });

    // Proceed to next step
    onNext();
  };

  return (
    <div className="space-y-6">
      {/* ... existing UI ... */}

      {/* Validation Error Display */}
      {validationError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-600">{validationError}</p>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex justify-between pt-6">
        <Button
          onClick={onBack}
          variant="outline"
          className="bg-gray-900 hover:bg-gray-800 text-white border-gray-900 px-8 h-12 rounded-lg"
        >
          Back
        </Button>
        <Button
          onClick={handleNext}
          className="bg-blue-500 hover:bg-blue-600 text-white px-8 h-12 rounded-lg"
        >
          Select Appointment Type
        </Button>
      </div>
    </div>
  );
};
```

**Example: DateTimeSelection.tsx**

```typescript
const handleNext = () => {
  setValidationError(null);

  if (!selectedDate || !selectedTimeSlot) {
    setValidationError("Please select both date and time");
    return;
  }

  // Extract start time from time slot
  const [startTime] = selectedTimeSlot.split(" - ");

  // Validate and update builder
  const dateTimeResult = builder.withDateTime(selectedDate, startTime);

  if (!dateTimeResult.success) {
    setValidationError(dateTimeResult.error);
    return;
  }

  // Update builder in parent
  onBuilderUpdate(dateTimeResult.data);

  // Update UI state
  onUpdate({
    selectedDate,
    selectedTimeSlot,
  });

  onNext();
};
```

**Example: BasicInformation.tsx**

```typescript
const handleNext = () => {
  setValidationError(null);

  let currentBuilder = builder;

  // Validate phone number
  const phoneResult = currentBuilder.withPhoneNumber(formData.phoneNumber);
  if (!phoneResult.success) {
    setValidationError(phoneResult.error);
    return;
  }
  currentBuilder = phoneResult.data;

  // Validate reason for visit
  const reasonsResult = currentBuilder.withReasons(formData.reasonForVisit);
  if (!reasonsResult.success) {
    setValidationError(reasonsResult.error);
    return;
  }

  // Update builder in parent
  onBuilderUpdate(reasonsResult.data);

  // Update UI state
  onUpdate({
    firstName: formData.firstName,
    lastName: formData.lastName,
    phoneNumber: formData.phoneNumber,
    email: formData.email,
    reasonForVisit: formData.reasonForVisit,
    symptoms: formData.symptoms,
    attachments,
  });

  onNext();
};
```

---

## Benefits of This Approach

### 1. **Immediate Validation**
```typescript
// ❌ Before: Error at the end
const request = convertBookingStateToRequest(state, doctorId);
// User completed 5 steps, then discovers phone is invalid

// ✅ After: Error at input
const result = builder.withPhoneNumber(phoneNumber);
if (!result.success) {
  alert(result.error); // Shows error immediately
}
```

### 2. **Type Safety**
```typescript
// ❌ Before: Can create invalid state
const state: BookingState = {}; // Compiles but incomplete

// ✅ After: Builder prevents invalid states
const request = builder.build();
if (!request.success) {
  // Tells you exactly what's missing
}
```

### 3. **Separation of Concerns**
```typescript
// UI state (React-specific)
const [bookingState, setBookingState] = useState<BookingState>({
  email: "user@example.com",       // UI only
  cardNumber: "1234...",            // UI only
  paymentMethod: PaymentMethod.VNPAY // UI only
});

// API state (Backend DTO)
const builder = createAppointmentRequestBuilder()
  .withDoctor(doctorId)
  .withPhoneNumber("0901234567")   // API field
  .withReasons("Chest pain");      // API field
```

### 4. **Testability**
```typescript
// Easy to test builder in isolation
describe("AppointmentRequestBuilder", () => {
  it("validates phone number format", () => {
    const builder = createAppointmentRequestBuilder();
    const result = builder.withPhoneNumber("invalid");

    expect(result.success).toBe(false);
    expect(result.error).toContain("10-15 digits");
  });

  it("prevents future dates", () => {
    const builder = createAppointmentRequestBuilder();
    const pastDate = new Date("2020-01-01");
    const result = builder.withDateTime(pastDate);

    expect(result.success).toBe(false);
    expect(result.error).toContain("must be in the future");
  });
});
```

### 5. **Backend Alignment**
```typescript
// Frontend builder
const request = createAppointmentRequestBuilder()
  .withDoctor(doctorId)
  .withSpecialty(specialtyId)
  .withService(serviceId)
  .withConsultationType(ConsultationType.VIDEO_CALL)
  .withDateTime(date, time)
  .withPhoneNumber(phone)
  .withReasons(reasons)
  .build();

// Backend builder (Java - similar pattern)
AppointmentRequest request = new AppointmentRequestBuilder()
  .withDoctor(doctorId)
  .withSpecialty(specialtyId)
  .withService(serviceId)
  .withConsultationType(ConsultationType.VIDEO_CALL)
  .withDateTime(dateTime)
  .withPhoneNumber(phone)
  .withReasons(reasons)
  .build();
```

---

## Migration Strategy

### Phase 1: Add Builder (No Breaking Changes)
1. ✅ Create `AppointmentRequestBuilder.ts`
2. Add builder to booking page alongside existing state
3. Don't change step components yet
4. Test builder in isolation

### Phase 2: Integrate Step-by-Step
1. Update Step 1 (Specialty) to use builder
2. Test thoroughly
3. Update Step 2 (Appointment Type)
4. Continue for remaining steps
5. Remove old `convertBookingStateToRequest()` function

### Phase 3: Cleanup
1. Remove unused fields from `BookingState`
2. Update documentation
3. Add unit tests for builder

---

## Alternative: If Builder is Too Complex

If the Builder pattern feels like overkill, consider these simpler alternatives:

### Option 2: Enhanced Current Approach
Keep `BookingState` but add step-by-step Zod validation:

```typescript
import { phoneNumberSchema, reasonsSchema } from "@/types/appointment";

const handleNext = () => {
  // Validate phone at step 4
  const phoneResult = phoneNumberSchema.safeParse(formData.phoneNumber);
  if (!phoneResult.success) {
    alert(phoneResult.error.errors[0].message);
    return;
  }

  // Continue to next step
  onUpdate({ phoneNumber: phoneResult.data });
  onNext();
};
```

### Option 3: useReducer Pattern
Replace `useState` with `useReducer` for centralized validation:

```typescript
type BookingAction =
  | { type: "SET_SPECIALTY"; specialtyId: number }
  | { type: "SET_SERVICE"; serviceId: number }
  | { type: "SET_PHONE"; phoneNumber: string };

function bookingReducer(state: BookingState, action: BookingAction): BookingState {
  switch (action.type) {
    case "SET_PHONE":
      const result = phoneNumberSchema.safeParse(action.phoneNumber);
      if (!result.success) {
        throw new Error(result.error.errors[0].message);
      }
      return { ...state, phoneNumber: result.data };
    // ... other cases
  }
}
```

---

## Recommendation

**Use Builder Pattern** because:
1. ✅ Your backend already uses it (consistency)
2. ✅ Sequential construction fits your 6-step wizard
3. ✅ Provides best validation and type safety
4. ✅ Easy to test and maintain
5. ✅ Scales well for future features

The implementation above provides a clean, maintainable solution that aligns with your backend architecture while leveraging React's strengths.
