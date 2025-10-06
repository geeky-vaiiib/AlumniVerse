"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Mail, ArrowLeft, CheckCircle } from "lucide-react"
import { useAuth } from "../providers/AuthProvider"
import { useToast } from "../../hooks/use-toast"

export default function OTPVerification({
  email,
  firstName,
  lastName,
  isSignUp = false,
  userData = {},
  onStepChange
}) {
  const router = useRouter()
  const { verifyOTP, signUpWithOTP, signInWithOTP, isReady } = useAuth()
  const { toast } = useToast()
  const [otp, setOtp] = useState(["", "", "", "", "", ""])
  const [isLoading, setIsLoading] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [timer, setTimer] = useState(60)
  const [canResend, setCanResend] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [verifyAttempts, setVerifyAttempts] = useState(0)
  const [verifyCooldown, setVerifyCooldown] = useState(0)
  const inputRefs = useRef([])

  // Timer effect
  useEffect(() => {
    if (timer > 0) {
      const interval = setTimeout(() => setTimer(timer - 1), 1000)
      return () => clearTimeout(interval)
    } else {
      setCanResend(true)
    }
  }, [timer])

  // Verification cooldown effect
  useEffect(() => {
    if (verifyCooldown > 0) {
      const interval = setTimeout(() => setVerifyCooldown(verifyCooldown - 1), 1000)
      return () => clearTimeout(interval)
    }
  }, [verifyCooldown])

  // Auto-focus first input
  useEffect(() => {
    inputRefs.current[0]?.focus()
  }, [])

  const handleInputChange = (index, value) => {
    // Only allow digits
    if (!/^\d*$/.test(value)) return

    const newOtp = [...otp]
    newOtp[index] = value

    setOtp(newOtp)
    setError("")

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index, e) => {
    // Handle backspace
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
      return
    }

    // Handle paste
    if (e.key === 'v' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault()
      navigator.clipboard.readText().then(text => {
        const digits = text.replace(/\D/g, '').slice(0, 6)
        if (digits.length === 6) {
          const newOtp = digits.split('')
          setOtp(newOtp)
          inputRefs.current[5]?.focus()
        }
      })
    }
  }

  const handleVerifyOTP = async () => {
    const otpCode = otp.join('')
    
    if (otpCode.length !== 6) {
      setError("Please enter the complete 6-digit code")
      return
    }

    // Rate limiting
    if (verifyAttempts >= 3) {
      setError("Too many attempts. Please wait before trying again.")
      setVerifyCooldown(30)
      return
    }

    setIsLoading(true)
    setError("")

    try {
      console.log('🔐 [TEMP] OTPVerification: Starting verification', { email, isSignUp, hasUserData: !!userData })
      console.log('Verifying OTP via Supabase:', { email })

      // Check if auth service is ready
      if (!isReady) {
        setError("Authentication service is not available. Please try again.")
        return
      }

      // Use enhanced AuthProvider OTP verification with profile creation
      const { data, error: authError } = await verifyOTP(email, otpCode, {
        first_name: firstName,
        last_name: lastName,
        usn: userData?.usn,
        branch: userData?.branch,
        branch_code: userData?.branch_code,
        admission_year: userData?.joining_year,
        passing_year: userData?.passing_year
      })

      console.log('🔐 [TEMP] OTPVerification: Verification result', { 
        success: !authError && !!data, 
        hasUser: !!(data?.user),
        error: authError?.message 
      })

      if (!authError && data && data.user) {
        setSuccess("✅ Email verified successfully!")

        // Show success toast
        toast({
          title: "Verification Successful! 🎉",
          description: "Your email has been verified. Redirecting...",
          variant: "default",
        })

        // Small delay to show success message
        setTimeout(() => {
          console.log('🔐 [TEMP] OTPVerification: Initiating redirect', { isSignUp })
          console.log('OTP verification successful')
          // Clear any pending session storage
          sessionStorage.removeItem('pendingVerificationEmail')
          sessionStorage.removeItem('pendingFirstName')
          sessionStorage.removeItem('pendingLastName')
          sessionStorage.removeItem('pendingUSN')
          sessionStorage.removeItem('pendingBranch')
          sessionStorage.removeItem('pendingJoiningYear')
          sessionStorage.removeItem('pendingPassingYear')
          
          // FIXED: Use router navigation instead of hard window.location redirect
          // This prevents middleware redirect loops and preserves SPA state
          console.log('🔐 [TEMP] OTPVerification: Using router.push instead of window.location')
          if (isSignUp) {
            // For new signups, go to profile creation
            console.log('🔐 [TEMP] OTPVerification: Redirecting to profile creation')
            onStepChange('profile', { email, firstName, lastName, isSignUp, userData })
          } else {
            // For existing users (login), go directly to dashboard
            console.log('🔐 [TEMP] OTPVerification: Redirecting to dashboard')
            router.push('/dashboard')
          }
        }, 1500)
      } else {
        setVerifyAttempts(prev => prev + 1)
        setError(authError?.message || "Verification failed. Please check your code and try again.")

        // Clear OTP inputs on error
        setOtp(["", "", "", "", "", ""])
        inputRefs.current[0]?.focus()
      }
    } catch (error) {
      console.error('OTP verification error:', error)
      setVerifyAttempts(prev => prev + 1)
      setError("Verification failed. Please try again.")
      
      // Clear OTP inputs on error
      setOtp(["", "", "", "", "", ""])
      inputRefs.current[0]?.focus()
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendOTP = async () => {
    if (!canResend || isResending) return

    setIsResending(true)
    setError("")

    try {
      // Check if auth service is ready
      if (!isReady) {
        setError("Authentication service is not available. Please try again.")
        return
      }

      const { data, error } = isSignUp
        ? await signUpWithOTP(email, userData)
        : await signInWithOTP(email)

      if (!error && data) {
        setSuccess("✅ New code sent to your email!")
        setTimer(60)
        setCanResend(false)
        setVerifyAttempts(0) // Reset attempts on resend

        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(""), 3000)
      } else {
        setError(error?.message || "Failed to resend code. Please try again.")
      }
    } catch (error) {
      console.error('Resend OTP error:', error)
      setError("Failed to resend code. Please try again.")
    } finally {
      setIsResending(false)
    }
  }

  const handleBackToLogin = () => {
    if (onStepChange) {
      onStepChange('login')
    } else {
      router.push('/login')
    }
  }

  return (
    <div className="flex items-center justify-center p-4 py-12">
      <Card className="w-full max-w-md bg-surface border-border">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto w-12 h-12 bg-[#4A90E2]/20 rounded-full flex items-center justify-center mb-4">
            <Mail className="w-6 h-6 text-[#4A90E2]" />
          </div>
          <CardTitle className="text-2xl font-bold text-white">
            Verify Your Email
          </CardTitle>
          <CardDescription className="text-[#B0B0B0]">
            We've sent a 6-digit code to<br />
            <span className="font-medium text-[#4A90E2]">{email}</span>
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* OTP Input Grid */}
          <div className="flex justify-center space-x-3">
            {otp.map((digit, index) => (
              <Input
                key={index}
                ref={el => inputRefs.current[index] = el}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleInputChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="w-12 h-12 text-center text-xl font-bold bg-[#1A1A1A] border-[#404040] text-white focus:border-[#4A90E2] focus:ring-[#4A90E2]/20"
                disabled={isLoading}
              />
            ))}
          </div>

          {/* Error Message */}
          {error && (
            <div className="text-red-400 text-sm text-center bg-red-400/10 border border-red-400/20 rounded-lg p-3">
              {error}
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="text-green-400 text-sm text-center bg-green-400/10 border border-green-400/20 rounded-lg p-3 flex items-center justify-center space-x-2">
              <CheckCircle className="w-4 h-4" />
              <span>{success}</span>
            </div>
          )}

          {/* Verify Button */}
          <Button
            onClick={handleVerifyOTP}
            disabled={isLoading || otp.join('').length !== 6 || verifyCooldown > 0}
            className="w-full bg-[#4A90E2] hover:bg-[#357ABD] text-white font-medium py-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Verifying...</span>
              </div>
            ) : verifyCooldown > 0 ? (
              `Wait ${verifyCooldown}s`
            ) : (
              "Verify Email"
            )}
          </Button>

          {/* Resend Code */}
          <div className="text-center space-y-2">
            <p className="text-[#B0B0B0] text-sm">
              Didn't receive the code?
            </p>
            <Button
              variant="ghost"
              onClick={handleResendOTP}
              disabled={!canResend || isResending}
              className="text-[#4A90E2] hover:text-[#357ABD] hover:bg-[#4A90E2]/10 font-medium"
            >
              {isResending ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-[#4A90E2]/30 border-t-[#4A90E2] rounded-full animate-spin" />
                  <span>Sending...</span>
                </div>
              ) : canResend ? (
                "Resend Code"
              ) : (
                `Resend in ${timer}s`
              )}
            </Button>
          </div>

          {/* Back to Login */}
          <Button
            variant="ghost"
            onClick={handleBackToLogin}
            className="w-full text-[#B0B0B0] hover:text-white hover:bg-[#404040] flex items-center justify-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Login</span>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
