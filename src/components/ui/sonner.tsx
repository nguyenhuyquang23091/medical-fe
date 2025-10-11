"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner, ToasterProps } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="light"
      className="toaster group"
      style={{ zIndex: 9999 }}
      toastOptions={{
        unstyled: false,
        classNames: {
          toast: "bg-white text-gray-900 border border-gray-200 shadow-lg rounded-lg p-4",
          title: "text-gray-900 font-semibold text-sm",
          description: "text-gray-600 text-sm",
          success: "bg-emerald-50 text-emerald-900 border-emerald-200",
          error: "bg-red-50 text-red-900 border-red-200",
          warning: "bg-amber-50 text-amber-900 border-amber-200",
          info: "bg-blue-50 text-blue-900 border-blue-200",
          actionButton: "bg-blue-600 text-white hover:bg-blue-700 px-3 py-1.5 rounded",
          cancelButton: "bg-gray-100 text-gray-700 hover:bg-gray-200 px-3 py-1.5 rounded",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
