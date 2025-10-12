"use client"

import { useEffect, useRef } from 'react'
import { useToast } from '../../hooks/use-toast'
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react'

export default function DynamicToast() {
  const { toasts, dismiss } = useToast()
  
  // 🛡️ Track shown toasts to prevent duplicates
  const shownToastsRef = useRef(new Set())
  const lastToastIdRef = useRef(null)

  // Get the most recent toast
  const currentToast = toasts[0]

  useEffect(() => {
    if (currentToast) {
      // Create unique key for this toast
      const toastKey = `${currentToast.title}-${currentToast.description}`
      
      // Skip if we've already shown this exact toast
      if (shownToastsRef.current.has(toastKey) && lastToastIdRef.current === currentToast.id) {
        console.log("[DYNAMIC_TOAST] ⏭️ Skipping duplicate toast:", currentToast.title)
        return
      }
      
      // Mark as shown
      shownToastsRef.current.add(toastKey)
      lastToastIdRef.current = currentToast.id
      
      console.log("[DYNAMIC_TOAST] 🍞 Showing unique toast:", currentToast.title)
      
      // Auto-dismiss after delay, but respect dismissibility
      const timer = setTimeout(() => {
        console.log("[DYNAMIC_TOAST] ⏰ Auto-dismissing toast:", currentToast.title)
        dismiss(currentToast.id)
        
        // Clean up from shown set after a delay
        setTimeout(() => {
          shownToastsRef.current.delete(toastKey)
        }, 1000)
      }, currentToast.duration || 3000)

      return () => {
        console.log("[DYNAMIC_TOAST] 🧹 Cleaning up timer for:", currentToast.title)
        clearTimeout(timer)
      }
    }
  }, [currentToast, dismiss])

  if (!currentToast) return null

  const getIcon = () => {
    // Map the toast variant to our icon types
    const variant = currentToast.variant || 'default'
    switch (variant) {
      case 'default':
        return <CheckCircle className="w-5 h-5 text-green-400" />
      case 'destructive':
        return <AlertCircle className="w-5 h-5 text-red-400" />
      default:
        return <Info className="w-5 h-5 text-blue-400" />
    }
  }

  const getBgColor = () => {
    const variant = currentToast.variant || 'default'
    switch (variant) {
      case 'default':
        return 'bg-green-900/20 border-green-500/50'
      case 'destructive':
        return 'bg-red-900/20 border-red-500/50'
      default:
        return 'bg-blue-900/20 border-blue-500/50'
    }
  }

  return (
    <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-2 duration-300">
      <div className={`
        flex items-center space-x-3 p-4 rounded-lg border backdrop-blur-sm
        ${getBgColor()}
        max-w-sm shadow-lg
      `}>
        {getIcon()}
        <div className="flex-1">
          {currentToast.title && (
            <h4 className="font-semibold text-white text-sm">{currentToast.title}</h4>
          )}
          {currentToast.description && (
            <p className="text-sm text-gray-300">{currentToast.description}</p>
          )}
        </div>
        <button
          onClick={() => dismiss(currentToast.id)}
          className="text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
