"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { GraduationCap, Mail } from "lucide-react"
import { useAuth } from "../providers/AuthProvider"

export default function LoginForm({ onStepChange }) {
  const { signInWithPassword, signInWithOTP, isReady } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [submitCooldown, setSubmitCooldown] = useState(0)
  const [loginMethod, setLoginMethod] = useState("password") // "password" or "otp"

  // Cooldown timer effect
  useEffect(() => {
    if (submitCooldown > 0) {
      const timer = setTimeout(() => {
        setSubmitCooldown(prev => prev - 1)
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [submitCooldown])

  const handleInputChange = (field, value) => {
    if (field === 'email') {
      setEmail(value)
    } else if (field === 'password') {
      setPassword(value)
    }
    if (error) {
      setError("")
    }
  }

  const validateForm = () => {
    if (!email.trim()) {
      setError("Email is required")
      return false
    }

    if (!email.endsWith('@sit.ac.in')) {
      setError("Please use your SIT institutional email (@sit.ac.in)")
      return false
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address")
      return false
    }

    if (loginMethod === "password" && !password.trim()) {
      setError("Password is required")
      return false
    }

    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Check cooldown
    if (submitCooldown > 0) {
      setError(`Please wait ${submitCooldown} seconds before trying again`)
      return
    }

    if (!validateForm()) return

    setIsLoading(true)
    setError("")

    try {
      // Check if auth service is ready
      if (!isReady) {
        setError("Authentication service is not available. Please try again.")
        return
      }

      if (loginMethod === "password") {
        console.log('Signing in with password for:', email)
        
        // Sign in with email and password
        const { data, error: authError } = await signInWithPassword(
          email.trim().toLowerCase(),
          password
        )

        if (authError) {
          console.error('Password login error:', authError)
          
          if (authError.code === 'invalid_credentials') {
            setError("Invalid email or password. If you signed up with OTP only, try 'Sign in with OTP'.")
          } else if (authError.message?.includes('Email not confirmed')) {
            setError("Please verify your email address first.")
          } else if (authError.message?.includes('rate limit')) {
            setError("Too many attempts. Please wait before trying again.")
            setSubmitCooldown(60)
          } else {
            setError(authError.message || "Login failed")
          }
          return
        }

        console.log('Password login successful, redirecting to dashboard...')
        // Redirect handled by AuthFlow
        
      } else {
        console.log('Sending login OTP to:', email)

        // Send OTP using Supabase Auth
        const { data, error: authError } = await signInWithOTP(
          email.trim().toLowerCase()
        )

        if (authError) {
          console.error('OTP login error:', authError)
          
          if (authError.message?.includes('not found') || authError.message?.includes('invalid')) {
            setError("No account found with this email. Please sign up first.")
          } else if (authError.message?.includes('rate limit')) {
            setError("Too many attempts. Please wait before trying again.")
            setSubmitCooldown(60)
          } else {
            setError(authError.message || "Failed to send verification code")
          }
          return
        }

        console.log('Login OTP sent successfully:', data)

        // Store email for OTP verification
        sessionStorage.setItem('pendingVerificationEmail', email.trim().toLowerCase())

        // Set cooldown for resend
        setSubmitCooldown(18)

        // Move to OTP verification step
        onStepChange('otp-verification', {
          email: email.trim().toLowerCase(),
          isSignUp: false
        })
      }

    } catch (error) {
      console.error('Unexpected error:', error)
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center p-4 py-12">
      <Card className="w-full max-w-md bg-surface border-border shadow-2xl">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-[#4A90E2]/10 rounded-full flex items-center justify-center">
            <GraduationCap className="w-8 h-8 text-[#4A90E2]" />
          </div>
          <CardTitle className="text-2xl font-bold text-white">
            Welcome Back
          </CardTitle>
          <CardDescription className="text-[#B0B0B0]">
            Sign in to your AlumniVerse account
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Login Method Toggle */}
          <div className="flex bg-[#404040] rounded-lg p-1">
            <button
              type="button"
              onClick={() => setLoginMethod("password")}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                loginMethod === "password"
                  ? "bg-[#4A90E2] text-white"
                  : "text-[#B0B0B0] hover:text-white"
              }`}
            >
              Password
            </button>
            <button
              type="button"
              onClick={() => setLoginMethod("otp")}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                loginMethod === "otp"
                  ? "bg-[#4A90E2] text-white"
                  : "text-[#B0B0B0] hover:text-white"
              }`}
            >
              OTP
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#E0E0E0]">
                SIT Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#B0B0B0]" />
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="bg-[#404040] border-[#606060] text-white placeholder-[#B0B0B0] focus:border-[#4A90E2] pl-10"
                  placeholder="your.email@sit.ac.in"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Password Field (only for password login) */}
            {loginMethod === "password" && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#E0E0E0]">
                  Password
                </label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className="bg-[#404040] border-[#606060] text-white placeholder-[#B0B0B0] focus:border-[#4A90E2]"
                  placeholder="Enter your password"
                  disabled={isLoading}
                />
              </div>
            )}

            {/* Error Message */}
            {error && (
              <p className="text-red-400 text-sm">{error}</p>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading || submitCooldown > 0}
              className="w-full h-12 text-base font-semibold bg-[#4A90E2] hover:bg-[#4A90E2]/90 transition-all duration-200"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  {loginMethod === "password" ? "Signing in..." : "Sending code..."}
                </div>
              ) : submitCooldown > 0 ? (
                `Wait ${submitCooldown}s`
              ) : loginMethod === "password" ? (
                "Sign In"
              ) : (
                "Send Verification Code"
              )}
            </Button>
          </form>

          {/* Info Box */}
          <div className="bg-[#4A90E2]/10 border border-[#4A90E2]/30 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-[#4A90E2] mt-0.5 flex-shrink-0" />
              <div className="space-y-1">
                <h4 className="text-sm font-medium text-[#4A90E2]">
                  {loginMethod === "password" ? "Password Login" : "OTP Login"}
                </h4>
                <p className="text-xs text-[#B0B0B0]">
                  {loginMethod === "password" 
                    ? "Sign in with the password you set during registration."
                    : "We'll send a 6-digit verification code to your email."
                  }
                </p>
              </div>
            </div>
          </div>

          {/* Sign Up Link */}
          <div className="text-center">
            <p className="text-[#B0B0B0] text-sm">
              Don't have an account?{" "}
              <button
                onClick={() => onStepChange('signup')}
                className="text-[#4A90E2] hover:underline font-medium"
                disabled={isLoading}
              >
                Sign up
              </button>
            </p>
          </div>

          {/* Help Text */}
          <div className="text-center">
            <p className="text-[#808080] text-xs">
              Having trouble? Make sure you're using your SIT institutional email address.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
