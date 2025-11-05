"use client";

import { useState, useEffect, useRef, useCallback, ChangeEvent } from "react";
import { useSession } from "next-auth/react";
import { useParams } from "next/navigation";
import { DoctorProfileResponse } from "@/types/doctorProfile";
import { BookingState, PaymentMethod, BookingCostBreakdown, convertBookingStateToRequest } from "@/types/booking";
import { 
  PaymentState, 
  PaymentStatus, 
  PaymentUpdateEvent,
  PaymentStatusEvent,
  PaymentSuccessEvent,
  PaymentFailureEvent,
  isPaymentStatusFinal,
  isPaymentStatusSuccess
} from "@/types/payment";
import appointmentService from "@/actions/appointment/appointment";
import { 
  initPaymentSocket, 
  subscribeToPaymentUpdates, 
  unsubscribeFromPaymentUpdates 
} from "@/lib/socket-IOClient";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CreditCard, Check, Loader2, AlertCircle, ExternalLink } from "lucide-react";

interface PaymentGatewayProps {
  doctorProfile: DoctorProfileResponse | null;
  bookingState: BookingState;
  onUpdateAction: (updates: Partial<BookingState>) => void;
  onNextAction: () => void;
  onBackAction: () => void;
}

const paymentMethods = [
  {
    method: PaymentMethod.VN_PAY,
    label: "VNPay",
    logo: "💳",
    description: "Popular Vietnamese payment gateway",
  },
  {
    method: PaymentMethod.CREDIT_CARD,
    label: "Credit/Debit Card",
    logo: "💳",
    description: "Visa, MasterCard, American Express",
  },
  {
    method: PaymentMethod.PAYPAL,
    label: "PayPal",
    logo: "🅿️",
    description: "Secure online payment",
  },
];

