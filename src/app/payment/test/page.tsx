"use client"
import { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/app/context/AuthContext'
import { useRouter } from 'next/navigation'
import paymentService from '@/actions/payment/payment'
import { PaymentRequest, PaymentResponse } from '@/types/payment'
import { toast } from 'sonner'
import { initSocketIo, subscribeToPaymentUpdates, unsubscribeFromPaymentUpdates } from '@/lib/socket-IOClient'
import { z } from 'zod'

// Security: Input validation schema
const paymentRequestSchema = z.object({
  amount: z.string()
    .min(1, 'Amount is required')
    .regex(/^\d+$/, 'Amount must contain only numbers')
    .refine((val) => parseInt(val) >= 1000, 'Minimum amount is 1,000 VND')
    .refine((val) => parseInt(val) <= 100000000, 'Maximum amount is 100,000,000 VND'),
  referenceId: z.string()
    .min(3, 'Reference ID must be at least 3 characters')
    .max(100, 'Reference ID must be at most 100 characters')
    .regex(/^[A-Za-z0-9_-]+$/, 'Reference ID can only contain letters, numbers, hyphens, and underscores')
})

const PaymentTestPage: React.FC = () => {
  const { session } = useAuth()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [amount, setAmount] = useState('100000')
  const [referenceId, setReferenceId] = useState(`REF-${Date.now()}`)
  const paymentWindowRef = useRef<Window | null>(null)
  const currentTxnRefRef = useRef<string | null>(null)

  useEffect(() => {
    if (!session?.accessToken) return

    // Initialize socket connection
    const socket = initSocketIo(session.accessToken)

    // Listen for payment updates
    const handlePaymentUpdate = (data: PaymentResponse) => {
      console.log('Payment event received:', data)

      // Check if this is the current payment
      if (currentTxnRefRef.current && data.tnxRef !== currentTxnRefRef.current) {
        console.log('Payment txnRef mismatch, ignoring event')
        return
      }

      // Close popup window if still open
      if (paymentWindowRef.current && !paymentWindowRef.current.closed) {
        paymentWindowRef.current.close()
        paymentWindowRef.current = null
      }

      // Clear current txnRef
      currentTxnRefRef.current = null

      // Redirect main window based on status
      if (data.status === 'COMPLETED' || data.status === 'SUCCESS') {
        toast.success('Payment Successful', {
          description: data.message || 'Payment completed successfully'
        })
        router.push(`/payment/success?txnRef=${data.tnxRef}`)
      } else {
        toast.error('Payment Failed', {
          description: data.message || 'Payment could not be processed'
        })
        router.push(`/payment/failure?txnRef=${data.tnxRef}`)
      }

      setIsLoading(false)
    }

    subscribeToPaymentUpdates(handlePaymentUpdate)

    return () => {
      unsubscribeFromPaymentUpdates()
      // Clean up popup window on unmount
      if (paymentWindowRef.current && !paymentWindowRef.current.closed) {
        paymentWindowRef.current.close()
      }
    }
  }, [session?.accessToken, router])

  const handleCreatePayment = async () => {
    if (!session?.accessToken) {
      toast.error('Authentication required', {
        description: 'Please log in to create a payment'
      })
      return
    }

    // Security: Validate inputs before making API call
    const validationResult = paymentRequestSchema.safeParse({
      amount,
      referenceId
    })

    if (!validationResult.success) {
      const firstError = validationResult.error.errors[0]
      toast.error('Invalid input', {
        description: firstError.message
      })
      return
    }

    const request: PaymentRequest = {
      amount,
      referenceId
    }

    try {
      setIsLoading(true)
      toast.info('Creating payment...', {
        description: 'Opening payment gateway'
      })

      // 1. Get payment URL from backend
      const response = await paymentService.createPayment(request, session.accessToken)

      console.log('Payment response:', response)

      if (!response.paymentUrl) {
        toast.error('Payment URL not found', {
          description: 'Unable to open payment gateway'
        })
        setIsLoading(false)
        return
      }

      // Store current transaction reference
      currentTxnRefRef.current = response.tnxRef

      toast.success('Payment URL generated', {
        description: 'Opening VNPay in popup window...'
      })

      // 2. Open VNPay in popup window
      const width = 800
      const height = 600
      const left = (window.screen.width - width) / 2
      const top = (window.screen.height - height) / 2

      paymentWindowRef.current = window.open(
        response.paymentUrl,
        'VNPay Payment',
        `width=${width},height=${height},left=${left},top=${top},toolbar=no,menubar=no,scrollbars=yes,resizable=yes`
      )

      if (!paymentWindowRef.current) {
        toast.error('Popup blocked', {
          description: 'Please allow popups for this site and try again'
        })
        setIsLoading(false)
        currentTxnRefRef.current = null
        return
      }

      // Monitor popup window closure
      const checkPopupClosed = setInterval(() => {
        if (paymentWindowRef.current && paymentWindowRef.current.closed) {
          clearInterval(checkPopupClosed)
          console.log('Payment popup closed by user')

          // If popup was closed manually and we haven't received a payment update
          if (currentTxnRefRef.current) {
            toast.info('Payment window closed', {
              description: 'If you completed the payment, please wait for confirmation'
            })
            // Keep isLoading true in case socket event is still coming
          }
        }
      }, 500)

      // 3. Socket event listener is already set up in useEffect
      // It will handle the payment:update event and redirect accordingly

    } catch (error) {
      console.error('Payment creation failed:', error)
      toast.error('Payment creation failed', {
        description: error instanceof Error ? error.message : 'Unknown error occurred'
      })
      setIsLoading(false)
      currentTxnRefRef.current = null
    }
  }

  const handleRandomizeRef = () => {
    setReferenceId(`REF-${Date.now()}`)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <div className="bg-white shadow-lg rounded-lg p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Payment Test Page</h1>
          <p className="text-sm text-gray-600 mb-6">
            This page simulates the createPayment flow using mock data, similar to testing in Postman.
          </p>

          <div className="space-y-4">
            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
                Amount (VND)
              </label>
              <input
                id="amount"
                type="text"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter amount"
              />
            </div>

            <div>
              <label htmlFor="referenceId" className="block text-sm font-medium text-gray-700 mb-1">
                Reference ID
              </label>
              <div className="flex gap-2">
                <input
                  id="referenceId"
                  type="text"
                  value={referenceId}
                  onChange={(e) => setReferenceId(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter reference ID"
                />
                <button
                  type="button"
                  onClick={handleRandomizeRef}
                  className="px-3 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
                >
                  Randomize
                </button>
              </div>
            </div>

            <button
              onClick={handleCreatePayment}
              disabled={isLoading || !amount || !referenceId}
              className="w-full mt-6 px-4 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Waiting for payment...' : 'Create Payment (Popup)'}
            </button>
          </div>

          <div className="mt-6 p-4 bg-gray-100 rounded-md">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Request Preview:</h3>
            <pre className="text-xs text-gray-600 overflow-auto">
              {JSON.stringify({ amount, referenceId }, null, 2)}
            </pre>
          </div>

          <div className="mt-4 p-4 bg-blue-50 rounded-md">
            <h3 className="text-sm font-semibold text-blue-900 mb-2">Instructions:</h3>
            <ul className="text-xs text-blue-800 space-y-1 list-disc list-inside">
              <li>Enter the amount and reference ID (or use randomize)</li>
              <li>Click "Create Payment (Popup)" to open VNPay in a popup window</li>
              <li>Complete the payment in the popup window</li>
              <li>The main window will receive a socket event from the backend</li>
              <li>You will be automatically redirected to success or failure page</li>
            </ul>
          </div>

          {isLoading && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
              <p className="text-sm text-yellow-800 font-medium">
                ⏳ Waiting for payment confirmation...
              </p>
              <p className="text-xs text-yellow-700 mt-1">
                Complete the payment in the popup window. This page will redirect automatically when payment is confirmed.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default PaymentTestPage