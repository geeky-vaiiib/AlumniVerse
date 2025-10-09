"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import LoginForm from "./LoginForm"
import SignUpForm from "./SignUpForm"
import OTPVerification from "./OTPVerification"
import ProfileCreationFlow from "./ProfileCreationFlow"
import ForgotPassword from "./ForgotPassword"
import DebugAuthFlow from "./DebugAuthFlow"
import { useAuth } from "../providers/AuthProvider"
import { useUser } from "../../contexts/UserContext"
import { useToast } from "../../hooks/use-toast"

export default function AuthFlow({ initialStep = 'login' }) {
  const router = useRouter()
  const { session, loading, isLoggedIn, isReady, authReady } = useAuth()
  const { updateProfile, userProfile } = useUser()
  const [currentStep, setCurrentStep] = useState(initialStep)
  const [authData, setAuthData] = useState({})
  const { toast } = useToast()
  const [redirectTriggered, setRedirectTriggered] = useState(false)

  // Add wait gate before pushing to dashboard
  useEffect(() => {
    console.log("[DEBUG][TIME]", new Date().toISOString(), "AuthFlow redirect check:", {
      authReady,
      hasSession: !!session,
      hasProfile: !!userProfile,
      redirectTriggered,
      currentStep
    })
    
    if (authReady && session && userProfile && !redirectTriggered && currentStep !== 'otp-verification' && currentStep !== 'profile') {
      const urlParams = new URLSearchParams(window.location.search)
      const redirectTo = urlParams.get('redirectTo') || '/dashboard'
      
      console.log("[AUTH_FLOW] ✅ Redirecting to dashboard...", redirectTo)
      setRedirectTriggered(true)
      setTimeout(() => router.replace(redirectTo), 500)
    }
  }, [authReady, session, userProfile, redirectTriggered, currentStep, router])

  // Only log state changes, not every render
  const stateKey = `${loading}-${isLoggedIn}-${!!session}-${currentStep}-${isReady}`
  const [lastStateKey, setLastStateKey] = useState('')
  
  if (stateKey !== lastStateKey) {
    console.log("[DEBUG][TIME]", new Date().toISOString(), "AuthFlow state changed:", {
      loading,
      isLoggedIn,
      hasSession: !!session,
      hasUser: !!session?.user,
      currentStep,
      isReady,
      hasProfile: !!userProfile,
      profileCompleted: userProfile?.profileCompleted
    })
    setLastStateKey(stateKey)
  }

  // Remove the old redirect effect - replaced with the new wait gate above

  const handleStepChange = (step, data = {}) => {
    console.log('Step change:', step, data)
    setCurrentStep(step)
    setAuthData(prev => ({ ...prev, ...data }))
  }

  const handleProfileComplete = async (profileData) => {
    console.log("[DEBUG][TIME]", new Date().toISOString(), "Profile creation completed:", profileData)

    try {
      // Profile was already created via API in ProfileCreationFlow
      console.log('[PROFILE_FLOW] Profile operation successful')

      // Store profile data in local state
      setAuthData(prev => ({ ...prev, profile: profileData }))

      // The new wait gate effect above will handle the redirect
      // No need to manually redirect here
    } catch (error) {
      console.error('🔐 [AUTH_FLOW] Error saving profile:', error)
      // Show error and stay on the profile page to allow retry
      toast({
        title: 'Failed to save profile',
        description: (error?.message || 'Please try again.'),
        variant: 'destructive'
      })
    }
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
          lastName={authData.lastName}
          isSignUp={authData.isSignUp}
          userData={authData.userData}
          onStepChange={handleStepChange}
        />
      )

    case 'profile':
      return (
        <div className="min-h-screen bg-background">
          <ProfileCreationFlow
            userData={authData}
            onComplete={handleProfileComplete}
          />
        </div>
      )

    case 'forgot-password':
      return (
        <ForgotPassword
          onStepChange={handleStepChange}
          initialEmail={authData.email}
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
