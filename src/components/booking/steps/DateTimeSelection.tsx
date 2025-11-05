"use client";

import { useState } from "react";
import { DoctorProfileResponse } from "@/types/doctorProfile";
import { BookingState, TimeSlot, TimeSlotPeriod } from "@/types/booking";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Check, Clock } from "lucide-react";
import { format } from "date-fns";

interface DateTimeSelectionProps {
  doctorProfile: DoctorProfileResponse | null;
  bookingState: BookingState;
  onUpdateAction: (updates: Partial<BookingState>) => void;
  onNextAction: () => void;
  onBackAction: () => void;
}

// Mock time slots - replace with actual API call
const mockTimeSlots: TimeSlot[] = [
  // Morning
  { id: "1", startTime: "08:00", endTime: "09:00", period: TimeSlotPeriod.MORNING, isAvailable: true },
  { id: "2", startTime: "09:00", endTime: "10:00", period: TimeSlotPeriod.MORNING, isAvailable: true },
  { id: "3", startTime: "10:00", endTime: "11:00", period: TimeSlotPeriod.MORNING, isAvailable: false },
  { id: "4", startTime: "11:00", endTime: "12:00", period: TimeSlotPeriod.MORNING, isAvailable: true },
  // Afternoon
  { id: "5", startTime: "13:00", endTime: "14:00", period: TimeSlotPeriod.AFTERNOON, isAvailable: true },
  { id: "6", startTime: "14:00", endTime: "15:00", period: TimeSlotPeriod.AFTERNOON, isAvailable: true },
  { id: "7", startTime: "15:00", endTime: "16:00", period: TimeSlotPeriod.AFTERNOON, isAvailable: false },
  { id: "8", startTime: "16:00", endTime: "17:00", period: TimeSlotPeriod.AFTERNOON, isAvailable: true },
  // Evening
  { id: "9", startTime: "17:00", endTime: "18:00", period: TimeSlotPeriod.EVENING, isAvailable: true },
  { id: "10", startTime: "18:00", endTime: "19:00", period: TimeSlotPeriod.EVENING, isAvailable: true },
  { id: "11", startTime: "19:00", endTime: "20:00", period: TimeSlotPeriod.EVENING, isAvailable: false },
];

