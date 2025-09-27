"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { Button } from "../ui/button"
import { Input } from "../ui/input"

const steps = [
  { id: 1, title: "Basic Info", description: "Academic details" },
  { id: 2, title: "Professional", description: "Career information" },
  { id: 3, title: "Social Links", description: "Connect your profiles" },
]

export default function ProfileCreation({ userData, onStepChange }) {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    usn: "",
    branch: "",
    yearOfAdmission: "",
    batchOfPassing: "",
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
    const stepErrors = validateStep(currentStep)
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors)
      return
    }

    setErrors({})
    if (currentStep < 3) {
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
      // Redirect to dashboard
      window.location.href = "/dashboard"
    }, 1500)
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold">Complete Your Profile</CardTitle>
        <CardDescription>Help us personalize your alumni experience</CardDescription>

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
        {/* Step 1: Basic Info */}
        {currentStep === 1 && (
          <div className="space-y-4">
            <div>
              <label htmlFor="usn" className="block text-sm font-medium text-foreground mb-2">
                University Seat Number (USN)
              </label>
              <Input
                id="usn"
                name="usn"
                value={formData.usn}
                onChange={handleChange}
                placeholder="1SI21CS001"
                className={errors.usn ? "border-destructive" : ""}
              />
              {errors.usn && <p className="text-destructive text-sm mt-1">{errors.usn}</p>}
            </div>

            <div>
              <label htmlFor="branch" className="block text-sm font-medium text-foreground mb-2">
                Branch
              </label>
              <select
                id="branch"
                name="branch"
                value={formData.branch}
                onChange={handleChange}
                className={`w-full h-10 px-3 py-2 text-sm bg-input border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${errors.branch ? "border-destructive" : ""}`}
              >
                <option value="">Select Branch</option>
                <option value="Computer Science">Computer Science</option>
                <option value="Information Science">Information Science</option>
                <option value="Electronics">Electronics</option>
                <option value="Mechanical">Mechanical</option>
                <option value="Civil">Civil</option>
                <option value="Electrical">Electrical</option>
              </select>
              {errors.branch && <p className="text-destructive text-sm mt-1">{errors.branch}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="yearOfAdmission" className="block text-sm font-medium text-foreground mb-2">
                  Year of Admission
                </label>
                <Input
                  id="yearOfAdmission"
                  name="yearOfAdmission"
                  type="number"
                  value={formData.yearOfAdmission}
                  onChange={handleChange}
                  placeholder="2021"
                  min="2010"
                  max="2024"
                  className={errors.yearOfAdmission ? "border-destructive" : ""}
                />
                {errors.yearOfAdmission && <p className="text-destructive text-sm mt-1">{errors.yearOfAdmission}</p>}
              </div>

              <div>
                <label htmlFor="batchOfPassing" className="block text-sm font-medium text-foreground mb-2">
                  Batch of Passing
                </label>
                <Input
                  id="batchOfPassing"
                  name="batchOfPassing"
                  value={formData.batchOfPassing}
                  readOnly
                  className="bg-muted"
                  placeholder="Auto-calculated"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Professional Info */}
        {currentStep === 2 && (
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

        {/* Step 3: Social Links */}
        {currentStep === 3 && (
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
          <Button variant="outline" onClick={handlePrevious} disabled={currentStep === 1}>
            Previous
          </Button>

          {currentStep < 3 ? (
            <Button onClick={handleNext} className="hover-glow">
              Next
            </Button>
          ) : (
            <Button onClick={handleSubmit} className="hover-glow" disabled={isLoading}>
              {isLoading ? "Creating Profile..." : "Complete Setup"}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
