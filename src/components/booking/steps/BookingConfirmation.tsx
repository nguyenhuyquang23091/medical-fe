"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { DoctorProfileResponse } from "@/types/doctorProfile";
import { BookingState } from "@/types/booking";
import { 
  PaymentState, 
  PaymentStatus, 
  PaymentUpdateEvent,
  PaymentStatusEvent,
  PaymentSuccessEvent,
  PaymentFailureEvent,
  getPaymentStatusDisplay,
  isPaymentStatusFinal,
  isPaymentStatusSuccess
} from "@/types/payment";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  CheckCircle,
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Phone,
  Download,
  Share2,
  AlertCircle,
  Loader2,
  XCircle,
  RefreshCw,
} from "lucide-react";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { useSocket } from "@/hooks/useSocket";

interface BookingConfirmationStepProps {
  doctorProfile: DoctorProfileResponse | null;
  bookingState: BookingState;
}

export const BookingConfirmationStep: React.FC<BookingConfirmationStepProps> = ({
  doctorProfile,
  bookingState,
}) => {
  const router = useRouter();
  const { data: session } = useSession();
  
  // Payment state management
  const [paymentState, setPaymentState] = useState<PaymentState>({
    status: PaymentStatus.PENDING,
    message: "Waiting for payment confirmation...",
    isLoading: true,
    lastUpdated: new Date().toISOString(),
  });

  // Socket connection for payment updates
  const socket = useSocket({ 
    sockets: 'payments', 
    autoConnect: true,
    debug: false 
  });

  // Find service by relationshipId (not serviceId)
  const selectedService = doctorProfile?.services?.find(
    (s) => s.relationshipId === bookingState.selectedServiceId
  );

  // Payment event handlers
  const handlePaymentUpdate = useCallback((data: PaymentUpdateEvent) => {
    console.log("💳 Payment update received:", data);
    
    // Only process events for this appointment
    if (data.appointmentId && data.appointmentId !== bookingState.appointmentId) {
      return;
    }
    
    setPaymentState(prev => ({
      ...prev,
      status: data.status,
      message: data.message,
      transactionId: data.transactionId,
      amount: data.amount,
      currency: data.currency,
      paymentMethod: data.paymentMethod,
      isLoading: !isPaymentStatusFinal(data.status),
      lastUpdated: new Date().toISOString(),
    }));
  }, [bookingState.appointmentId]);

  const handlePaymentStatus = useCallback((data: PaymentStatusEvent) => {
    console.log("💳 Payment status received:", data);
    
    // Only process events for this appointment
    if (data.appointmentId && data.appointmentId !== bookingState.appointmentId) {
      return;
    }
    
    setPaymentState(prev => ({
      ...prev,
      status: data.status,
      message: data.message,
      transactionId: data.transactionId,
      amount: data.amount,
      currency: data.currency,
      paymentMethod: data.paymentMethod,
      errorDetails: data.details?.errorCode ? {
        errorCode: data.details.errorCode,
        errorMessage: data.details.gatewayResponse || data.message,
        failureReason: data.message,
      } : undefined,
      isLoading: !isPaymentStatusFinal(data.status),
      lastUpdated: new Date().toISOString(),
    }));
  }, [bookingState.appointmentId]);

  const handlePaymentSuccess = useCallback((data: PaymentSuccessEvent) => {
    console.log("✅ Payment success received:", data);
    
    // Only process events for this appointment
    if (data.appointmentId && data.appointmentId !== bookingState.appointmentId) {
      return;
    }
    
    setPaymentState(prev => ({
      ...prev,
      status: data.status,
      message: data.message,
      transactionId: data.transactionId,
      confirmationNumber: data.confirmationNumber,
      receiptUrl: data.receiptUrl,
      completedAt: data.completedAt,
      amount: data.amount,
      currency: data.currency,
      paymentMethod: data.paymentMethod,
      isLoading: false,
      lastUpdated: new Date().toISOString(),
    }));
  }, [bookingState.appointmentId]);

  const handlePaymentFailure = useCallback((data: PaymentFailureEvent) => {
    console.log("❌ Payment failure received:", data);
    
    // Only process events for this appointment
    if (data.appointmentId && data.appointmentId !== bookingState.appointmentId) {
      return;
    }
    
    setPaymentState(prev => ({
      ...prev,
      status: data.status,
      message: data.message,
      transactionId: data.transactionId,
      errorDetails: data.errorDetails,
      failedAt: data.failedAt,
      amount: data.amount,
      currency: data.currency,
      paymentMethod: data.paymentMethod,
      isLoading: false,
      lastUpdated: new Date().toISOString(),
    }));
  }, [bookingState.appointmentId]);

  // Subscribe to payment events
  useEffect(() => {
    if (!socket.isPaymentConnected) {
      console.log("⚠️ Payment socket not connected, attempting to connect...");
      socket.connectPayments();
      return;
    }

    console.log("🔌 Setting up payment event listeners...");

    // Subscribe to all payment events
    const unsubscribeUpdate = socket.subscribeToPaymentUpdates(handlePaymentUpdate);
    const unsubscribeStatus = socket.subscribeToPaymentStatus(handlePaymentStatus);
    const unsubscribeSuccess = socket.subscribeToPaymentSuccess(handlePaymentSuccess);
    const unsubscribeFailure = socket.subscribeToPaymentFailure(handlePaymentFailure);

    // Cleanup function
    return () => {
      console.log("🧹 Cleaning up payment event listeners...");
      unsubscribeUpdate?.();
      unsubscribeStatus?.();
      unsubscribeSuccess?.();
      unsubscribeFailure?.();
    };
  }, [
    socket.isPaymentConnected,
    socket.connectPayments,
    socket.subscribeToPaymentUpdates,
    socket.subscribeToPaymentStatus,
    socket.subscribeToPaymentSuccess,
    socket.subscribeToPaymentFailure,
    handlePaymentUpdate,
    handlePaymentStatus,
    handlePaymentSuccess,
    handlePaymentFailure,
  ]);

  // Initialize payment state from booking state
  useEffect(() => {
    if (bookingState.appointmentId && selectedService) {
      setPaymentState(prev => ({
        ...prev,
        appointmentId: bookingState.appointmentId,
        amount: selectedService.price,
        currency: selectedService.currency,
      }));
    }
  }, [bookingState.appointmentId, selectedService]);

  const handleBackToBookings = () => {
    router.push("/appointments");
  };

  const handleStartNewBooking = () => {
    router.push("/search");
  };

  const handleRetryPayment = () => {
    // Reset payment state to pending and trigger retry
    setPaymentState(prev => ({
      ...prev,
      status: PaymentStatus.PENDING,
      message: "Retrying payment...",
      isLoading: true,
      errorDetails: undefined,
      lastUpdated: new Date().toISOString(),
    }));
    
    // TODO: Implement payment retry logic
    // This would typically involve calling the payment service again
    console.log("🔄 Retrying payment for appointment:", bookingState.appointmentId);
  };

  const handleAddToCalendar = () => {
    // TODO: Implement calendar integration
    alert("Calendar integration coming soon!");
  };

  const handleDownloadReceipt = () => {
    if (paymentState.receiptUrl) {
      window.open(paymentState.receiptUrl, '_blank');
    } else {
      // TODO: Generate receipt from payment data
      alert("Receipt download coming soon!");
    }
  };

  const handleShare = () => {
    // TODO: Implement share functionality
    alert("Share functionality coming soon!");
  };

  // Get payment status display configuration
  const paymentDisplay = getPaymentStatusDisplay(paymentState.status);
  const isPaymentSuccess = isPaymentStatusSuccess(paymentState.status);
  const showPaymentStatus = bookingState.appointmentId; // Only show if we have an appointment ID

  return (
    <div className="max-w-3xl mx-auto">
      {/* Real-time Payment Status Banner */}
      {showPaymentStatus && (
        <Card className={`border-2 rounded-lg p-6 mb-6 ${
          paymentDisplay.color === 'green' 
            ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200'
            : paymentDisplay.color === 'yellow'
            ? 'bg-gradient-to-br from-yellow-50 to-amber-50 border-yellow-200'
            : paymentDisplay.color === 'red'
            ? 'bg-gradient-to-br from-red-50 to-rose-50 border-red-200'
            : 'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200'
        }`}>
          <div className="flex items-start gap-4">
            {/* Status Icon */}
            <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${
              paymentDisplay.color === 'green' 
                ? 'bg-green-500'
                : paymentDisplay.color === 'yellow'
                ? 'bg-yellow-500'
                : paymentDisplay.color === 'red'
                ? 'bg-red-500'
                : 'bg-blue-500'
            }`}>
              {paymentDisplay.icon === 'success' && <CheckCircle className="w-6 h-6 text-white" />}
              {paymentDisplay.icon === 'pending' && <Clock className="w-6 h-6 text-white" />}
              {paymentDisplay.icon === 'processing' && <Loader2 className="w-6 h-6 text-white animate-spin" />}
              {paymentDisplay.icon === 'error' && <XCircle className="w-6 h-6 text-white" />}
            </div>
            
            {/* Status Content */}
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {paymentDisplay.title}
              </h3>
              <p className="text-gray-700 mb-3">
                {paymentState.message}
              </p>
              
              {/* Payment Details */}
              {paymentState.transactionId && (
                <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-3">
                  <span>
                    <strong>Transaction ID:</strong> {paymentState.transactionId}
                  </span>
                  {paymentState.confirmationNumber && (
                    <span>
                      <strong>Confirmation:</strong> {paymentState.confirmationNumber}
                    </span>
                  )}
                  {paymentState.amount && (
                    <span>
                      <strong>Amount:</strong> {paymentState.amount.toLocaleString('vi-VN')} {paymentState.currency}
                    </span>
                  )}
                </div>
              )}
              
              {/* Error Details */}
              {paymentState.errorDetails && (
                <div className="bg-red-100 border border-red-200 rounded-lg p-3 mb-3">
                  <p className="text-sm text-red-800">
                    <strong>Error:</strong> {paymentState.errorDetails.errorMessage}
                  </p>
                  {paymentState.errorDetails.errorCode && (
                    <p className="text-xs text-red-600 mt-1">
                      Code: {paymentState.errorDetails.errorCode}
                    </p>
                  )}
                </div>
              )}
              
              {/* Action Buttons */}
              <div className="flex gap-3">
                {paymentDisplay.showRetry && (
                  <Button
                    onClick={handleRetryPayment}
                    disabled={paymentState.isLoading}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Retry Payment
                  </Button>
                )}
                {paymentDisplay.showReceipt && paymentState.receiptUrl && (
                  <Button
                    onClick={handleDownloadReceipt}
                    variant="outline"
                    className="border-green-300 text-green-700 hover:bg-green-50"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download Receipt
                  </Button>
                )}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Success Message - Only show if payment is successful or no payment tracking */}
      {(!showPaymentStatus || isPaymentSuccess) && (
        <Card className="bg-gradient-to-br from-green-50 to-teal-50 border-2 border-green-200 rounded-lg p-8 mb-6">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center">
                <CheckCircle className="w-12 h-12 text-white" />
              </div>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Booking Confirmed!
            </h2>
            <p className="text-lg text-gray-700 mb-4">
              Your appointment has been successfully scheduled with{" "}
              <span className="font-semibold">
                Dr. {doctorProfile?.firstName} {doctorProfile?.lastName}
              </span>
            </p>
            <div className="inline-flex items-center gap-2 bg-white border border-green-300 rounded-lg px-6 py-3">
              <span className="text-sm text-gray-600">Booking Reference:</span>
              <span className="text-lg font-bold text-green-600">
                {bookingState.bookingReferenceNumber || "N/A"}
              </span>
            </div>
          </div>
        </Card>
      )}

      {/* Appointment Details */}
      <Card className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">
          Appointment Details
        </h3>

        {/* Doctor Info */}
        <div className="flex items-center gap-4 pb-4 mb-4 border-b border-gray-200">
          <Avatar className="w-16 h-16 border-2 border-gray-200">
            <AvatarImage
              src={doctorProfile?.avatar || undefined}
              alt={`${doctorProfile?.firstName} ${doctorProfile?.lastName}` || "Doctor"}
            />
            <AvatarFallback className="text-xl bg-gradient-to-br from-blue-400 to-blue-600 text-white">
              {doctorProfile?.firstName?.charAt(0) || "D"}
            </AvatarFallback>
          </Avatar>
          <div>
            <h4 className="font-bold text-gray-900">
              Dr. {doctorProfile?.firstName} {doctorProfile?.lastName}
            </h4>
            <p className="text-sm text-gray-600">
              {doctorProfile?.specialties?.find((s) => s.isPrimary)?.specialty?.name ||
                "General Practitioner"}
            </p>
          </div>
        </div>

        {/* Appointment Info Grid */}
        <div className="space-y-4">
          {/* Date */}
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <CalendarIcon className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Appointment Date</p>
              <p className="font-semibold text-gray-900">
                {bookingState.selectedDate
                  ? format(bookingState.selectedDate, "EEEE, MMMM d, yyyy")
                  : "N/A"}
              </p>
            </div>
          </div>

          {/* Time */}
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Clock className="w-5 h-5 text-teal-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Time Slot</p>
              <p className="font-semibold text-gray-900">
                {bookingState.selectedTimeSlot || "N/A"}
              </p>
            </div>
          </div>

          {/* Service */}
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-xl">🩺</span>
            </div>
            <div>
              <p className="text-sm text-gray-600">Service</p>
              <p className="font-semibold text-gray-900">
                {selectedService?.service?.name || "N/A"}
              </p>
              <p className="text-sm text-teal-600 font-medium">
                {selectedService?.price.toLocaleString("vi-VN")} {selectedService?.currency}
              </p>
            </div>
          </div>

          {/* Location/Type */}
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <MapPin className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Type & Location</p>
              <p className="font-semibold text-gray-900">
                {bookingState.consultationType || "N/A"}
              </p>
              {doctorProfile?.residency && (
                <p className="text-sm text-gray-600">{doctorProfile.residency}</p>
              )}
            </div>
          </div>

          {/* Contact */}
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Phone className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Contact Information</p>
              <p className="font-semibold text-gray-900">
                {bookingState.phoneNumber || "N/A"}
              </p>
              <p className="text-sm text-gray-600">{bookingState.email || "N/A"}</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <Button
          variant="outline"
          onClick={handleAddToCalendar}
          className="flex items-center justify-center gap-2"
        >
          <CalendarIcon className="w-4 h-4" />
          <span className="hidden md:inline">Add to Calendar</span>
          <span className="md:hidden">Calendar</span>
        </Button>
        <Button
          variant="outline"
          onClick={handleDownloadReceipt}
          className="flex items-center justify-center gap-2"
        >
          <Download className="w-4 h-4" />
          <span className="hidden md:inline">Download Receipt</span>
          <span className="md:hidden">Receipt</span>
        </Button>
        <Button
          variant="outline"
          onClick={handleShare}
          className="flex items-center justify-center gap-2"
        >
          <Share2 className="w-4 h-4" />
          <span className="hidden md:inline">Share</span>
          <span className="md:hidden">Share</span>
        </Button>
        <Button
          variant="outline"
          onClick={() => router.push(`/doctor/${doctorProfile?.id}`)}
          className="flex items-center justify-center gap-2"
        >
          <MapPin className="w-4 h-4" />
          <span className="hidden md:inline">View Location</span>
          <span className="md:hidden">Location</span>
        </Button>
      </div>

      {/* Next Steps */}
      <Card className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
        <h3 className="font-bold text-gray-900 mb-3">What's Next?</h3>
        <ul className="space-y-2 text-sm text-gray-700">
          <li className="flex items-start gap-2">
            <span className="text-blue-600 font-bold">1.</span>
            <span>
              You'll receive a confirmation email at{" "}
              <strong>{bookingState.email}</strong>
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 font-bold">2.</span>
            <span>
              Arrive 10 minutes early for your appointment or prepare for your online
              consultation
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 font-bold">3.</span>
            <span>
              Bring any relevant medical documents or test results
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 font-bold">4.</span>
            <span>
              If you need to reschedule, please do so at least 24 hours in advance
            </span>
          </li>
        </ul>
      </Card>

      {/* Navigation Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center mb-6">
        <Button
          onClick={handleBackToBookings}
          variant="outline"
          className="border-gray-300 text-gray-700 hover:bg-gray-50 px-8"
        >
          View My Appointments
        </Button>
        <Button
          onClick={handleStartNewBooking}
          className="bg-blue-600 hover:bg-blue-700 text-white px-8"
        >
          Book Another Appointment
        </Button>
      </div>

      {/* WebSocket Connection Status - Debug Info */}
      {showPaymentStatus && (
        <Card className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Payment Status Connection:</span>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${
                socket.isPaymentConnected ? 'bg-green-500' : 'bg-red-500'
              }`} />
              <span className={socket.isPaymentConnected ? 'text-green-600' : 'text-red-600'}>
                {socket.isPaymentConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
          </div>
          {paymentState.lastUpdated && (
            <div className="flex items-center justify-between text-xs text-gray-500 mt-1">
              <span>Last Update:</span>
              <span>{new Date(paymentState.lastUpdated).toLocaleTimeString()}</span>
            </div>
          )}
        </Card>
      )}
    </div>
  );
};
