"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Mail, ArrowLeft, GraduationCap } from "lucide-react"
import { useAuth } from "../providers/AuthProvider"

export default function ForgotPassword({ onStepChange, initialEmail = "" }) {
  const { resetPassword, isReady } = useAuth()
  const [email, setEmail] = useState(initialEmail)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const validateEmail = () => {
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

    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateEmail()) return

    setIsLoading(true)
    setError("")

    try {
      if (!isReady) {
        setError("Authentication service is not available. Please try again.")
        return
      }

      const { data, error: authError } = await resetPassword(email.trim().toLowerCase())

      if (authError) {
        console.error('Reset password error:', authError)
        setError(authError.message || "Failed to send reset email")
        return
      }

      console.log('Reset password email sent:', data)
      setIsSubmitted(true)

    } catch (error) {
      console.error('Unexpected error:', error)
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  if (isSubmitted) {
    return (
      <div className="flex items-center justify-center p-4 py-12">
        <Card className="w-full max-w-md bg-surface border-border shadow-2xl">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center">
              <Mail className="w-8 h-8 text-green-500" />
            </div>
            <CardTitle className="text-2xl font-bold text-white">Check Your Email</CardTitle>
            <CardDescription className="text-[#B0B0B0]">
              We've sent password reset instructions to <strong className="text-white">{email}</strong>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
              <p className="text-sm text-[#B0B0B0] text-center">
                Please check your email and follow the instructions to reset your password.
                The link will expire in 1 hour.
              </p>
            </div>
            <Button 
              onClick={() => onStepChange("login")} 
              variant="outline" 
              className="w-full bg-transparent border-[#606060] text-white hover:bg-[#404040]"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center p-4 py-12">
      <Card className="w-full max-w-md bg-surface border-border shadow-2xl">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-[#4A90E2]/10 rounded-full flex items-center justify-center">
            <GraduationCap className="w-8 h-8 text-[#4A90E2]" />
          </div>
          <CardTitle className="text-2xl font-bold text-white">Reset Password</CardTitle>
          <CardDescription className="text-[#B0B0B0]">
            Enter your email address and we'll send you a link to reset your password
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#E0E0E0]">
                SIT Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#B0B0B0]" />
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-[#404040] border-[#606060] text-white placeholder-[#B0B0B0] focus:border-[#4A90E2] pl-10"
                  placeholder="your.email@sit.ac.in"
                  disabled={isLoading}
                />
              </div>
              {error && (
                <p className="text-red-400 text-sm">{error}</p>
              )}
            </div>

            <Button 
              type="submit" 
              disabled={isLoading || !email.trim()}
              className="w-full h-12 text-base font-semibold bg-[#4A90E2] hover:bg-[#4A90E2]/90 transition-all duration-200"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Sending reset link...
                </div>
              ) : (
                "Send Reset Link"
              )}
            </Button>
          </form>

          <div className="text-center">
            <button 
              onClick={() => onStepChange("login")} 
              className="text-[#B0B0B0] hover:text-white text-sm flex items-center justify-center gap-2 mx-auto"
              disabled={isLoading}
            >
              <ArrowLeft className="w-4 h-4" />
              Back to login
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
