"use client"

import React, { createContext, useContext, useEffect, useCallback, ReactNode } from 'react'
import { useAuth } from './AuthContext'
import {
  initSocketIo,
  socketDisconnect,
  subscribeToPaymentUpdates,
  unsubscribeFromPaymentUpdates
} from '@/lib/socket-IOClient'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { PaymentResponse } from '@/types/payment'

interface PaymentContextType {
  // You can add payment-specific methods here if needed
}

const PaymentContext = createContext<PaymentContextType | undefined>(undefined)

interface PaymentProviderProps {
  children: ReactNode
}

export const PaymentProvider: React.FC<PaymentProviderProps> = ({ children }) => {
  const { session } = useAuth()
  const router = useRouter()

  // Handle payment updates from socket
  const handlePaymentUpdate = useCallback((paymentResponse: PaymentResponse) => {
    console.log('Payment update received:', paymentResponse)

    // Check payment status and redirect accordingly
    const statusUpper = (paymentResponse.status || '').toUpperCase()

    if (statusUpper === 'SUCCESS' || statusUpper === 'APPROVED' || statusUpper === 'COMPLETED') {
      toast.success('Payment Successful', {
        description: paymentResponse.message || `Payment of ${paymentResponse.amount} completed successfully`,
        duration: 5000,
      })

      // Redirect to success page
      router.push('/payment/success')
    } else if (statusUpper === 'FAILED' || statusUpper === 'REJECTED' || statusUpper === 'ERROR') {
      toast.error('Payment Failed', {
        description: paymentResponse.message || 'Payment could not be processed',
        duration: 5000,
      })

      // Redirect to failure page
      router.push('/payment/failure')
    } else {
      // Unknown status
      toast.info('Payment Update', {
        description: paymentResponse.message || `Payment status: ${paymentResponse.status}`,
        duration: 5000,
      })
    }
  }, [router])

  // Setup WebSocket connection for payment events
  useEffect(() => {
    if (session?.accessToken) {
      const socket = initSocketIo(session.accessToken)

      socket.on('connect', () => {
        console.log('Payment socket connected')
      })

      socket.on('disconnect', () => {
        console.log('Payment socket disconnected')
      })

      socket.on('error', (error) => {
        console.error('Payment Socket.IO error:', error)
      })

      subscribeToPaymentUpdates(handlePaymentUpdate)

      return () => {
        unsubscribeFromPaymentUpdates()
      }
    }
  }, [session?.accessToken, handlePaymentUpdate])

  const value: PaymentContextType = {
    // Add payment-specific methods here if needed
  }

  return (
    <PaymentContext.Provider value={value}>
      {children}
    </PaymentContext.Provider>
  )
}

export const usePayment = (): PaymentContextType => {
  const context = useContext(PaymentContext)
  if (context === undefined) {
    throw new Error('usePayment must be used within a PaymentProvider')
  }
  return context
}
