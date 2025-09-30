"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import LoginForm from "./LoginForm"
import SignUpForm from "./SignUpForm"
import OTPVerification from "./OTPVerification"
import ProfileCreationFlow from "./ProfileCreationFlow"
import { useAuth } from "../providers/AuthProvider"

export default function AuthFlow({ initialStep = 'login' }) {
  const router = useRouter()
  const { session, loading, isLoggedIn, isReady } = useAuth()
  const [currentStep, setCurrentStep] = useState(initialStep)
  const [authData, setAuthData] = useState({})

  console.log('AuthFlow: Rendering with state -', {
    loading,
    isLoggedIn,
    hasSession: !!session,
    hasUser: !!session?.user,
    currentStep,
    isReady
  })

  // Simple auth check - no complex loading states
  useEffect(() => {
    console.log('AuthFlow: Auth check effect triggered', { isLoggedIn, hasSession: !!session })

    if (isLoggedIn || session?.user) {
      console.log('AuthFlow: User authenticated, redirecting to dashboard')
      router.push('/dashboard')
    }
  }, [session, isLoggedIn, router])

  const handleStepChange = (step, data = {}) => {
    console.log('Step change:', step, data)
    setCurrentStep(step)
    setAuthData(prev => ({ ...prev, ...data }))
  }

  const handleProfileComplete = (profileData) => {
    console.log('Profile creation completed:', profileData)
    // Store profile data in context or send to API
    setAuthData(prev => ({ ...prev, profile: profileData }))
    // Redirect to dashboard
    router.push('/dashboard')
  }

  // No loading screens - render immediately to prevent infinite loading

  // Render current step
  switch (currentStep) {
    case 'signup':
      return (
        <SignUpForm
          onStepChange={handleStepChange}
        />
      )

    case 'login':
      return (
        <LoginForm
          onStepChange={handleStepChange}
        />
      )

    case 'otp-verification':
      return (
        <OTPVerification
          email={authData.email}
          firstName={authData.firstName}
          isSignUp={authData.isSignUp}
          userData={authData.userData}
          onStepChange={handleStepChange}
        />
      )

    case 'profile':
      return (
        <ProfileCreationFlow
          userData={authData}
          onComplete={handleProfileComplete}
        />
      )

    default:
      return (
        <LoginForm
          onStepChange={handleStepChange}
        />
      )
  }
}
