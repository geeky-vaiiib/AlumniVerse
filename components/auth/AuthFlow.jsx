"use client"

import { useState, useEffect, useRef } from "react"
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
  const { updateProfile, userProfile, loading: userLoading } = useUser()
  const [currentStep, setCurrentStep] = useState(initialStep)
  const [authData, setAuthData] = useState({})
  const { toast } = useToast()
  const [redirectTriggered, setRedirectTriggered] = useState(false)
  
  // 🛡️ CRITICAL: One-time redirect guard to prevent infinite loops
  const hasRedirectedRef = useRef(false)
  const isMountedRef = useRef(true)

  // 🧹 CLEANUP: Prevent state updates after unmount
  useEffect(() => {
    console.log("[AUTH_FLOW] 🎬 Component mounted with initialStep:", initialStep)
    isMountedRef.current = true
    
    // 🔧 Listen for route changes to dismiss toasts
    const handleRouteChange = () => {
      console.log("[AUTH_FLOW] 🎯 Route changed, dismissing toasts")
      if (toast?.dismiss) {
        toast.dismiss()
      }
    }
    
    // Use router events if available (Next.js 13+ App Router doesn't have router.events)
    // Instead, we'll rely on unmount cleanup
    
    return () => {
      console.log("[AUTH_FLOW] 🧹 Cleanup: component unmounted")
      isMountedRef.current = false
      // Dismiss all toasts on unmount
      if (toast?.dismiss) {
        toast.dismiss()
      }
    }
  }, [toast, router])

  // 🚨 EARLY REDIRECT: If on auth page with session and redirectTo, redirect immediately
  useEffect(() => {
    if (hasRedirectedRef.current) return
    
    if (typeof window !== 'undefined' && window.location.pathname === '/auth') {
      const urlParams = new URLSearchParams(window.location.search)
      const redirectTo = urlParams.get('redirectTo')
      
      if (redirectTo && session && authReady) {
        console.log("[AUTH_FLOW] 🚨 EARLY REDIRECT: Auth page with session and redirectTo detected")
        hasRedirectedRef.current = true
        
        if (toast?.dismiss) {
          toast.dismiss()
        }
        
        console.log("[AUTH_FLOW] 🎯 Early navigating to:", redirectTo)
        router.replace(redirectTo)
      }
    }
  }, [session, authReady, router, toast])

  useEffect(() => {
    console.log("[AUTH_FLOW][STATE] 📊 State update:", {
      currentStep,
      authReady,
      hasSession: !!session,
      sessionUserId: session?.user?.id,
      hasProfile: !!userProfile,
      profileComplete: userProfile?.is_complete,
      profileId: userProfile?.id,
      userLoading,
      redirectTriggered,
      hasRedirected: hasRedirectedRef.current,
      timestamp: new Date().toISOString()
    })

    if (currentStep === 'otp-verification') {
      console.log("[AUTH_FLOW] 🔐 OTP verification step active")
    }
    
    if (currentStep === 'profile') {
      console.log("[AUTH_FLOW] 👤 Profile creation step active, user:", session?.user?.id)
    }
    
    if (currentStep === 'login-complete') {
      console.log("[AUTH_FLOW] ✅ Login completion step active")
    }
  }, [currentStep, authReady, session, userProfile, userLoading, redirectTriggered])

  // 🛡️ SIMPLIFIED REDIRECT LOGIC - Single source of truth
  useEffect(() => {
    // Skip if component unmounted or already redirected
    if (!isMountedRef.current || hasRedirectedRef.current) {
      return
    }

    console.log("[AUTH_FLOW][REDIRECT_CHECK] 🚦 Checking redirect conditions:", {
      authReady,
      hasSession: !!session,
      hasProfile: !!userProfile,
      profileComplete: userProfile?.is_complete,
      profileCompleted: userProfile?.profileCompleted,
      currentStep,
      userLoading,
      hasRedirected: hasRedirectedRef.current,
      location: typeof window !== 'undefined' ? window.location.href : 'SSR'
    })
    
    // ⛔ Wait until auth is ready
    if (!authReady) {
      console.log("[AUTH_FLOW] ⏳ Waiting for auth to stabilize...")
      return
    }
    
    // 🚨 PRIORITY CHECK: If we have session and redirectTo param, redirect immediately
    // This handles the case where user is sent back to /auth?redirectTo=/dashboard
    if (authReady && session && typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search)
      const redirectTo = urlParams.get('redirectTo')
      
      if (redirectTo && window.location.pathname === '/auth') {
        console.log("[AUTH_FLOW] 🚨 Detected auth page with redirectTo and session - immediate redirect!")
        hasRedirectedRef.current = true
        
        // Dismiss all toasts immediately
        if (toast?.dismiss) {
          console.log("[AUTH_FLOW] 🧹 Dismissing all toasts before redirect")
          toast.dismiss()
        }
        
        console.log("[AUTH_FLOW] ⏳ Waiting 1 second for server session sync...")
        
        // 🔧 CRITICAL FIX: Wait for server session to sync before redirect
        // This prevents middleware from not recognizing the session
        setTimeout(async () => {
          // Verify server has session before redirecting
          try {
            const serverCheck = await fetch('/api/auth/session')
            const serverData = await serverCheck.json()
            console.log("[AUTH_FLOW] 🔍 Server session check:", serverData)
            
            if (serverData.hasSession) {
              console.log("[AUTH_FLOW] ✅ Server session confirmed, redirecting to:", redirectTo)
              router.replace(redirectTo)
            } else {
              console.log("[AUTH_FLOW] ⚠️ Server session not ready, waiting another 500ms...")
              setTimeout(() => {
                console.log("[AUTH_FLOW] 🎯 Final redirect attempt to:", redirectTo)
                router.replace(redirectTo)
              }, 500)
            }
          } catch (err) {
            console.error("[AUTH_FLOW] ❌ Server session check failed, redirecting anyway:", err)
            router.replace(redirectTo)
          }
        }, 1000)
        return
      }
    }
    
    // ⛔ Wait for user profile to load (but not forever)
    if (userLoading && session) {
      console.log("[AUTH_FLOW] ⏳ Waiting for user profile to load...")
      return
    }
    
    // ✅ Condition 1: User has completed profile - redirect to dashboard
    if (authReady && session && (userProfile?.is_complete || userProfile?.profileCompleted)) {
      console.log("[AUTH_FLOW] ✅ Profile complete, initiating redirect")
      hasRedirectedRef.current = true
      
      const urlParams = new URLSearchParams(window.location.search)
      const redirectTo = urlParams.get('redirectTo') || '/dashboard'
      
      // Dismiss all toasts immediately
      if (toast?.dismiss) {
        console.log("[AUTH_FLOW] 🧹 Dismissing all toasts before redirect")
        toast.dismiss()
      }
      
      console.log("[AUTH_FLOW] ⏳ Waiting for server session sync before redirect...")
      
      // Wait for server session to sync
      setTimeout(async () => {
        try {
          const serverCheck = await fetch('/api/auth/session')
          const serverData = await serverCheck.json()
          console.log("[AUTH_FLOW] 🔍 Server session check:", serverData)
          
          if (serverData.hasSession) {
            console.log("[AUTH_FLOW] ✅ Server session confirmed, redirecting to:", redirectTo)
            router.replace(redirectTo)
          } else {
            console.log("[AUTH_FLOW] ⚠️ Server session not ready, waiting another 500ms...")
            setTimeout(() => {
              console.log("[AUTH_FLOW] 🎯 Final redirect to:", redirectTo)
              router.replace(redirectTo)
            }, 500)
          }
        } catch (err) {
          console.error("[AUTH_FLOW] ❌ Server check failed, redirecting anyway:", err)
          router.replace(redirectTo)
        }
      }, 1000)
      return
    }
    
    // ✅ Condition 2: On login-complete step with session - redirect
    if (currentStep === 'login-complete' && session && authReady) {
      console.log("[AUTH_FLOW] ✅ Login complete, initiating redirect")
      hasRedirectedRef.current = true
      
      const urlParams = new URLSearchParams(window.location.search)
      const redirectTo = urlParams.get('redirectTo') || '/dashboard'
      
      // Dismiss all toasts
      if (toast?.dismiss) {
        console.log("[AUTH_FLOW] 🧹 Dismissing all toasts before redirect")
        toast.dismiss()
      }
      
      console.log("[AUTH_FLOW] ⏳ Waiting for server session sync before redirect...")
      
      // Wait for server session to sync
      setTimeout(async () => {
        try {
          const serverCheck = await fetch('/api/auth/session')
          const serverData = await serverCheck.json()
          console.log("[AUTH_FLOW] 🔍 Server session check:", serverData)
          
          if (serverData.hasSession) {
            console.log("[AUTH_FLOW] ✅ Server session confirmed, redirecting to:", redirectTo)
            router.replace(redirectTo)
          } else {
            console.log("[AUTH_FLOW] ⚠️ Server session not ready, waiting another 500ms...")
            setTimeout(() => {
              console.log("[AUTH_FLOW] 🎯 Final redirect to:", redirectTo)
              router.replace(redirectTo)
            }, 500)
          }
        } catch (err) {
          console.error("[AUTH_FLOW] ❌ Server check failed, redirecting anyway:", err)
          router.replace(redirectTo)
        }
      }, 1000)
      return
    }
  }, [authReady, session, userProfile, userLoading, currentStep, router, toast])

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
    console.log("[AUTH_FLOW] 🎉 Profile creation completed:", profileData?.id)

    // Skip if already redirected or unmounted
    if (hasRedirectedRef.current || !isMountedRef.current) {
      console.log("[AUTH_FLOW] ⏭️ Already redirected or unmounted, skipping")
      return
    }

    try {
      // Profile was already created via API in ProfileCreationFlow
      console.log('[AUTH_FLOW] ✅ Profile operation successful, updating local state')

      // Store profile data in local state
      setAuthData(prev => ({ ...prev, profile: profileData }))

      // 🔒 Lock redirect immediately
      hasRedirectedRef.current = true
      
      console.log('[AUTH_FLOW] 🚀 Redirecting after profile completion')
      
      const urlParams = new URLSearchParams(window.location.search)
      const redirectTo = urlParams.get('redirectTo') || '/dashboard'
      
      // Dismiss all existing toasts immediately
      if (toast?.dismiss) {
        console.log('[AUTH_FLOW] 🧹 Dismissing all toasts before redirect')
        toast.dismiss()
      }
      
      console.log('[AUTH_FLOW] 🎯 Navigating to:', redirectTo)
      
      // Small delay to ensure toast is dismissed
      setTimeout(() => {
        router.push(redirectTo)
      }, 100)
      
    } catch (error) {
      console.error('[AUTH_FLOW] 💥 Error saving profile:', error)
      hasRedirectedRef.current = false // Reset on error
      
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

    case 'login-complete':
      // Show loading state while redirect is happening
      return (
        <div className="flex items-center justify-center min-h-screen bg-background">
          <div className="text-center space-y-4">
            <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto" />
            <p className="text-foreground-muted">Logging you in...</p>
            <p className="text-xs text-foreground-muted/60">Please wait...</p>
          </div>
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
