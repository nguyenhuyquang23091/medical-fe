"use client";

import { useState } from "react";
import { DoctorProfileResponse } from "@/types/doctorProfile";
import { BookingState } from "@/types/booking";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Check } from "lucide-react";

interface SpecialtySelectionProps {
  doctorProfile: DoctorProfileResponse | null;
  bookingState: BookingState;
  onUpdateAction: (updates: Partial<BookingState>) => void;
  onNextAction: () => void;
  onBackAction?: () => void;
}

export const SpecialtySelection: React.FC<SpecialtySelectionProps> = ({
  doctorProfile,
  bookingState,
  onUpdateAction,
  onNextAction,
  onBackAction,
}) => {
  // Use relationshipId for API submission (stored in bookingState)
  const [selectedSpecialtyRelationshipId, setSelectedSpecialtyRelationshipId] = useState<number | undefined>(
    bookingState.selectedSpecialtyId
  );
  const [selectedServiceRelationshipId, setSelectedServiceRelationshipId] = useState<number | undefined>(
    bookingState.selectedServiceId
  );

  const specialties = doctorProfile?.specialties || [];
  const services = doctorProfile?.services || [];

  // Format VND currency
  const formatVND = (amount: number): string => {
    return amount.toLocaleString('vi-VN') + '₫';
  };

  const handleNext = () => {
    if (!selectedSpecialtyRelationshipId || !selectedServiceRelationshipId) {
      alert("Please select both a specialty and a service");
      return;
    }

    // Store relationshipId for appointment creation
    onUpdateAction({
      selectedSpecialtyId: selectedSpecialtyRelationshipId,
      selectedServiceId: selectedServiceRelationshipId,
    });
    onNextAction();
  };

  return (
    <div className="space-y-6">
      {/* Specialty Dropdown */}
      <div>
        <label className="block text-base font-semibold text-gray-900 mb-3">
          Select Specialty <span className="text-red-500">*</span>
        </label>
        <Select
          value={selectedSpecialtyRelationshipId?.toString()}
          onValueChange={(value) => setSelectedSpecialtyRelationshipId(Number(value))}
        >
          <SelectTrigger className="w-full h-12 text-base">
            <SelectValue placeholder="Choose a specialty..." />
          </SelectTrigger>
          <SelectContent>
            {specialties.length === 0 && (
              <div className="px-2 py-4 text-sm text-gray-500 text-center">
                No specialties available
                <div className="text-xs text-gray-400 mt-1">
                  {doctorProfile ? "Specialties data is empty" : "Doctor profile is still loading"}
                </div>
              </div>
            )}
            {specialties.map((specialty) => (
              <SelectItem
                key={specialty.relationshipId}
                value={specialty.relationshipId.toString()}
              >
                {specialty.specialty?.name || "Unknown Specialty"}
                {specialty.isPrimary && (
                  <span className="ml-2 text-xs text-blue-600">(Primary)</span>
                )}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Services Grid */}
      <div>
        <h3 className="text-base font-semibold text-gray-900 mb-4">
          Services <span className="text-red-500">*</span>
        </h3>
        {services.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <p className="text-gray-500">No services available for this doctor</p>
            <p className="text-sm text-gray-400 mt-2">
              {doctorProfile ? "Services data is empty" : "Doctor profile is still loading"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {services.map((service) => (
              <div
                key={service.relationshipId}
                onClick={() => setSelectedServiceRelationshipId(service.relationshipId)}
                className={`relative p-6 border-2 rounded-lg cursor-pointer transition-all ${
                  selectedServiceRelationshipId === service.relationshipId
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300 bg-white"
                }`}
              >
                {/* Checkmark icon */}
                {selectedServiceRelationshipId === service.relationshipId && (
                  <div className="absolute top-3 right-3 flex items-center justify-center w-6 h-6 bg-blue-500 rounded">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                )}

                {/* Service name */}
                <h4 className="font-medium text-gray-900 mb-2">
                  {service.service?.name || "Unknown Service"}
                </h4>

                {/* Service price in VND */}
                <p className="text-sm font-semibold text-teal-600">
                  {formatVND(service.price)}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

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
          disabled={!selectedSpecialtyRelationshipId || !selectedServiceRelationshipId}
          className="bg-blue-500 hover:bg-blue-600 text-white px-8 h-12 rounded-lg disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          Select Appointment Type
        </Button>
      </div>
    </div>
  );
};
