"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Lock, Eye, EyeOff, GraduationCap, CheckCircle } from "lucide-react"
import { useAuth } from "../../components/providers/AuthProvider"

export default function ResetPasswordPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { updatePassword, isReady } = useAuth()
  
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  // Check if we have the required tokens from the URL
  useEffect(() => {
    const accessToken = searchParams.get('access_token')
    const refreshToken = searchParams.get('refresh_token')
    
    if (!accessToken || !refreshToken) {
      setError("Invalid or expired reset link. Please request a new password reset.")
    }
  }, [searchParams])

  const validatePassword = () => {
    if (!password.trim()) {
      setError("Password is required")
      return false
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long")
      return false
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return false
    }

    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validatePassword()) return

    setIsLoading(true)
    setError("")

    try {
      if (!isReady) {
        setError("Authentication service is not available. Please try again.")
        return
      }

      const { data, error: authError } = await updatePassword(password)

      if (authError) {
        console.error('Update password error:', authError)
        setError(authError.message || "Failed to update password")
        return
      }

      console.log('Password updated successfully:', data)
      setIsSuccess(true)

      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push('/login')
      }, 3000)

    } catch (error) {
      console.error('Unexpected error:', error)
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-surface border-border shadow-2xl">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
            <CardTitle className="text-2xl font-bold text-white">Password Updated</CardTitle>
            <CardDescription className="text-[#B0B0B0]">
              Your password has been successfully updated
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
              <p className="text-sm text-[#B0B0B0] text-center">
                You can now sign in with your new password. 
                Redirecting to login page...
              </p>
            </div>
            <Button 
              onClick={() => router.push('/login')}
              className="w-full h-12 text-base font-semibold bg-[#4A90E2] hover:bg-[#4A90E2]/90"
            >
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-surface border-border shadow-2xl">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-[#4A90E2]/10 rounded-full flex items-center justify-center">
            <GraduationCap className="w-8 h-8 text-[#4A90E2]" />
          </div>
          <CardTitle className="text-2xl font-bold text-white">Set New Password</CardTitle>
          <CardDescription className="text-[#B0B0B0]">
            Enter your new password below
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* New Password */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#E0E0E0]">
                New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#B0B0B0]" />
                <Input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-[#404040] border-[#606060] text-white placeholder-[#B0B0B0] focus:border-[#4A90E2] pl-10 pr-10"
                  placeholder="Enter new password"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#B0B0B0] hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#E0E0E0]">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#B0B0B0]" />
                <Input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="bg-[#404040] border-[#606060] text-white placeholder-[#B0B0B0] focus:border-[#4A90E2] pl-10 pr-10"
                  placeholder="Confirm new password"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#B0B0B0] hover:text-white"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <p className="text-red-400 text-sm">{error}</p>
            )}

            {/* Submit Button */}
            <Button 
              type="submit" 
              disabled={isLoading || !password.trim() || !confirmPassword.trim()}
              className="w-full h-12 text-base font-semibold bg-[#4A90E2] hover:bg-[#4A90E2]/90 transition-all duration-200"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Updating password...
                </div>
              ) : (
                "Update Password"
              )}
            </Button>
          </form>

          {/* Password Requirements */}
          <div className="bg-[#4A90E2]/10 border border-[#4A90E2]/30 rounded-lg p-4">
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-[#4A90E2]">
                Password Requirements
              </h4>
              <ul className="text-xs text-[#B0B0B0] space-y-1">
                <li>• At least 8 characters long</li>
                <li>• Must match confirmation password</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
