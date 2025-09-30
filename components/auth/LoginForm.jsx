"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { signInUser } from "../../lib/services/authService"
import { isValidInstitutionalEmail } from "../../lib/utils/emailParser"

export default function LoginForm({ onStepChange }) {
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setErrors({})

    // BYPASS: Skip all validation and authentication
    // Just check if basic fields are filled
    if (!formData.email?.trim() || !formData.password) {
      setErrors({ email: "Please fill in both fields" })
      setIsLoading(false)
      return
    }

    // Simulate loading delay then redirect to dashboard
    setTimeout(() => {
      setIsLoading(false)
      // Set demo mode flag in both localStorage and cookie
      if (typeof window !== 'undefined') {
        localStorage.setItem('demoMode', 'true')
        // Set cookie for middleware
        document.cookie = 'demoMode=true; path=/; max-age=86400' // 24 hours
      }
      // Use window.location for reliable navigation (bypasses SSR/router issues)
      try {
        window.location.href = "/dashboard"
      } catch (error) {
        console.error('Navigation error:', error)
        // Fallback navigation method
        if (typeof window !== 'undefined') {
          window.location.replace('/dashboard')
        }
      }
    }, 1000)

    /* ORIGINAL CODE COMMENTED OUT FOR BYPASS
    try {
      // Attempt to sign in user
      const result = await signInUser(formData.email, formData.password)

      if (result.success) {
        // Success - redirect to dashboard
        window.location.href = "/dashboard"
      } else {
        // Handle login errors
        setErrors({ general: result.error })
      }
    } catch (error) {
      console.error('Login error:', error)
      setErrors({ general: 'An unexpected error occurred. Please try again.' })
    } finally {
      setIsLoading(false)
    }
    */
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    // Clear errors for the field being edited
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }))
    }

    // Clear general error when user starts typing
    if (errors.general) {
      setErrors((prev) => ({ ...prev, general: "" }))
    }
  }

  return (
    <Card className="w-full">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
        <CardDescription>Sign in to your alumni account to continue</CardDescription>
        <div className="mt-2 text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded">
          Demo Mode: Enter any email and password
        </div>
      </CardHeader>
      <CardContent>
        {errors.general && (
          <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
            <p className="text-destructive text-sm">{errors.general}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
              Institutional Email *
            </label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="your.email@sit.ac.in"
              className={errors.email ? "border-destructive" : ""}
              required
            />
            {errors.email && <p className="text-destructive text-sm mt-1">{errors.email}</p>}
            <p className="text-foreground-muted text-xs mt-1">Use your @sit.ac.in email address</p>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-foreground mb-2">
              Password *
            </label>
            <Input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              className={errors.password ? "border-destructive" : ""}
              required
            />
            {errors.password && <p className="text-destructive text-sm mt-1">{errors.password}</p>}
          </div>

          <Button type="submit" className="w-full hover-glow" disabled={isLoading}>
            {isLoading ? "Signing In..." : "Sign In"}
          </Button>
        </form>

        <div className="mt-6 space-y-4">
          <button
            onClick={() => onStepChange("forgot")}
            className="text-primary hover:text-primary-hover text-sm font-medium"
          >
            Forgot your password?
          </button>

          <div className="text-center">
            <span className="text-foreground-muted text-sm">New to AlumniVerse? </span>
            <button
              onClick={() => onStepChange("signup")}
              className="text-primary hover:text-primary-hover text-sm font-medium"
            >
              Create an account
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
