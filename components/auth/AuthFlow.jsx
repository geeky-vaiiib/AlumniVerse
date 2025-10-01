"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import LoginForm from "./LoginForm"
import SignUpForm from "./SignUpForm"
import OTPVerification from "./OTPVerification"
import ProfileCreationFlow from "./ProfileCreationFlow"
import { useAuth } from "../providers/AuthProvider"
import { useUser } from "../../contexts/UserContext"

export default function AuthFlow({ initialStep = 'login' }) {
  const router = useRouter()
  const { session, loading, isLoggedIn, isReady } = useAuth()
  const { updateProfile } = useUser()
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

  // Simple auth check - only redirect if not in profile creation step
  useEffect(() => {
    console.log('AuthFlow: Auth check effect triggered', { isLoggedIn, hasSession: !!session, currentStep })

    // Don't redirect if we're in the profile creation step
    if ((isLoggedIn || session?.user) && currentStep !== 'profile' && currentStep !== 'otp-verification') {
      console.log('AuthFlow: User authenticated, redirecting to dashboard')
      router.push('/dashboard')
    }
  }, [session, isLoggedIn, router, currentStep])

  const handleStepChange = (step, data = {}) => {
    console.log('Step change:', step, data)
    setCurrentStep(step)
    setAuthData(prev => ({ ...prev, ...data }))
  }

  const handleProfileComplete = async (profileData) => {
    console.log('Profile creation completed:', profileData)

    try {
      // Update user profile in Supabase
      await updateProfile({
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        usn: profileData.usn,
        branch: profileData.branch,
        joiningYear: profileData.joiningYear,
        passingYear: profileData.passingYear,
        currentCompany: profileData.currentCompany,
        designation: profileData.designation,
        location: profileData.location,
        linkedinUrl: profileData.linkedinUrl,
        githubUrl: profileData.githubUrl,
        leetcodeUrl: profileData.leetcodeUrl,
        resumeUrl: profileData.resumeUrl,
        bio: profileData.bio,
        skills: profileData.skills ? profileData.skills.split(',').map(s => s.trim()) : [],
        profileCompleted: true,
        profileCompletion: 100
      })

      console.log('Profile saved successfully')

      // Store profile data in local state
      setAuthData(prev => ({ ...prev, profile: profileData }))

      // Redirect to dashboard
      router.push('/dashboard')
    } catch (error) {
      console.error('Error saving profile:', error)
      // Still redirect to dashboard even if there's an error
      router.push('/dashboard')
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

    default:
      return (
        <LoginForm
          onStepChange={handleStepChange}
        />
      )
  }
}
