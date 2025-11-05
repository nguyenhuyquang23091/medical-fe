/**
 * Payment types for WebSocket integration and real-time status updates
 * Used for payment confirmation and status tracking
 */

// ==================== PAYMENT STATUS ENUMS ====================

/**
 * Payment status enum - matches backend payment status
 */
export enum PaymentStatus {
  PENDING = "PENDING",
  PROCESSING = "PROCESSING", 
  SUCCESS = "SUCCESS",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
  CANCELLED = "CANCELLED",
  TIMEOUT = "TIMEOUT",
}

/**
 * Payment method enum - matches backend payment methods
 */
export enum PaymentMethod {
  VN_PAY = "VN_PAY",
  CREDIT_CARD = "CREDIT_CARD",
  PAYPAL = "PAYPAL",
  STRIPE = "STRIPE",
}

// ==================== WEBSOCKET EVENT TYPES ====================

/**
 * Base payment event data structure
 * Common fields for all payment WebSocket events
 */
export interface BasePaymentEvent {
  transactionId: string;
  appointmentId?: string;
  userId?: string;
  timestamp: string; // ISO 8601 format
  amount: number;
  currency: string;
  paymentMethod: PaymentMethod;
}

/**
 * Payment update event - general status transitions
 * Received via subscribeToPaymentUpdates
 */
export interface PaymentUpdateEvent extends BasePaymentEvent {
  status: PaymentStatus;
  message: string;
  previousStatus?: PaymentStatus;
}

/**
 * Payment status event - current payment state
 * Received via subscribeToPaymentStatus
 */
export interface PaymentStatusEvent extends BasePaymentEvent {
  status: PaymentStatus;
  message: string;
  details?: {
    gatewayResponse?: string;
    errorCode?: string;
    retryCount?: number;
  };
}

/**
 * Payment success event - successful completion
 * Received via subscribeToPaymentSuccess
 */
export interface PaymentSuccessEvent extends BasePaymentEvent {
  status: PaymentStatus.SUCCESS | PaymentStatus.COMPLETED;
  message: string;
  receiptUrl?: string;
  confirmationNumber: string;
  completedAt: string; // ISO 8601 format
}

/**
 * Payment failure event - failed or cancelled payment
 * Received via subscribeToPaymentFailure
 */
export interface PaymentFailureEvent extends BasePaymentEvent {
  status: PaymentStatus.FAILED | PaymentStatus.CANCELLED | PaymentStatus.TIMEOUT;
  message: string;
  errorDetails: {
    errorCode: string;
    errorMessage: string;
    failureReason: string;
  };
  failedAt: string; // ISO 8601 format
}

// ==================== UI STATE TYPES ====================

/**
 * Payment status display configuration
 * Used for UI rendering based on payment status
 */
export interface PaymentStatusDisplay {
  status: PaymentStatus;
  title: string;
  message: string;
  icon: 'success' | 'pending' | 'error' | 'processing';
  color: 'green' | 'yellow' | 'red' | 'blue';
  showRetry?: boolean;
  showReceipt?: boolean;
}

/**
 * Real-time payment state for UI components
 * Manages current payment status and related data
 */
export interface PaymentState {
  // Current status
  status: PaymentStatus;
  message: string;
  
  // Transaction details
  transactionId?: string;
  appointmentId?: string;
  confirmationNumber?: string;
  
  // Timestamps
  createdAt?: string;
  completedAt?: string;
  failedAt?: string;
  
  // Additional data
  amount?: number;
  currency?: string;
  paymentMethod?: PaymentMethod;
  receiptUrl?: string;
  
  // Error information
  errorDetails?: {
    errorCode: string;
    errorMessage: string;
    failureReason: string;
  };
  
  // UI state
  isLoading: boolean;
  lastUpdated: string;
}

// ==================== API TYPES ====================

/**
 * Payment request for creating new payments
 */
export interface PaymentRequest {
  amount: string; // String to avoid floating point issues
  referenceId: string;
  appointmentId?: string;
  paymentMethod?: PaymentMethod;
}

/**
 * Payment response from backend
 */
export interface PaymentResponse {
  tnxRef: string; // Transaction reference
  paymentUrl?: string; // VNPay URL for redirection
  status: string;
  message?: string;
  amount?: number;
  currency?: string;
  createdAt?: string;
}

// ==================== UTILITY FUNCTIONS ====================

/**
 * Get payment status display configuration
 */
export function getPaymentStatusDisplay(status: PaymentStatus): PaymentStatusDisplay {
  switch (status) {
    case PaymentStatus.SUCCESS:
    case PaymentStatus.COMPLETED:
      return {
        status,
        title: "Payment Successful",
        message: "Your payment has been processed successfully",
        icon: 'success',
        color: 'green',
        showReceipt: true,
      };
      
    case PaymentStatus.PENDING:
      return {
        status,
        title: "Payment Pending",
        message: "Your payment is being processed",
        icon: 'pending',
        color: 'yellow',
      };
      
    case PaymentStatus.PROCESSING:
      return {
        status,
        title: "Processing Payment",
        message: "Please wait while we process your payment",
        icon: 'processing',
        color: 'blue',
      };
      
    case PaymentStatus.FAILED:
      return {
        status,
        title: "Payment Failed",
        message: "Your payment could not be processed",
        icon: 'error',
        color: 'red',
        showRetry: true,
      };
      
    case PaymentStatus.CANCELLED:
      return {
        status,
        title: "Payment Cancelled",
        message: "The payment was cancelled",
        icon: 'error',
        color: 'red',
        showRetry: true,
      };
      
    case PaymentStatus.TIMEOUT:
      return {
        status,
        title: "Payment Timeout",
        message: "The payment request has timed out",
        icon: 'error',
        color: 'red',
        showRetry: true,
      };
      
    default:
      return {
        status,
        title: "Unknown Status",
        message: "Payment status is unknown",
        icon: 'pending',
        color: 'yellow',
      };
  }
}

/**
 * Check if payment status is final (completed or failed)
 */
export function isPaymentStatusFinal(status: PaymentStatus): boolean {
  return [
    PaymentStatus.SUCCESS,
    PaymentStatus.COMPLETED,
    PaymentStatus.FAILED,
    PaymentStatus.CANCELLED,
    PaymentStatus.TIMEOUT,
  ].includes(status);
}

/**
 * Check if payment status is successful
 */
export function isPaymentStatusSuccess(status: PaymentStatus): boolean {
  return [PaymentStatus.SUCCESS, PaymentStatus.COMPLETED].includes(status);
}

/**
 * Check if payment status indicates failure
 */
export function isPaymentStatusFailure(status: PaymentStatus): boolean {
  return [
    PaymentStatus.FAILED,
    PaymentStatus.CANCELLED,
    PaymentStatus.TIMEOUT,
  ].includes(status);
}