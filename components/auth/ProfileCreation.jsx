"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { Button } from "../ui/button"
import { Input } from "../ui/input"

const steps = [
  { id: 1, title: "Professional", description: "Career information" },
  { id: 2, title: "Social Links", description: "Connect your profiles" },
]

export default function ProfileCreation({ userData, onStepChange }) {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    // Skip basic info - start with professional details
    currentCompany: "",
    designation: "",
    location: "",
    linkedinUrl: "",
    githubUrl: "",
    leetcodeUrl: "",
    resume: null,
  })
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)

  // Auto-calculate batch of passing
  const handleAdmissionYearChange = (year) => {
    setFormData((prev) => ({
      ...prev,
      yearOfAdmission: year,
      batchOfPassing: year ? (Number.parseInt(year) + 4).toString() : "",
    }))
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    if (name === "yearOfAdmission") {
      handleAdmissionYearChange(value)
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }))
    }
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }))
    }
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file && file.type === "application/pdf") {
      setFormData((prev) => ({ ...prev, resume: file }))
    } else {
      alert("Please upload a PDF file")
    }
  }

  const validateStep = (step) => {
    const newErrors = {}

    if (step === 1) {
      if (!formData.usn) newErrors.usn = "USN is required"
      if (!formData.branch) newErrors.branch = "Branch is required"
      if (!formData.yearOfAdmission) newErrors.yearOfAdmission = "Year of admission is required"
    }

    return newErrors
  }

  const handleNext = () => {
    // Skip validation for demo mode
    setErrors({})
    if (currentStep < 2) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async () => {
    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false)
      // Set demo mode flag in both localStorage and cookie
      if (typeof window !== 'undefined') {
        localStorage.setItem('demoMode', 'true')
        // Set cookie for middleware
        document.cookie = 'demoMode=true; path=/; max-age=86400' // 24 hours
      }
      // Use multiple navigation methods for reliability
      try {
        router.push('/dashboard')
      } catch (error) {
        console.error('Router navigation failed:', error)
        // Fallback to window.location
        if (typeof window !== 'undefined') {
          window.location.href = '/dashboard'
        }
      }
    }, 1500)
  }

  const handleSkip = () => {
    // Set demo mode flag in both localStorage and cookie
    if (typeof window !== 'undefined') {
      localStorage.setItem('demoMode', 'true')
      // Set cookie for middleware
      document.cookie = 'demoMode=true; path=/; max-age=86400' // 24 hours
    }
    // Skip profile setup and go directly to dashboard
    try {
      router.push('/dashboard')
    } catch (error) {
      console.error('Router navigation failed:', error)
      // Fallback to window.location
      if (typeof window !== 'undefined') {
        window.location.href = '/dashboard'
      }
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold">Complete Your Profile</CardTitle>
        <CardDescription>Help us personalize your alumni experience</CardDescription>
        <div className="mt-2 text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded">
          Demo Mode: Fill in any details to continue
        </div>

        {/* Progress indicator */}
        <div className="flex justify-center mt-6">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  currentStep >= step.id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                }`}
              >
                {step.id}
              </div>
              {index < steps.length - 1 && (
                <div className={`w-12 h-0.5 mx-2 ${currentStep > step.id ? "bg-primary" : "bg-muted"}`} />
              )}
            </div>
          ))}
        </div>
      </CardHeader>

      <CardContent>
        {/* Step 1: Professional Info */}
        {currentStep === 1 && (
          <div className="space-y-4">
            <div>
              <label htmlFor="currentCompany" className="block text-sm font-medium text-foreground mb-2">
                Current Company
              </label>
              <Input
                id="currentCompany"
                name="currentCompany"
                value={formData.currentCompany}
                onChange={handleChange}
                placeholder="Google, Microsoft, etc."
              />
            </div>

            <div>
              <label htmlFor="designation" className="block text-sm font-medium text-foreground mb-2">
                Current Designation
              </label>
              <Input
                id="designation"
                name="designation"
                value={formData.designation}
                onChange={handleChange}
                placeholder="Software Engineer, Product Manager, etc."
              />
            </div>

            <div>
              <label htmlFor="location" className="block text-sm font-medium text-foreground mb-2">
                Current Location
              </label>
              <Input
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="Bangalore, India"
              />
            </div>

            <div>
              <label htmlFor="resume" className="block text-sm font-medium text-foreground mb-2">
                Resume (PDF)
              </label>
              <input
                id="resume"
                name="resume"
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                className="w-full px-3 py-2 text-sm bg-input border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <p className="text-foreground-muted text-xs mt-1">Upload your latest resume in PDF format</p>
            </div>
          </div>
        )}

        {/* Step 2: Social Links */}
        {currentStep === 2 && (
          <div className="space-y-4">
            <div>
              <label htmlFor="linkedinUrl" className="block text-sm font-medium text-foreground mb-2">
                LinkedIn Profile
              </label>
              <Input
                id="linkedinUrl"
                name="linkedinUrl"
                value={formData.linkedinUrl}
                onChange={handleChange}
                placeholder="https://linkedin.com/in/yourprofile"
              />
            </div>

            <div>
              <label htmlFor="githubUrl" className="block text-sm font-medium text-foreground mb-2">
                GitHub Profile
              </label>
              <Input
                id="githubUrl"
                name="githubUrl"
                value={formData.githubUrl}
                onChange={handleChange}
                placeholder="https://github.com/yourusername"
              />
            </div>

            <div>
              <label htmlFor="leetcodeUrl" className="block text-sm font-medium text-foreground mb-2">
                LeetCode Profile
              </label>
              <Input
                id="leetcodeUrl"
                name="leetcodeUrl"
                value={formData.leetcodeUrl}
                onChange={handleChange}
                placeholder="https://leetcode.com/yourusername"
              />
            </div>
          </div>
        )}

        {/* Navigation buttons */}
        <div className="flex justify-between mt-8">
          {currentStep === 1 ? (
            <Button variant="outline" onClick={handleSkip}>
              Skip Setup
            </Button>
          ) : (
            <Button variant="outline" onClick={handlePrevious}>
              Previous
            </Button>
          )}

          {currentStep < 2 ? (
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleSkip}>
                Skip
              </Button>
              <Button onClick={handleNext} className="hover-glow">
                Next
              </Button>
            </div>
          ) : (
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleSkip}>
                Skip
              </Button>
              <Button onClick={handleSubmit} className="hover-glow" disabled={isLoading}>
                {isLoading ? "Creating Profile..." : "Complete Setup"}
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
