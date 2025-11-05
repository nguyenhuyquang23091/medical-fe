"use client";

import { useState } from "react";
import { DoctorProfileResponse } from "@/types/doctorProfile";
import { BookingState, ConsultationType, ClinicLocation } from "@/types/booking";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Video,
  Building2,
  Check,
  MapPin,
} from "lucide-react";
import { mockClinicLocations } from "@/lib/mock/bookingData";

interface AppointmentTypeSelectionProps {
  doctorProfile: DoctorProfileResponse | null;
  bookingState: BookingState;
  onUpdateAction: (updates: Partial<BookingState>) => void;
  onNextAction: () => void;
  onBackAction: () => void;
}

const appointmentTypes = [
  {
    type: ConsultationType.IN_PERSON,
    label: "In-Person Visit",
    icon: Building2,
    description: "Visit doctor at clinic",
  },
  {
    type: ConsultationType.VIDEO_CALL,
    label: "Video Call",
    icon: Video,
    description: "Online video consultation",
  },
];

export const AppointmentTypeSelection: React.FC<AppointmentTypeSelectionProps> = ({
  doctorProfile,
  bookingState,
  onUpdateAction,
  onNextAction,
  onBackAction,
}) => {
  const [selectedType, setSelectedType] = useState<ConsultationType | undefined>(
    bookingState.consultationType
  );
  const [selectedClinic, setSelectedClinic] = useState<string | undefined>(
    bookingState.selectedClinicId
  );

  const handleNext = () => {
    if (!selectedType) {
      alert("Please select an appointment type");
      return;
    }

    if (selectedType === ConsultationType.IN_PERSON && !selectedClinic) {
      alert("Please select a clinic location");
      return;
    }

    onUpdateAction({
      consultationType: selectedType,
      selectedClinicId: selectedType === ConsultationType.IN_PERSON ? selectedClinic : undefined,
    });
    onNextAction();
  };

  return (
      <div className="space-y-6">
        {/* Step Title */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Choose Appointment Type
          </h2>
          <p className="text-gray-600">
            Select how you'd like to consult with the doctor
          </p>
        </div>

        {/* Appointment Type Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
          {appointmentTypes.map((type) => {
            const Icon = type.icon;
            const isSelected = selectedType === type.type;

            return (
              <button
                key={type.type}
                onClick={() => setSelectedType(type.type)}
                className={`relative p-4 border-2 rounded-lg transition-all ${
                  isSelected
                    ? "border-blue-600 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300 bg-white"
                }`}
              >
                <div className="flex flex-col items-center gap-2">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      isSelected
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="text-center">
                    <p className="font-semibold text-sm text-gray-900">
                      {type.label}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {type.description}
                    </p>
                  </div>
                </div>

                {/* Checkmark */}
                {isSelected && (
                  <div className="absolute top-2 right-2 flex items-center justify-center w-5 h-5 bg-blue-600 rounded-full">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Clinic Selection (shown only when In-Person Visit is selected) */}
        {selectedType === ConsultationType.IN_PERSON && (
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">
              Select Clinic Location <span className="text-red-500">*</span>
            </h3>
            <div className="space-y-3">
              {mockClinicLocations.map((clinic) => (
                <div
                  key={clinic.clinicId}
                  onClick={() => setSelectedClinic(clinic.clinicId)}
                  className={`relative p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    selectedClinic === clinic.clinicId
                      ? "border-blue-600 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300 bg-white"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">
                        {clinic.name}
                      </h4>
                      <p className="text-sm text-gray-600 mt-1 flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {clinic.address}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {clinic.distance} away
                      </p>
                    </div>

                    {/* Checkmark */}
                    {selectedClinic === clinic.clinicId && (
                      <div className="flex items-center justify-center w-6 h-6 bg-blue-600 rounded-full">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between pt-6">
          <Button
            onClick={onBackAction}
            variant="outline"
            className="bg-gray-900 hover:bg-gray-800 text-white border-gray-900 px-8 h-12 rounded-lg"
          >
            Back
          </Button>
          <Button
            onClick={handleNext}
            disabled={!selectedType || (selectedType === ConsultationType.IN_PERSON && !selectedClinic)}
            className="bg-blue-500 hover:bg-blue-600 text-white px-8 h-12 rounded-lg disabled:bg-gray-400"
          >
            Select Date & Time
          </Button>
        </div>
      </div>
  );
};
