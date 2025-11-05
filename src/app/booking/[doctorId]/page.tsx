"use client";

import { useState, useEffect } from "react";
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

export default function BookingPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const doctorId = params.doctorId as string;

  const [currentStep, setCurrentStep] = useState<BookingStep>(
    BookingStep.SPECIALTY_SELECTION
  );
  const [bookingState, setBookingState] = useState<BookingState>({});
  const [doctorProfile, setDoctorProfile] =
    useState<DoctorProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Stable reference to access token to prevent unnecessary re-renders
  const accessToken = session?.accessToken;

  // Fetch doctor profile function (can be called for retry)
  const fetchDoctorProfile = async () => {
    try {
      setLoading(true);
      setError(null);

        // Wait for session to be determined
        if (status === "loading") {
          return;
        }

        if (status === "unauthenticated") {
          console.error("User is not authenticated");
          setError("Please log in to book an appointment");
          setLoading(false);
          return;
        }

        if (!accessToken) {
          console.error("No access token available");
          setError("Authentication error. Please try logging in again.");
          setLoading(false);
          return;
        }

        if (!doctorId || doctorId === "undefined") {
          console.error("Invalid doctor ID");
          setError("Invalid doctor ID provided");
          setLoading(false);
          return;
        }

        // Import profile service dynamically
        const profileService = (await import("@/actions/profile/profile")).default;

        // Fetch real doctor profile from backend
        const profile = await profileService.getOneDoctorProfile(doctorId, accessToken);
        setDoctorProfile(profile);

      } catch (error) {
        console.error("❌ Error fetching doctor profile:", error);
        setError("Failed to load doctor information. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Load doctor profile on mount
  useEffect(() => {
    // Only fetch when we have a determined session status
    if (status !== "loading") {
      fetchDoctorProfile();
    }
  }, [doctorId, accessToken, status]); // Only depend on access token, not entire session object

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

  const renderStep = () => {
    switch (currentStep) {
      case BookingStep.SPECIALTY_SELECTION:
        return (
          <SpecialtySelection
            doctorProfile={doctorProfile}
            bookingState={bookingState}
            onUpdateAction={handleStepUpdate}
            onNextAction={handleNext}
            onBackAction={handleBack}
          />
        );
      case BookingStep.APPOINTMENT_TYPE:
        return (
          <AppointmentTypeSelection
            doctorProfile={doctorProfile}
            bookingState={bookingState}
            onUpdateAction={handleStepUpdate}
            onNextAction={handleNext}
            onBackAction={handleBack}
          />
        );
      case BookingStep.DATE_TIME:
        return (
          <DateTimeSelection
            doctorProfile={doctorProfile}
            bookingState={bookingState}
            onUpdateAction={handleStepUpdate}
            onNextAction={handleNext}
            onBackAction={handleBack}
          />
        );
      case BookingStep.BASIC_INFO:
        return (
          <BasicInformation
            bookingState={bookingState}
            onUpdateAction={handleStepUpdate}
            onNextAction={handleNext}
            onBackAction={handleBack}
          />
        );
      case BookingStep.PAYMENT:
        return (
          <PaymentGateway
            bookingState={bookingState}
            doctorProfile={doctorProfile}
            onUpdateAction={handleStepUpdate}
            onNextAction={handleNext}
            onBackAction={handleBack}
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

  if (loading || status === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">
            {status === "loading" ? "Authenticating..." : "Loading doctor information..."}
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <div className="p-6 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Booking Error</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => fetchDoctorProfile()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Try Again
              </button>
              <button
                onClick={() => router.push("/search")}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Back to Search
              </button>
            </div>
          </div>
        </Card>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Progress Indicator */}
        <div className="mb-8">
          <BookingProgress currentStep={currentStep} />
        </div>

        {/* Doctor Info Header - Always visible except on confirmation */}
        {currentStep !== BookingStep.CONFIRMATION && doctorProfile && (
          <div className="mb-6">
            <DoctorInfoHeader doctor={doctorProfile} />
          </div>
        )}

        {/* Step Content */}
        <Card className="bg-white border border-gray-200 rounded-xl p-6 md:p-8">
          {renderStep()}
        </Card>
      </div>
    </div>
  );
}
