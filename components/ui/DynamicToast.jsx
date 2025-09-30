"use client"

import { useEffect } from 'react'
import { useToast } from '../../hooks/useRealTime'
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react'

export default function DynamicToast() {
  const { toast, hideToast } = useToast()

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        hideToast()
      }, 3000)

      return () => clearTimeout(timer)
    }
  }, [toast, hideToast])

  if (!toast) return null

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-400" />
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-400" />
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-400" />
      case 'info':
      default:
        return <Info className="w-5 h-5 text-blue-400" />
    }
  }

  const getBgColor = () => {
    switch (toast.type) {
      case 'success':
        return 'bg-green-900/20 border-green-500/50'
      case 'error':
        return 'bg-red-900/20 border-red-500/50'
      case 'warning':
        return 'bg-yellow-900/20 border-yellow-500/50'
      case 'info':
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
          {toast.title && (
            <h4 className="font-semibold text-white text-sm">{toast.title}</h4>
          )}
          <p className="text-sm text-gray-300">{toast.message}</p>
        </div>
        <button
          onClick={hideToast}
          className="text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
