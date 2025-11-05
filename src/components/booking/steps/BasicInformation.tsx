"use client";

import { useState, ChangeEvent } from "react";
import { BookingState } from "@/types/booking";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { AlertCircle } from "lucide-react";

interface BasicInformationProps {
  bookingState: BookingState;
  onUpdateAction: (updates: Partial<BookingState>) => void;
  onNextAction: () => void;
  onBackAction: () => void;
}

export const BasicInformation: React.FC<BasicInformationProps> = ({
  bookingState,
  onUpdateAction,
  onNextAction,
  onBackAction,
}) => {
  const [reasonForVisit, setReasonForVisit] = useState(
    bookingState.reasonForVisit || ""
  );
  const [phoneNumber, setPhoneNumber] = useState(
    bookingState.phoneNumber || ""
  );
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setReasonForVisit(value);
    // Clear error when user starts typing
    if (error) setError(null);
  };

  const handleNext = () => {
    if (!reasonForVisit.trim()) {
      setError("Please provide a reason for your visit");
      return;
    }

    if (reasonForVisit.trim().length < 10) {
      setError("Please provide more details (at least 10 characters)");
      return;
    }

    if (reasonForVisit.length > 500) {
      setError("Reason for visit must be less than 500 characters");
      return;
    }

    if (!phoneNumber.trim()) {
      setError("Please provide your phone number");
      return;
    }

    const phoneDigits = phoneNumber.replace(/\D/g, "");
    if (phoneDigits.length < 10 || phoneDigits.length > 15) {
      setError("Phone number must be 10-15 digits");
      return;
    }

    onUpdateAction({
      reasonForVisit: reasonForVisit.trim(),
      phoneNumber: phoneDigits,
    });
    onNextAction();
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Step Title */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Reason for Visit
        </h2>
        <p className="text-gray-600">
          Please describe the reason for your appointment
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="phoneNumber" className="text-base font-semibold text-gray-900">
            Phone Number <span className="text-red-500">*</span>
          </Label>
          <p className="text-sm text-gray-500 mt-1 mb-3">
            We'll use this number to contact you about your appointment
          </p>
          <Input
            id="phoneNumber"
            name="phoneNumber"
            type="tel"
            value={phoneNumber}
            onChange={(e) => {
              setPhoneNumber(e.target.value);
              if (error) setError(null);
            }}
            placeholder="0123456789"
            className={`mt-2 text-base ${
              error && error.includes("phone") ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""
            }`}
            maxLength={15}
          />
          <p className="text-xs text-gray-500 mt-2">
            Format: 10-15 digits
          </p>
        </div>

        <div>
          <Label htmlFor="reasonForVisit" className="text-base font-semibold text-gray-900">
            Reason for Visit <span className="text-red-500">*</span>
          </Label>
          <p className="text-sm text-gray-500 mt-1 mb-3">
            Briefly describe your symptoms, concerns, or the purpose of this appointment
          </p>
          <Textarea
            id="reasonForVisit"
            name="reasonForVisit"
            value={reasonForVisit}
            onChange={handleInputChange}
            placeholder="Briefly describe your reason for the visit..."
            className={`mt-2 min-h-[150px] text-base ${
              error && !error.includes("phone") ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""
            }`}
            maxLength={500}
          />
          <div className="flex justify-between items-center mt-2">
            <span className="text-xs text-gray-500">
              Minimum 10 characters
            </span>
            <span className={`text-xs ${
              reasonForVisit.length > 450 ? "text-red-500 font-semibold" : "text-gray-500"
            }`}>
              {reasonForVisit.length}/500 characters
            </span>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="flex items-start gap-2 p-4 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Helper Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-blue-900 mb-2">💡 Tips for a better appointment:</h4>
          <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
            <li>Mention your main symptoms or concerns</li>
            <li>Include when symptoms started</li>
            <li>Note any relevant medical history</li>
            <li>List any questions you want to ask the doctor</li>
          </ul>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between pt-8">
        <Button
          onClick={onBackAction}
          variant="outline"
          className="bg-gray-900 hover:bg-gray-800 text-white border-gray-900 px-8 h-12 rounded-lg"
        >
          Back
        </Button>
        <Button
          onClick={handleNext}
          disabled={!reasonForVisit.trim() || reasonForVisit.trim().length < 10 || !phoneNumber.trim()}
          className="bg-blue-500 hover:bg-blue-600 text-white px-8 h-12 rounded-lg disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          Continue to Payment
        </Button>
      </div>
    </div>
  );
};
