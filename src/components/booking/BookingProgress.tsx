"use client";

import { BookingStep } from "@/types/booking";
import { Check } from "lucide-react";

interface BookingProgressProps {
  currentStep: BookingStep;
}

const steps = [
  { number: 1, label: "Specialty" },
  { number: 2, label: "Appointment Type" },
  { number: 3, label: "Date & Time" },
  { number: 4, label: "Basic Information" },
  { number: 5, label: "Payment" },
  { number: 6, label: "Confirmation" },
];

export const BookingProgress: React.FC<BookingProgressProps> = ({
  currentStep,
}) => {
  return (
    <div className="relative py-4">
      {/* Progress Bar Background */}
      <div className="absolute top-8 left-0 w-full h-0.5 bg-gray-200">
        {/* Progress Bar Fill - hidden as design shows discrete steps */}
        <div
          className="h-full bg-blue-500 transition-all duration-500"
          style={{
            width: `${((currentStep - 1) / (steps.length - 1)) * 100}%`,
          }}
        />
      </div>

      {/* Steps */}
      <div className="relative flex justify-between">
        {steps.map((step) => {
          const isCompleted = currentStep > step.number;
          const isCurrent = currentStep === step.number;

          return (
            <div key={step.number} className="flex flex-col items-center flex-1">
              {/* Step Circle */}
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-medium text-sm transition-all duration-300 z-10 ${
                  isCompleted
                    ? "bg-blue-500 text-white border-2 border-blue-500"
                    : isCurrent
                    ? "bg-blue-500 text-white border-2 border-blue-500"
                    : "bg-gray-100 text-gray-400 border-2 border-gray-200"
                }`}
              >
                {isCompleted ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <span>{step.number}</span>
                )}
              </div>

              {/* Step Label */}
              <span
                className={`mt-3 text-xs md:text-sm font-medium text-center max-w-[100px] leading-tight ${
                  isCurrent ? "text-blue-500" : "text-gray-500"
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
