"use client"

import { useRouter, useSearchParams } from 'next/navigation'
import { XCircle } from 'lucide-react'

const PaymentFailurePage: React.FC = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const txnRef = searchParams.get('txnRef')

  const handleGoHome = () => {
    router.push('/')
  }

  const handleTryAgain = () => {
    router.push('/payment/test')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white shadow-xl rounded-lg p-8 text-center">
        <div className="flex justify-center mb-6">
          <XCircle className="w-20 h-20 text-red-500" />
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Payment Failed
        </h1>

        <p className="text-gray-600 mb-6">
          Unfortunately, your payment could not be processed. Please try again or contact support if the problem persists.
        </p>

        {txnRef && (
          <div className="mb-6 p-4 bg-red-50 rounded-md">
            <p className="text-xs text-red-700 font-medium mb-1">Transaction Reference:</p>
            <p className="text-sm text-red-900 font-mono break-all">{txnRef}</p>
          </div>
        )}

        <div className="space-y-3">
          <button
            onClick={handleTryAgain}
            className="w-full px-6 py-3 bg-red-600 text-white font-medium rounded-md hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>

          <button
            onClick={handleGoHome}
            className="w-full px-6 py-3 bg-gray-200 text-gray-700 font-medium rounded-md hover:bg-gray-300 transition-colors"
          >
            Go to Home
          </button>
        </div>

        <div className="mt-6 p-4 bg-red-50 rounded-md">
          <p className="text-xs text-red-800">
            This is a test page for payment failure redirection.
          </p>
        </div>
      </div>
    </div>
  )
}

export default PaymentFailurePage