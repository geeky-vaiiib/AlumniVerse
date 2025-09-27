"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { signUpUser } from "../../lib/services/authService"
import { parseInstitutionalEmail, validateSignupData } from "../../lib/utils/emailParser"

export default function SignUpForm({ onStepChange }) {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [extractedData, setExtractedData] = useState(null)
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)

  // Auto-extract data when email changes
  useEffect(() => {
    if (formData.email && formData.email.includes('@')) {
      const parsed = parseInstitutionalEmail(formData.email)
      if (parsed.isValid) {
        setExtractedData(parsed)
        // Clear email error if parsing is successful
        if (errors.email) {
          setErrors(prev => ({ ...prev, email: '' }))
        }
      } else {
        setExtractedData(null)
      }
    } else {
      setExtractedData(null)
    }
  }, [formData.email])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setErrors({})

    // Comprehensive validation
    const validation = validateSignupData(formData)

    // Additional validation for confirm password
    if (formData.password !== formData.confirmPassword) {
      validation.errors.confirmPassword = "Passwords do not match"
      validation.isValid = false
    }

    if (!validation.isValid) {
      setErrors(validation.errors)
      setIsLoading(false)
      return
    }

    try {
      // Attempt to sign up user
      const result = await signUpUser(formData)

      if (result.success) {
        // Success - redirect to dashboard or show success message
        if (result.data.needsEmailVerification) {
          onStepChange("otp", {
            email: formData.email,
            message: "Please check your email for verification link"
          })
        } else {
          // Redirect to dashboard
          window.location.href = "/dashboard"
        }
      } else {
        // Handle signup errors
        if (result.errors) {
          setErrors(result.errors)
        } else {
          setErrors({ general: result.error })
        }
      }
    } catch (error) {
      console.error('Signup error:', error)
      setErrors({ general: 'An unexpected error occurred. Please try again.' })
    } finally {
      setIsLoading(false)
    }
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
        <CardTitle className="text-2xl font-bold">Join AlumniVerse</CardTitle>
        <CardDescription>Create your account to start networking with fellow alumni</CardDescription>
      </CardHeader>
      <CardContent>
        {errors.general && (
          <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
            <p className="text-destructive text-sm">{errors.general}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-foreground mb-2">
                First Name *
              </label>
              <Input
                id="firstName"
                name="firstName"
                type="text"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="John"
                className={errors.firstName ? "border-destructive" : ""}
                required
              />
              {errors.firstName && <p className="text-destructive text-sm mt-1">{errors.firstName}</p>}
            </div>

            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-foreground mb-2">
                Last Name *
              </label>
              <Input
                id="lastName"
                name="lastName"
                type="text"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Doe"
                className={errors.lastName ? "border-destructive" : ""}
                required
              />
              {errors.lastName && <p className="text-destructive text-sm mt-1">{errors.lastName}</p>}
            </div>
          </div>

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
              placeholder="1si23is117@sit.ac.in"
              className={errors.email ? "border-destructive" : ""}
              required
            />
            {errors.email && <p className="text-destructive text-sm mt-1">{errors.email}</p>}
            <p className="text-foreground-muted text-xs mt-1">Only institutional emails (@sit.ac.in) are accepted</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
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
                placeholder="Enter strong password"
                className={errors.password ? "border-destructive" : ""}
                required
              />
              {errors.password && <p className="text-destructive text-sm mt-1">{errors.password}</p>}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-foreground mb-2">
                Confirm Password *
              </label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm password"
                className={errors.confirmPassword ? "border-destructive" : ""}
                required
              />
              {errors.confirmPassword && <p className="text-destructive text-sm mt-1">{errors.confirmPassword}</p>}
            </div>
          </div>

          <div className="text-xs text-foreground-muted space-y-1">
            <p>Password must contain:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>At least 8 characters</li>
              <li>One uppercase letter</li>
              <li>One lowercase letter</li>
              <li>One number</li>
              <li>One special character</li>
            </ul>
          </div>

          {/* Auto-extracted student details */}
          {extractedData && (
            <div className="bg-success/10 border border-success/20 rounded-md p-4 space-y-3">
              <h4 className="text-sm font-medium text-success">Auto-extracted Details:</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-foreground-muted">USN:</span>
                  <span className="ml-2 font-medium">{extractedData.usn}</span>
                </div>
                <div>
                  <span className="text-foreground-muted">Branch:</span>
                  <span className="ml-2 font-medium">{extractedData.branch}</span>
                </div>
                <div>
                  <span className="text-foreground-muted">Joining Year:</span>
                  <span className="ml-2 font-medium">{extractedData.joiningYear}</span>
                </div>
                <div>
                  <span className="text-foreground-muted">Passing Year:</span>
                  <span className="ml-2 font-medium">{extractedData.passingYear}</span>
                </div>
              </div>
              <p className="text-xs text-foreground-muted">
                These details will be automatically saved to your profile.
              </p>
            </div>
          )}

          <Button
            type="submit"
            className="w-full hover-glow"
            disabled={isLoading || !extractedData}
          >
            {isLoading ? "Creating Account..." : "Create Account"}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <span className="text-foreground-muted text-sm">Already have an account? </span>
          <button
            onClick={() => onStepChange("login")}
            className="text-primary hover:text-primary-hover text-sm font-medium"
          >
            Sign in
          </button>
        </div>
      </CardContent>
    </Card>
  )
}
