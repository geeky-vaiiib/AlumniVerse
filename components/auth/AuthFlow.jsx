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
  const { session, loading, isLoggedIn, isReady } = useAuth()
  const { updateProfile, userProfile } = useUser()
  const [currentStep, setCurrentStep] = useState(initialStep)
  const [authData, setAuthData] = useState({})
  const { toast } = useToast()
  const [hasRedirected, setHasRedirected] = useState(false)

  // Only log state changes, not every render
  const stateKey = `${loading}-${isLoggedIn}-${!!session}-${currentStep}-${isReady}`
  const [lastStateKey, setLastStateKey] = useState('')
  
  if (stateKey !== lastStateKey) {
    console.log('AuthFlow: State changed -', {
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

  // Handle redirect with URL parameters - ONLY when authenticated
  useEffect(() => {
    // Wait for auth to be ready before attempting redirects
    if (!isReady || loading) {
      console.log('AuthFlow: Waiting for auth to be ready...', { isReady, loading })
      return
    }

    if (hasRedirected) return // Prevent multiple redirects

    // Get redirect URL from search params
    const urlParams = new URLSearchParams(window.location.search)
    const redirectTo = urlParams.get('redirectTo') || null
    
    // CRITICAL: Only redirect if user is actually authenticated
    const isAuthenticated = !!(session?.user || isLoggedIn)
    
    console.log('AuthFlow: Auth check effect triggered', { 
      isLoggedIn, 
      hasSession: !!session, 
      isAuthenticated,
      currentStep,
      redirectTo,
      isReady,
      hasProfile: !!userProfile
    })

    // If user is authenticated and there's a redirect target
    if (isAuthenticated && redirectTo) {
      // Don't redirect if we're in the OTP verification step (let it complete naturally)
      if (currentStep === 'otp-verification') {
        console.log('AuthFlow: In OTP verification, skipping redirect')
        return
      }
      
      // Redirect authenticated user away from auth page
      console.log('AuthFlow: User authenticated, redirecting to:', redirectTo)
      setHasRedirected(true)
      // Use Next.js router for SPA navigation
      router.replace(redirectTo)
    }
  }, [session, isLoggedIn, currentStep, isReady, loading, hasRedirected, userProfile])

  const handleStepChange = (step, data = {}) => {
    console.log('Step change:', step, data)
    setCurrentStep(step)
    setAuthData(prev => ({ ...prev, ...data }))
  }

  const handleProfileComplete = async (profileData) => {
    console.log('Profile creation completed:', profileData)

    try {
      // Profile was already created via API in ProfileCreationFlow
      console.log('Profile saved successfully')

      // Store profile data in local state
      setAuthData(prev => ({ ...prev, profile: profileData }))

      // Get redirect URL from search params
      const urlParams = new URLSearchParams(window.location.search)
      const redirectTo = urlParams.get('redirectTo') || '/dashboard'

      console.log('AuthFlow: Profile completed, ensuring profile refresh then redirecting to:', redirectTo)

      // Ensure the user context / profile is refreshed before navigation
      if (typeof updateProfile === 'function') {
        try {
          // Update the profile context with the new data
          await updateProfile(profileData)
          console.log('AuthFlow: Profile context updated successfully')
        } catch (err) {
          console.warn('AuthFlow: Profile context update failed (continuing to redirect):', err)
        }
      }

      // Use Next router to avoid hard reloads and preserve client session state
      console.log('AuthFlow: Using Next.js router for navigation to:', redirectTo)
      router.replace(redirectTo)
    } catch (error) {
      console.error('Error saving profile:', error)
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
