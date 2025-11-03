"use client"

import { useRouter, useSearchParams } from 'next/navigation'
import { CheckCircle } from 'lucide-react'

const PaymentSuccessPage: React.FC = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const txnRef = searchParams.get('txnRef')

  const handleGoHome = () => {
    router.push('/')
  }

  const handleTestAgain = () => {
    router.push('/payment/test')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white shadow-xl rounded-lg p-8 text-center">
        <div className="flex justify-center mb-6">
          <CheckCircle className="w-20 h-20 text-green-500" />
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Payment Successful!
        </h1>

        <p className="text-gray-600 mb-6">
          Your payment has been processed successfully. Thank you for your transaction.
        </p>

        {txnRef && (
          <div className="mb-6 p-4 bg-green-50 rounded-md">
            <p className="text-xs text-green-700 font-medium mb-1">Transaction Reference:</p>
            <p className="text-sm text-green-900 font-mono break-all">{txnRef}</p>
          </div>
        )}

        <div className="space-y-3">
          <button
            onClick={handleGoHome}
            className="w-full px-6 py-3 bg-green-600 text-white font-medium rounded-md hover:bg-green-700 transition-colors"
          >
            Go to Home
          </button>

          <button
            onClick={handleTestAgain}
            className="w-full px-6 py-3 bg-gray-200 text-gray-700 font-medium rounded-md hover:bg-gray-300 transition-colors"
          >
            Test Another Payment
          </button>
        </div>

        <div className="mt-6 p-4 bg-green-50 rounded-md">
          <p className="text-xs text-green-800">
            This is a test page for payment success redirection.
          </p>
        </div>
      </div>
    </div>
  )
}

export default PaymentSuccessPage