export const PaymentGateway: React.FC<PaymentGatewayProps> = ({
  doctorProfile,
  bookingState,
  onUpdateAction,
  onNextAction,
  onBackAction,
}) => {
  const { data: session } = useSession();
  const params = useParams();
  const doctorId = params.doctorId as string;

  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | undefined>(
    bookingState.paymentMethod || PaymentMethod.VN_PAY
  );
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Payment popup and WebSocket state
  const [paymentState, setPaymentState] = useState<PaymentState>({
    status: PaymentStatus.PENDING,
    message: "Ready to process payment",
    isLoading: false,
    lastUpdated: new Date().toISOString(),
  });
  const [showPaymentStatus, setShowPaymentStatus] = useState(false);
  const paymentWindowRef = useRef<Window | null>(null);
  const currentTxnRefRef = useRef<string | null>(null);

  // Socket instance ref
  const socketRef = useRef<any>(null);

  const [cardDetails, setCardDetails] = useState({
    cardHolderName: bookingState.cardHolderName || "",
    cardNumber: bookingState.cardNumber || "",
    expiryDate: bookingState.expiryDate || "",
    cvv: bookingState.cvv || "",
  });

  // Find service by relationshipId (not serviceId)
  const selectedService = doctorProfile?.services?.find(
    (s) => s.relationshipId === bookingState.selectedServiceId
  );

  // Format VND currency
  const formatVND = (amount: number): string => {
    return amount.toLocaleString('vi-VN') + '₫';
  };

  // Calculate cost breakdown
  // Note: Service price includes all charges (no separate tax or booking fee)
  const costBreakdown: BookingCostBreakdown = {
    serviceCharge: selectedService?.price || 0,
    bookingFee: 0, // Included in service price
    tax: 0, // Included in service price
    discount: 0,
    total: selectedService?.price || 0, // Total = service price (all-inclusive)
    currency: "VND",
  };

  // Payment event handler (following test page pattern)
  const handlePaymentUpdate = useCallback((data: any) => {
    // Use the txnRef directly as configured by backend
    const eventTxnRef = data.txnRef || data.tnxRef;

    // Backend txnRef format: APPOINTMENT_{userId}_{8-digit-random}
    // Check if the event txnRef starts with our stored prefix
    if (currentTxnRefRef.current) {
      const expectedPrefix = currentTxnRefRef.current;
      if (!eventTxnRef || !eventTxnRef.startsWith(expectedPrefix)) {
        return;
      }
    }

    // Update payment state
    setPaymentState(prev => ({
      ...prev,
      status: data.status === 'COMPLETED' || data.status === 'SUCCESS' ? PaymentStatus.SUCCESS : 
             data.status === 'FAILED' ? PaymentStatus.FAILED : PaymentStatus.PENDING,
      message: data.message || 'Payment status updated',
      transactionId: eventTxnRef,
      isLoading: false,
      lastUpdated: new Date().toISOString(),
    }));

    // Close popup window if still open
    if (paymentWindowRef.current && !paymentWindowRef.current.closed) {
      paymentWindowRef.current.close();
      paymentWindowRef.current = null;
    }

    // Clear current txnRef
    currentTxnRefRef.current = null;

    // Handle payment completion
    if (data.status === 'COMPLETED' || data.status === 'SUCCESS') {
      
      // Update booking state with success
      onUpdateAction({
        paymentMethod: selectedMethod,
        ...cardDetails,
        appointmentId: bookingState.appointmentId,
        bookingReferenceNumber: eventTxnRef,
      });
      
      // Show success message briefly then proceed
      setPaymentState(prev => ({
        ...prev,
        status: PaymentStatus.SUCCESS,
        message: 'Payment completed successfully!',
      }));
      
      setTimeout(() => {
        onNextAction();
      }, 1500);
    } else {
      
      setPaymentState(prev => ({
        ...prev,
        status: PaymentStatus.FAILED,
        message: data.message || 'Payment failed. Please try again.',
        errorDetails: {
          errorCode: 'PAYMENT_FAILED',
          errorMessage: data.message || 'Payment could not be processed',
          failureReason: 'Payment gateway returned failure status',
        },
      }));
      
      setError(data.message || 'Payment failed. Please try again.');
    }

    setProcessing(false);
  }, [selectedMethod, cardDetails, bookingState.appointmentId, onUpdateAction, onNextAction]);

  // Initialize socket and subscribe to payment events (following test page pattern)
  useEffect(() => {
    if (!session?.accessToken || !showPaymentStatus) return;

    // Initialize socket connection
    socketRef.current = initPaymentSocket(session.accessToken);

    // Subscribe to payment updates
    subscribeToPaymentUpdates(handlePaymentUpdate);

    return () => {
      unsubscribeFromPaymentUpdates();
    };
  }, [session?.accessToken, showPaymentStatus, handlePaymentUpdate]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Clean up popup window on unmount
      if (paymentWindowRef.current && !paymentWindowRef.current.closed) {
        paymentWindowRef.current.close();
      }
    };
  }, []);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCardDetails((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleConfirmPayment = async () => {
    // Clear previous errors
    setError(null);

    // Validation for credit card payment
    if (selectedMethod === PaymentMethod.CREDIT_CARD) {
      if (
        !cardDetails.cardHolderName ||
        !cardDetails.cardNumber ||
        !cardDetails.expiryDate ||
        !cardDetails.cvv
      ) {
        setError("Please fill in all card details");
        return;
      }

      // Basic card number validation (16 digits)
      if (cardDetails.cardNumber.replace(/\s/g, "").length !== 16) {
        setError("Please enter a valid 16-digit card number");
        return;
      }

      // CVV validation (3-4 digits)
      if (cardDetails.cvv.length < 3 || cardDetails.cvv.length > 4) {
        setError("Please enter a valid CVV (3-4 digits)");
        return;
      }
    }

    // Check authentication
    if (!session?.accessToken) {
      setError("Authentication required. Please log in again.");
      return;
    }

    setProcessing(true);
    setShowPaymentStatus(true);

    // Update payment state to processing
    setPaymentState(prev => ({
      ...prev,
      status: PaymentStatus.PROCESSING,
      message: "Creating appointment and preparing payment...",
      isLoading: true,
      lastUpdated: new Date().toISOString(),
    }));

    try {
      // Convert booking state to appointment request
      const appointmentRequest = convertBookingStateToRequest(
        bookingState,
        doctorId
      );

      // Call createAppointment API
      const response = await appointmentService.createAppointment(
        appointmentRequest,
        session.accessToken
      );

      // Update booking state with appointment details
      onUpdateAction({
        paymentMethod: selectedMethod,
        ...cardDetails,
        appointmentId: response.id,
        bookingReferenceNumber: response.id,
        paymentURL: response.paymentURL,
      });


      // Handle payment flow based on method and response
      if (selectedMethod === PaymentMethod.VN_PAY && response.paymentURL) {
        // VNPay popup flow
        await handleVNPayPopup(response.paymentURL, response.id);
      } else if (response.paymentURL) {
        // Other payment methods - redirect
        window.location.href = response.paymentURL;
      } else {
        // No payment URL - proceed directly (free appointment or already paid)
        setPaymentState(prev => ({
          ...prev,
          status: PaymentStatus.SUCCESS,
          message: "Appointment created successfully",
          isLoading: false,
          lastUpdated: new Date().toISOString(),
        }));
        
        setTimeout(() => {
          onNextAction();
        }, 1500);
      }
    } catch (err) {
      console.error("Appointment creation error:", err);

      // Update payment state with error
      setPaymentState(prev => ({
        ...prev,
        status: PaymentStatus.FAILED,
        message: "Failed to create appointment",
        isLoading: false,
        errorDetails: {
          errorCode: "APPOINTMENT_CREATION_FAILED",
          errorMessage: err instanceof Error ? err.message : "Unknown error",
          failureReason: "Appointment creation failed",
        },
        lastUpdated: new Date().toISOString(),
      }));

      // User-friendly error messages
      if (err instanceof Error) {
        if (err.message.includes("phone")) {
          setError("Invalid phone number. Please check and try again.");
        } else if (err.message.includes("date")) {
          setError("Invalid appointment date. Please select a future date.");
        } else if (err.message.includes("specialty") || err.message.includes("service")) {
          setError("Invalid specialty or service selection. Please go back and select again.");
        } else {
          setError(err.message || "Failed to create appointment. Please try again.");
        }
      } else {
        setError("Failed to create appointment. Please try again.");
      }

      setProcessing(false);
    }
  };

  // Handle VNPay popup window flow
  const handleVNPayPopup = async (paymentURL: string, appointmentId: string) => {
    try {
      // Backend txnRef format: APPOINTMENT_{userId}_{8-digit-random}
      // Store the userId prefix for matching
      const userId = session?.user?.id;
      if (userId) {
        currentTxnRefRef.current = `APPOINTMENT_${userId}`;
      } else {
        currentTxnRefRef.current = null;
      }

      // Update payment state
      setPaymentState(prev => ({
        ...prev,
        status: PaymentStatus.PENDING,
        message: "Opening VNPay payment gateway...",
        transactionId: appointmentId,
        isLoading: true,
        lastUpdated: new Date().toISOString(),
      }));

      // Open VNPay in popup window (following test page pattern)
      const width = 800;
      const height = 600;
      const left = (window.screen.width - width) / 2;
      const top = (window.screen.height - height) / 2;

      paymentWindowRef.current = window.open(
        paymentURL,
        'VNPay Payment',
        `width=${width},height=${height},left=${left},top=${top},toolbar=no,menubar=no,scrollbars=yes,resizable=yes`
      );

      if (!paymentWindowRef.current) {
        throw new Error("Popup blocked. Please allow popups for this site and try again.");
      }

      // Update payment state to show popup is open
      setPaymentState(prev => ({
        ...prev,
        message: "Complete payment in the popup window...",
        lastUpdated: new Date().toISOString(),
      }));

      // Monitor popup window closure
      const checkPopupClosed = setInterval(() => {
        if (paymentWindowRef.current && paymentWindowRef.current.closed) {
          clearInterval(checkPopupClosed);
          
          // If popup was closed manually and we haven't received a payment update
          if (currentTxnRefRef.current) {
            setPaymentState(prev => ({
              ...prev,
              message: "Payment window closed. Waiting for confirmation...",
              lastUpdated: new Date().toISOString(),
            }));
          }
        }
      }, 500);

      // WebSocket listeners are already set up in useEffect
      // They will handle the payment status updates automatically

    } catch (error) {
      
      setPaymentState(prev => ({
        ...prev,
        status: PaymentStatus.FAILED,
        message: error instanceof Error ? error.message : "Failed to open payment window",
        isLoading: false,
        errorDetails: {
          errorCode: "POPUP_ERROR",
          errorMessage: error instanceof Error ? error.message : "Unknown error",
          failureReason: "Failed to open payment popup",
        },
        lastUpdated: new Date().toISOString(),
      }));

      setError(error instanceof Error ? error.message : "Failed to open payment window");
      setProcessing(false);
      currentTxnRefRef.current = null;
    }
  };

  return (
      <div className="space-y-6">
        {/* Step Title */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Payment Details
          </h2>
          <p className="text-gray-600">Select your payment method and complete the booking</p>
        </div>

        {/* Real-time Payment Status */}
        {showPaymentStatus && (
          <Card className={`border-2 rounded-lg p-4 ${
            paymentState.status === PaymentStatus.SUCCESS || paymentState.status === PaymentStatus.COMPLETED
              ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200'
              : paymentState.status === PaymentStatus.FAILED || paymentState.status === PaymentStatus.CANCELLED
              ? 'bg-gradient-to-br from-red-50 to-rose-50 border-red-200'
              : paymentState.status === PaymentStatus.PROCESSING
              ? 'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200'
              : 'bg-gradient-to-br from-yellow-50 to-amber-50 border-yellow-200'
          }`}>
            <div className="flex items-center gap-3">
              {/* Status Icon */}
              <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                paymentState.status === PaymentStatus.SUCCESS || paymentState.status === PaymentStatus.COMPLETED
                  ? 'bg-green-500'
                  : paymentState.status === PaymentStatus.FAILED || paymentState.status === PaymentStatus.CANCELLED
                  ? 'bg-red-500'
                  : paymentState.status === PaymentStatus.PROCESSING
                  ? 'bg-blue-500'
                  : 'bg-yellow-500'
              }`}>
                {(paymentState.status === PaymentStatus.SUCCESS || paymentState.status === PaymentStatus.COMPLETED) && (
                  <Check className="w-5 h-5 text-white" />
                )}
                {(paymentState.status === PaymentStatus.FAILED || paymentState.status === PaymentStatus.CANCELLED) && (
                  <AlertCircle className="w-5 h-5 text-white" />
                )}
                {paymentState.status === PaymentStatus.PROCESSING && (
                  <Loader2 className="w-5 h-5 text-white animate-spin" />
                )}
                {(paymentState.status === PaymentStatus.PENDING) && (
                  <ExternalLink className="w-5 h-5 text-white" />
                )}
              </div>
              
              {/* Status Content */}
              <div className="flex-1">
                <p className="font-semibold text-gray-900">
                  {paymentState.message}
                </p>
                {paymentState.transactionId && (
                  <p className="text-sm text-gray-600 mt-1">
                    Transaction ID: {paymentState.transactionId}
                  </p>
                )}
                {paymentState.errorDetails && (
                  <p className="text-sm text-red-600 mt-1">
                    Error: {paymentState.errorDetails.errorMessage}
                  </p>
                )}
              </div>

              {/* Status Timestamp */}
              <div className="text-xs text-gray-500">
                {new Date(paymentState.lastUpdated).toLocaleTimeString()}
              </div>
            </div>
          </Card>
        )}

        {/* Error Message */}
        {error && !showPaymentStatus && (
          <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-semibold text-red-800 mb-1">Payment Error</h4>
              <p className="text-sm text-red-600">{error}</p>
            </div>
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-6">
          {/* Left Column - Payment Methods */}
          <div className="md:col-span-2 space-y-6">
            {/* Payment Method Selection */}
            <div>
              <Label className="text-base font-semibold mb-3 block">
                Select Payment Method <span className="text-red-500">*</span>
              </Label>
              <div className="space-y-3">
                {paymentMethods.map((method) => (
                  <div
                    key={method.method}
                    onClick={() => setSelectedMethod(method.method)}
                    className={`relative p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      selectedMethod === method.method
                        ? "border-blue-600 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300 bg-white"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="text-3xl">{method.logo}</div>
                        <div>
                          <p className="font-semibold text-gray-900">
                            {method.label}
                          </p>
                          <p className="text-sm text-gray-500">
                            {method.description}
                          </p>
                        </div>
                      </div>

                      {/* Checkmark */}
                      {selectedMethod === method.method && (
                        <div className="flex items-center justify-center w-6 h-6 bg-blue-600 rounded-full">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Credit Card Form (shown only for credit card payment) */}
            {selectedMethod === PaymentMethod.CREDIT_CARD && (
              <div className="space-y-4 border-t pt-6">
                <div className="flex items-center gap-2 mb-4">
                  <CreditCard className="w-5 h-5 text-gray-600" />
                  <h3 className="font-semibold text-gray-900">
                    Enter Card Details
                  </h3>
                </div>

                <div>
                  <Label htmlFor="cardHolderName">
                    Card Holder Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="cardHolderName"
                    name="cardHolderName"
                    value={cardDetails.cardHolderName}
                    onChange={handleInputChange}
                    placeholder="John Doe"
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="cardNumber">
                    Card Number <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="cardNumber"
                    name="cardNumber"
                    value={cardDetails.cardNumber}
                    onChange={handleInputChange}
                    placeholder="1234 5678 9012 3456"
                    maxLength={19}
                    className="mt-2"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="expiryDate">
                      Expiry Date <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="expiryDate"
                      name="expiryDate"
                      value={cardDetails.expiryDate}
                      onChange={handleInputChange}
                      placeholder="MM/YY"
                      maxLength={5}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="cvv">
                      CVV <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="cvv"
                      name="cvv"
                      type="password"
                      value={cardDetails.cvv}
                      onChange={handleInputChange}
                      placeholder="123"
                      maxLength={4}
                      className="mt-2"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* VNPay Information */}
            {selectedMethod === PaymentMethod.VN_PAY && (
              <div className="border-t pt-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-gray-700">
                    You will be redirected to VNPay payment gateway to complete your transaction securely.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Cost Summary */}
          <div>
            <Card className="bg-gray-50 border border-gray-200 p-4 sticky top-4">
              <h3 className="font-semibold text-gray-900 mb-4">
                Payment Summary
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Service Charge</span>
                  <span className="font-medium text-gray-900">
                    {formatVND(costBreakdown.serviceCharge)}
                  </span>
                </div>
                {costBreakdown.discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span className="font-medium">
                      -{formatVND(costBreakdown.discount)}
                    </span>
                  </div>
                )}
                <div className="border-t border-gray-300 pt-3 mt-3">
                  <div className="flex justify-between">
                    <span className="font-semibold text-gray-900">Total Amount</span>
                    <span className="font-bold text-lg text-teal-600">
                      {formatVND(costBreakdown.total)}
                    </span>
                  </div>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-3">
                  <p className="text-xs text-gray-600">
                    💡 All fees included in the service price
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between pt-6 border-t mt-6">
          <Button
            onClick={onBackAction}
            variant="outline"
            disabled={processing}
            className="bg-gray-900 hover:bg-gray-800 text-white border-gray-900 px-8 h-12 rounded-lg"
          >
            Back
          </Button>
          <Button
            onClick={handleConfirmPayment}
            disabled={!selectedMethod || processing}
            className="bg-blue-500 hover:bg-blue-600 text-white px-8 h-12 rounded-lg disabled:bg-gray-400"
          >
            {processing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              "Confirm & Pay"
            )}
          </Button>
        </div>
      </div>
  );
};
