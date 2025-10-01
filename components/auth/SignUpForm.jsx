"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { GraduationCap, Mail, AlertCircle, Eye, EyeOff, Lock } from "lucide-react"
import { useAuth } from "../providers/AuthProvider"
import { parseInstitutionalEmail } from "../../lib/utils/emailParser"

export default function SignUpForm({ onStepChange }) {
  const { signUpWithOTP, isReady, error: authError } = useAuth()
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [extractedData, setExtractedData] = useState(null)
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [submitCooldown, setSubmitCooldown] = useState(0)

  // Cooldown timer effect
  useEffect(() => {
    if (submitCooldown > 0) {
      const timer = setTimeout(() => {
        setSubmitCooldown(prev => prev - 1)
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [submitCooldown])

  // Auto-extract data when email changes
  useEffect(() => {
    if (formData.email && formData.email.includes('@')) {
      try {
        const parsed = parseInstitutionalEmail(formData.email)
        setExtractedData(parsed)
        setErrors(prev => ({ ...prev, email: "" }))
      } catch (error) {
        setExtractedData(null)
        if (formData.email.includes('@sit.ac.in')) {
          setErrors(prev => ({ ...prev, email: error.message }))
        }
      }
    } else {
      setExtractedData(null)
    }
  }, [formData.email])

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    // Validate required fields
    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required"
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required"
    }
    if (!formData.email.trim()) {
      newErrors.email = "Email is required"
    }

    // Validate email format and domain
    if (formData.email && !formData.email.endsWith('@sit.ac.in')) {
      newErrors.email = "Please use your SIT institutional email (@sit.ac.in)"
    }

    // Validate password
    if (!formData.password) {
      newErrors.password = "Password is required"
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters"
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = "Password must contain uppercase, lowercase, and number"
    }

    // Validate confirm password
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password"
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match"
    }

    // Validate extracted data
    if (formData.email.endsWith('@sit.ac.in') && !extractedData) {
      newErrors.email = "Invalid SIT email format. Please use format: 1si23cs001@sit.ac.in"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Check cooldown
    if (submitCooldown > 0) {
      setErrors({ submit: `Please wait ${submitCooldown} seconds before trying again` })
      return
    }

    if (!validateForm()) return

    setIsLoading(true)
    setErrors({})

    try {
      // Prepare metadata from extracted USN data
      const metadata = {
        first_name: formData.firstName.trim(),
        last_name: formData.lastName.trim(),
        usn: extractedData?.usn || '',
        branch: extractedData?.branch || '',
        joining_year: extractedData?.joiningYear || null,
        passing_year: extractedData?.passingYear || null,
        branch_code: extractedData?.branchCode || ''
      }

      console.log('Sending OTP with metadata:', metadata)

      // Check if auth service is ready
      if (!isReady) {
        setErrors({ submit: "Authentication service is not available. Please try again." })
        return
      }

      // Send OTP using Supabase Auth
      const { data, error } = await signUpWithOTP(
        formData.email.trim().toLowerCase(),
        metadata
      )

      if (error) {
        console.error('Signup error:', error)
        
        if (error.message?.includes('already registered')) {
          setErrors({ email: "This email is already registered. Try signing in instead." })
        } else if (error.message?.includes('rate limit')) {
          setErrors({ submit: "Too many attempts. Please wait before trying again." })
          setSubmitCooldown(60)
        } else {
          setErrors({ submit: error.message || "Failed to send verification code" })
        }
        return
      }

      console.log('OTP sent successfully:', data)

      // Store user data in sessionStorage for the OTP verification
      sessionStorage.setItem('pendingVerificationEmail', formData.email.trim().toLowerCase())
      sessionStorage.setItem('pendingFirstName', formData.firstName.trim())
      sessionStorage.setItem('pendingLastName', formData.lastName.trim())
      if (extractedData) {
        sessionStorage.setItem('pendingUSN', extractedData.usn || '')
        sessionStorage.setItem('pendingBranch', extractedData.branch || '')
        sessionStorage.setItem('pendingJoiningYear', extractedData.joiningYear || '')
        sessionStorage.setItem('pendingPassingYear', extractedData.passingYear || '')
      }

      // Move to OTP verification step
      onStepChange('otp-verification', {
        email: formData.email.trim().toLowerCase(),
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        password: formData.password,
        isSignUp: true,
        userData: metadata
      })

    } catch (error) {
      console.error('Unexpected error:', error)
      setErrors({ submit: "An unexpected error occurred. Please try again." })
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
            Join AlumniVerse
          </CardTitle>
          <CardDescription className="text-[#B0B0B0]">
            Connect with your SIT alumni network
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* First Name */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#E0E0E0]">
                First Name
              </label>
              <Input
                type="text"
                value={formData.firstName}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
                className="bg-[#404040] border-[#606060] text-white placeholder-[#B0B0B0] focus:border-[#4A90E2]"
                placeholder="Enter your first name"
                disabled={isLoading}
              />
              {errors.firstName && (
                <p className="text-red-400 text-sm">{errors.firstName}</p>
              )}
            </div>

            {/* Last Name */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#E0E0E0]">
                Last Name
              </label>
              <Input
                type="text"
                value={formData.lastName}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
                className="bg-[#404040] border-[#606060] text-white placeholder-[#B0B0B0] focus:border-[#4A90E2]"
                placeholder="Enter your last name"
                disabled={isLoading}
              />
              {errors.lastName && (
                <p className="text-red-400 text-sm">{errors.lastName}</p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#E0E0E0]">
                SIT Email Address
              </label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="bg-[#404040] border-[#606060] text-white placeholder-[#B0B0B0] focus:border-[#4A90E2]"
                placeholder="1si23cs001@sit.ac.in"
                disabled={isLoading}
              />
              {errors.email && (
                <p className="text-red-400 text-sm">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#E0E0E0]">
                Password
              </label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className="bg-[#404040] border-[#606060] text-white placeholder-[#B0B0B0] focus:border-[#4A90E2] pr-10"
                  placeholder="Create a strong password"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#B0B0B0] hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-400 text-sm">{errors.password}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#E0E0E0]">
                Confirm Password
              </label>
              <div className="relative">
                <Input
                  type={showConfirmPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  className="bg-[#404040] border-[#606060] text-white placeholder-[#B0B0B0] focus:border-[#4A90E2] pr-10"
                  placeholder="Confirm your password"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#B0B0B0] hover:text-white"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-red-400 text-sm">{errors.confirmPassword}</p>
              )}
            </div>

            {/* Extracted Data Display */}
            {extractedData && (
              <div className="bg-[#4A90E2]/10 border border-[#4A90E2]/30 rounded-lg p-4 space-y-2">
                <h4 className="text-sm font-medium text-[#4A90E2]">
                  Detected Information:
                </h4>
                <div className="grid grid-cols-2 gap-2 text-sm text-[#E0E0E0]">
                  <div>USN: <span className="text-[#4A90E2]">{extractedData.usn}</span></div>
                  <div>Branch: <span className="text-[#4A90E2]">{extractedData.branch}</span></div>
                  <div>Joining: <span className="text-[#4A90E2]">{extractedData.joiningYear}</span></div>
                  <div>Passing: <span className="text-[#4A90E2]">{extractedData.passingYear}</span></div>
                </div>
              </div>
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
                  Sending verification code...
                </div>
              ) : submitCooldown > 0 ? (
                `Wait ${submitCooldown}s`
              ) : (
                "Send Verification Code"
              )}
            </Button>

            {/* Error Display */}
            {errors.submit && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                <p className="text-red-400 text-sm">{errors.submit}</p>
              </div>
            )}
          </form>

          {/* Sign In Link */}
          <div className="text-center">
            <p className="text-[#B0B0B0] text-sm">
              Already have an account?{" "}
              <button
                onClick={() => onStepChange('signin')}
                className="text-[#4A90E2] hover:underline font-medium"
                disabled={isLoading}
              >
                Sign in
              </button>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
