"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../providers/AuthProvider'

export default function ProtectedRoute({ children, redirectTo = '/login' }) {
  const { session, loading } = useAuth()
  const router = useRouter()
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    if (!loading) {
      if (!session) {
        console.log('No session found, redirecting to:', redirectTo)
        router.push(redirectTo)
      } else {
        console.log('Session found, user authenticated:', session.user?.email)
        setIsChecking(false)
      }
    }
  }, [session, loading, router, redirectTo])

  // Show loading while checking authentication
  if (loading || isChecking) {
    return (
      <div className="min-h-screen bg-[#1A1A1A] flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[#4A90E2]/30 border-t-[#4A90E2] rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[#B0B0B0]">Checking authentication...</p>
        </div>
      </div>
    )
  }

  // Don't render children if no session
  if (!session) {
    return null
  }

  // Render protected content
  return children
}