export const DateTimeSelection: React.FC<DateTimeSelectionProps> = ({
  doctorProfile,
  bookingState,
  onUpdateAction,
  onNextAction,
  onBackAction,
}) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    bookingState.selectedDate
  );
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | undefined>(
    bookingState.selectedTimeSlot
  );

  const handleNext = () => {
    if (!selectedDate || !selectedTimeSlot) {
      alert("Please select both date and time slot");
      return;
    }

    // Find the selected slot and format the time properly
    const selectedSlot = mockTimeSlots.find((slot) => slot.id === selectedTimeSlot);
    if (!selectedSlot) {
      alert("Invalid time slot selected");
      return;
    }

    // Format time slot as "HH:mm - HH:mm" for the conversion function
    const formattedTimeSlot = `${selectedSlot.startTime} - ${selectedSlot.endTime}`;

    onUpdateAction({
      selectedDate,
      selectedTimeSlot: formattedTimeSlot,
    });
    onNextAction();
  };

  const selectedSlot = mockTimeSlots.find((slot) => slot.id === selectedTimeSlot);
  // Find service by relationshipId (not serviceId)
  const selectedService = doctorProfile?.services?.find(
    (s) => s.relationshipId === bookingState.selectedServiceId
  );

  const groupedSlots = {
    [TimeSlotPeriod.MORNING]: mockTimeSlots.filter(
      (slot) => slot.period === TimeSlotPeriod.MORNING
    ),
    [TimeSlotPeriod.AFTERNOON]: mockTimeSlots.filter(
      (slot) => slot.period === TimeSlotPeriod.AFTERNOON
    ),
    [TimeSlotPeriod.EVENING]: mockTimeSlots.filter(
      (slot) => slot.period === TimeSlotPeriod.EVENING
    ),
  };

  return (
      <div className="space-y-6">
        {/* Step Title */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Select Date & Time
          </h2>
          <p className="text-gray-600">
            Choose your preferred appointment date and time
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Calendar */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Select Date <span className="text-red-500">*</span>
            </label>
            <div className="border border-gray-200 rounded-lg p-4">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                disabled={(date) => date < new Date() || date > new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)}
                className="rounded-md"
              />
            </div>
          </div>

          {/* Time Slots */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Select Time <span className="text-red-500">*</span>
            </label>
            {!selectedDate ? (
              <div className="flex items-center justify-center h-full bg-gray-50 border border-gray-200 rounded-lg p-6">
                <p className="text-gray-500 text-center">
                  Please select a date first
                </p>
              </div>
            ) : (
              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                {/* Morning Slots */}
                <div>
                  <h4 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <span>🌅</span> Morning
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    {groupedSlots[TimeSlotPeriod.MORNING].map((slot) => (
                      <button
                        key={slot.id}
                        onClick={() => slot.isAvailable && setSelectedTimeSlot(slot.id)}
                        disabled={!slot.isAvailable}
                        className={`relative p-3 border-2 rounded-lg text-sm font-medium transition-all ${
                          selectedTimeSlot === slot.id
                            ? "border-blue-600 bg-blue-50 text-blue-700"
                            : slot.isAvailable
                            ? "border-gray-200 hover:border-blue-300 bg-white text-gray-700"
                            : "border-gray-100 bg-gray-50 text-gray-400 cursor-not-allowed"
                        }`}
                      >
                        {slot.startTime} - {slot.endTime}
                        {selectedTimeSlot === slot.id && (
                          <Check className="absolute top-1 right-1 w-4 h-4 text-blue-600" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Afternoon Slots */}
                <div>
                  <h4 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <span>☀️</span> Afternoon
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    {groupedSlots[TimeSlotPeriod.AFTERNOON].map((slot) => (
                      <button
                        key={slot.id}
                        onClick={() => slot.isAvailable && setSelectedTimeSlot(slot.id)}
                        disabled={!slot.isAvailable}
                        className={`relative p-3 border-2 rounded-lg text-sm font-medium transition-all ${
                          selectedTimeSlot === slot.id
                            ? "border-blue-600 bg-blue-50 text-blue-700"
                            : slot.isAvailable
                            ? "border-gray-200 hover:border-blue-300 bg-white text-gray-700"
                            : "border-gray-100 bg-gray-50 text-gray-400 cursor-not-allowed"
                        }`}
                      >
                        {slot.startTime} - {slot.endTime}
                        {selectedTimeSlot === slot.id && (
                          <Check className="absolute top-1 right-1 w-4 h-4 text-blue-600" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Evening Slots */}
                <div>
                  <h4 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <span>🌙</span> Evening
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    {groupedSlots[TimeSlotPeriod.EVENING].map((slot) => (
                      <button
                        key={slot.id}
                        onClick={() => slot.isAvailable && setSelectedTimeSlot(slot.id)}
                        disabled={!slot.isAvailable}
                        className={`relative p-3 border-2 rounded-lg text-sm font-medium transition-all ${
                          selectedTimeSlot === slot.id
                            ? "border-blue-600 bg-blue-50 text-blue-700"
                            : slot.isAvailable
                            ? "border-gray-200 hover:border-blue-300 bg-white text-gray-700"
                            : "border-gray-100 bg-gray-50 text-gray-400 cursor-not-allowed"
                        }`}
                      >
                        {slot.startTime} - {slot.endTime}
                        {selectedTimeSlot === slot.id && (
                          <Check className="absolute top-1 right-1 w-4 h-4 text-blue-600" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Booking Info Summary */}
        {selectedDate && selectedSlot && selectedService && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-600" />
              Booking Information
            </h4>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Service</p>
                <p className="font-medium text-gray-900">{selectedService.service?.name || "Unknown Service"}</p>
              </div>
              <div>
                <p className="text-gray-600">Date</p>
                <p className="font-medium text-gray-900">{format(selectedDate, "PPP")}</p>
              </div>
              <div>
                <p className="text-gray-600">Time</p>
                <p className="font-medium text-gray-900">
                  {selectedSlot.startTime} - {selectedSlot.endTime}
                </p>
              </div>
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
            disabled={!selectedDate || !selectedTimeSlot}
            className="bg-blue-500 hover:bg-blue-600 text-white px-8 h-12 rounded-lg disabled:bg-gray-400"
          >
            Add Basic Information
          </Button>
        </div>
      </div>
  );
};
