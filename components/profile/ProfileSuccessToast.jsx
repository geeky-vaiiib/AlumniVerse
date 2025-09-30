"use client"

import { useEffect } from "react"
import { CheckCircle, X } from "lucide-react"
import { Button } from "../ui/button"

export default function ProfileSuccessToast({ isVisible, onClose, message = "Profile created successfully!" }) {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose()
      }, 5000) // Auto-close after 5 seconds

      return () => clearTimeout(timer)
    }
  }, [isVisible, onClose])

  if (!isVisible) return null

  return (
    <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-2 duration-300">
      <div className="bg-green-600 border border-green-500 rounded-lg shadow-lg p-4 max-w-sm">
        <div className="flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-white mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-white font-medium text-sm">{message}</p>
            <p className="text-green-100 text-xs mt-1">
              Redirecting to dashboard...
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-white hover:bg-green-700 h-auto p-1"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
