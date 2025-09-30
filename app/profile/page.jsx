"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "../../components/providers/AuthProvider"
import ProfileCreation from "../../components/auth/ProfileCreation"

export default function ProfilePage() {
  const router = useRouter()
  const { session, loading } = useAuth()
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    if (!loading) {
      if (!session) {
        console.log('No session found, redirecting to auth')
        router.push('/auth')
      } else {
        console.log('Session found, showing profile page')
        setIsChecking(false)
      }
    }
  }, [session, loading, router])

  // Show loading while checking authentication
  if (loading || isChecking) {
    return (
      <div className="min-h-screen bg-[#1A1A1A] flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[#4A90E2]/30 border-t-[#4A90E2] rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[#B0B0B0]">Loading profile...</p>
        </div>
      </div>
    )
  }

  // Don't render if no session
  if (!session) {
    return null
  }

  // Render profile creation
  return (
    <div className="min-h-screen bg-[#1A1A1A]">
      <ProfileCreation 
        userData={{
          email: session.user?.email || 'verified@example.com',
          firstName: 'User',
          lastName: 'Test'
        }}
        onStepChange={(step, data) => {
          if (step === 'dashboard') {
            router.push('/dashboard')
          }
        }}
      />
    </div>
  )
}
