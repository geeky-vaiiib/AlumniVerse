"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { Progress } from "../ui/progress"
import { 
  User, 
  Briefcase, 
  FileText, 
  CheckCircle, 
  Upload, 
  X, 
  Github, 
  Linkedin, 
  Code,
  MapPin,
  Building,
  GraduationCap
} from "lucide-react"
import { validateGitHubUrl, validateLinkedInUrl, validateLeetCodeUrl, URL_VALIDATION_MESSAGES } from "../../lib/utils/urlValidation"

// Step configuration
const STEPS = [
  {
    id: 1,
    title: "Personal Info",
    description: "Basic academic details",
    icon: User,
    fields: ['firstName', 'lastName', 'branch', 'yearOfPassing']
  },
  {
    id: 2,
    title: "Professional",
    description: "Career & resume",
    icon: Briefcase,
    fields: ['currentCompany', 'designation', 'location', 'resumeUrl']
  },
  {
    id: 3,
    title: "Social Links",
    description: "Connect your profiles (Required)",
    icon: Code,
    fields: ['linkedinUrl', 'githubUrl', 'leetcodeUrl']
  }
]

// Branch options
const BRANCH_OPTIONS = [
  { value: "Computer Science", label: "Computer Science & Engineering" },
  { value: "Information Science", label: "Information Science & Engineering" },
  { value: "Electronics", label: "Electronics & Communication" },
  { value: "Mechanical", label: "Mechanical Engineering" },
  { value: "Civil", label: "Civil Engineering" },
  { value: "Electrical", label: "Electrical & Electronics" },
  { value: "Biotechnology", label: "Biotechnology" },
  { value: "Chemical", label: "Chemical Engineering" }
]

export default function ProfileCreationFlow({ userData, onComplete }) {
  const [currentStep, setCurrentStep] = useState(1)
  
  // Extract data from userData (from email parsing)
  const extractedData = userData?.userData || {}
  
  const [formData, setFormData] = useState({
    firstName: userData?.firstName || extractedData?.first_name || '',
    lastName: userData?.lastName || extractedData?.last_name || '',
    branch: extractedData?.branch || '',
    yearOfPassing: extractedData?.passing_year || '',
    usn: extractedData?.usn || '',
    joiningYear: extractedData?.joining_year || '',
    currentCompany: '',
    designation: '',
    location: '',
    linkedinUrl: '',
    githubUrl: '',
    leetcodeUrl: '',
    resumeUrl: ''
  })
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [uploadedFile, setUploadedFile] = useState(null)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef(null)

  // Auto-save to localStorage
  useEffect(() => {
    const savedData = localStorage.getItem('profileCreationDraft')
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData)
        setFormData(prev => ({ ...prev, ...parsed }))
      } catch (error) {
        console.error('Failed to parse saved profile data:', error)
      }
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('profileCreationDraft', JSON.stringify(formData))
  }, [formData])

  // Calculate progress
  const progress = (currentStep / STEPS.length) * 100

  // Handle input changes
  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  // URL validation patterns
  const urlPatterns = {
    linkedin: /^https?:\/\/(www\.)?linkedin\.com\/.*$/,
    github: /^https?:\/\/(www\.)?github\.com\/[A-Za-z0-9_-]+\/?$/,
    leetcode: /^https?:\/\/(www\.)?leetcode\.com\/[A-Za-z0-9_-]+\/?$/
  }

  // Validate current step
  const validateStep = (step) => {
    const newErrors = {}
    const currentFields = STEPS[step - 1].fields

    currentFields.forEach(field => {
      const value = formData[field]

      switch (field) {
        case 'firstName':
        case 'lastName':
          if (!value || value.trim().length < 2) {
            newErrors[field] = `${field === 'firstName' ? 'First' : 'Last'} name must be at least 2 characters`
          }
          break
        case 'branch':
          if (!value) {
            newErrors[field] = 'Please select your branch'
          }
          break
        case 'yearOfPassing': {
          const year = parseInt(value)
          if (!value || year < 2010 || year > 2030) {
            newErrors[field] = 'Please enter a valid year (2010-2030)'
          }
          break
        }
        case 'linkedinUrl':
          if (!value || !value.trim()) {
            newErrors[field] = 'LinkedIn profile URL is required'
          } else if (!validateLinkedInUrl(value)) {
            newErrors[field] = URL_VALIDATION_MESSAGES.linkedin
          }
          break
        case 'githubUrl':
          if (!value || !value.trim()) {
            newErrors[field] = 'GitHub profile URL is required'
          } else if (!validateGitHubUrl(value)) {
            newErrors[field] = URL_VALIDATION_MESSAGES.github
          }
          break
        case 'leetcodeUrl':
          if (!value || !value.trim()) {
            newErrors[field] = 'LeetCode profile URL is required'
          } else if (!validateLeetCodeUrl(value)) {
            newErrors[field] = URL_VALIDATION_MESSAGES.leetcode
          }
          break
        case 'resumeUrl':
          if (!value || !value.trim()) {
            newErrors[field] = 'Resume URL is required'
          }
          break
      }
    })

    return newErrors
  }

  // Handle file upload
  const handleFileUpload = async (file) => {
    if (!file) return

    // Validate file
    const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    if (!allowedTypes.includes(file.type)) {
      setErrors(prev => ({ ...prev, resume: 'Only PDF and DOCX files are allowed' }))
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, resume: 'File size must be less than 5MB' }))
      return
    }

    setIsUploading(true)
    setErrors(prev => ({ ...prev, resume: '' }))

    try {
      const formDataUpload = new FormData()
      formDataUpload.append('resume', file)

      const response = await fetch('/api/profile/upload-resume', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formDataUpload
      })

      const result = await response.json()

      if (response.ok && result.success) {
        setUploadedFile({
          name: file.name,
          size: file.size,
          url: result.data.resumeUrl
        })
        setFormData(prev => ({ ...prev, resumeUrl: result.data.resumeUrl }))
      } else {
        setErrors(prev => ({ ...prev, resume: result.message || 'Upload failed' }))
      }
    } catch (error) {
      console.error('Upload error:', error)
      setErrors(prev => ({ ...prev, resume: 'Upload failed. Please try again.' }))
    } finally {
      setIsUploading(false)
    }
  }

  // Handle drag and drop
  const handleDrop = (e) => {
    e.preventDefault()
    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      handleFileUpload(files[0])
    }
  }

  const handleDragOver = (e) => {
    e.preventDefault()
  }

  // Remove uploaded file
  const removeFile = () => {
    setUploadedFile(null)
    setFormData(prev => ({ ...prev, resumeUrl: '' }))
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // Navigation handlers
  const handleNext = () => {
    const stepErrors = validateStep(currentStep)
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors)
      return
    }

    setErrors({})
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  // Submit profile
  const handleSubmit = async () => {
    const stepErrors = validateStep(currentStep)
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors)
      return
    }

    setIsLoading(true)

    try {
      console.log('🔧 [PROFILE_FLOW] Starting profile completion...')
      
      // Import supabase client
      const { createClient } = await import('@supabase/supabase-js')
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      )

      // Get current user and session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError || !session) {
        setErrors({ submit: 'Authentication error. Please log in again.' })
        return
      }

      // 🔧 FIX: Use dedicated /api/profile/complete endpoint
      const response = await fetch('/api/profile/complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`  // ✅ Include auth token
        },
        body: JSON.stringify({
          first_name: formData.firstName,
          last_name: formData.lastName,
          usn: formData.usn || userData?.userData?.usn || null,
          branch: formData.branch,
          branch_code: userData?.userData?.branch_code || null,
          admission_year: formData.joiningYear || userData?.userData?.joining_year || null,
          passing_year: formData.yearOfPassing ? parseInt(formData.yearOfPassing) : null,
          company: formData.currentCompany || null,
          current_position: formData.designation || null,
          location: formData.location || null,
          linkedin_url: validateLinkedInUrl(formData.linkedinUrl),
          github_url: validateGitHubUrl(formData.githubUrl),
          leetcode_url: validateLeetCodeUrl(formData.leetcodeUrl),
          resume_url: (formData.resumeUrl && formData.resumeUrl.trim()) ? formData.resumeUrl.trim() : null
        })
      })

      const result = await response.json()

      console.log('🔧 [PROFILE_FLOW] API Response:', { 
        status: response.status, 
        ok: response.ok,
        message: result.message,
        hasData: !!result.data,
        isProfileComplete: result.data?.isProfileComplete 
      })

      // ✅ Check for success response
      if (!response.ok) {
        throw new Error(result.error || result.message || 'Failed to complete profile')
      }

      // ✅ Verify profile is marked as complete
      if (!result.success || !result.data?.isProfileComplete) {
        throw new Error('Profile was not marked as complete on server')
      }

      console.log('[PROFILE_FLOW] 🎉 Profile completed successfully on server')

      // Update user metadata
      await supabase.auth.updateUser({
        data: {
          profileCompleted: true,
          first_name: formData.firstName,
          last_name: formData.lastName
        }
      })

      // Clear draft from localStorage
      localStorage.removeItem('profileCreationDraft')
      
      console.log('[PROFILE_FLOW] ✅ Calling onComplete with completed profile')
      
      // ✅ Wait for state to settle before redirect
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Call completion handler with server response
      if (onComplete) {
        onComplete(result.data.user)
      } else {
        // Fallback redirect
        window.location.href = '/dashboard'
      }
    } catch (error) {
      console.error('Profile update error:', error)
      setErrors({ submit: 'Network error. Please try again.' })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#1A1A1A] flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl bg-[#2D2D2D] border-[#404040] shadow-2xl">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-[#4A90E2]/10 rounded-full flex items-center justify-center">
            <GraduationCap className="w-8 h-8 text-[#4A90E2]" />
          </div>
          <CardTitle className="text-2xl font-bold text-white">Complete Your Profile</CardTitle>
          <CardDescription className="text-[#B0B0B0]">
            Help us personalize your AlumniVerse experience
          </CardDescription>
          
          {/* Progress Bar */}
          <div className="space-y-2">
            <Progress value={progress} className="h-2 bg-[#404040]" />
            <p className="text-sm text-[#B0B0B0]">
              Step {currentStep} of {STEPS.length}
            </p>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Step Indicator */}
          <div className="flex justify-center space-x-4">
            {STEPS.map((step, index) => {
              const StepIcon = step.icon
              const isActive = currentStep === step.id
              const isCompleted = currentStep > step.id
              
              return (
                <div key={step.id} className="flex flex-col items-center space-y-2">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 ${
                    isCompleted 
                      ? 'bg-green-500 text-white' 
                      : isActive 
                        ? 'bg-[#4A90E2] text-white' 
                        : 'bg-[#404040] text-[#B0B0B0]'
                  }`}>
                    {isCompleted ? (
                      <CheckCircle className="w-6 h-6" />
                    ) : (
                      <StepIcon className="w-6 h-6" />
                    )}
                  </div>
                  <div className="text-center">
                    <p className={`text-xs font-medium ${
                      isActive ? 'text-[#4A90E2]' : 'text-[#B0B0B0]'
                    }`}>
                      {step.title}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Step 1: Personal Info */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-white">First Name * (from email)</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    readOnly
                    disabled
                    className="bg-[#2D2D2D] border-[#606060] text-[#B0B0B0] cursor-not-allowed"
                  />
                  <p className="text-xs text-[#B0B0B0]">Extracted from your SIT email</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-white">Last Name * (from email)</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    readOnly
                    disabled
                    className="bg-[#2D2D2D] border-[#606060] text-[#B0B0B0] cursor-not-allowed"
                  />
                  <p className="text-xs text-[#B0B0B0]">Extracted from your SIT email</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="branch" className="text-white">Branch * (from email)</Label>
                <Input
                  id="branch"
                  value={formData.branch}
                  readOnly
                  disabled
                  className="bg-[#2D2D2D] border-[#606060] text-[#B0B0B0] cursor-not-allowed"
                />
                <p className="text-xs text-[#B0B0B0]">Extracted from your USN</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="yearOfPassing" className="text-white">Year of Passing * (from email)</Label>
                <Input
                  id="yearOfPassing"
                  value={formData.yearOfPassing}
                  readOnly
                  disabled
                  className="bg-[#2D2D2D] border-[#606060] text-[#B0B0B0] cursor-not-allowed"
                />
                <p className="text-xs text-[#B0B0B0]">Extracted from your USN</p>
              </div>
            </div>
          )}

          {/* Step 2: Professional Info */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="currentCompany" className="text-white flex items-center gap-2">
                    <Building className="w-4 h-4" />
                    Current Company
                  </Label>
                  <Input
                    id="currentCompany"
                    value={formData.currentCompany}
                    onChange={(e) => handleChange('currentCompany', e.target.value)}
                    placeholder="e.g., Google, Microsoft"
                    className="bg-[#404040] border-[#606060] text-white placeholder-[#B0B0B0] focus:border-[#4A90E2]"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="designation" className="text-white">Designation</Label>
                  <Input
                    id="designation"
                    value={formData.designation}
                    onChange={(e) => handleChange('designation', e.target.value)}
                    placeholder="e.g., Software Engineer"
                    className="bg-[#404040] border-[#606060] text-white placeholder-[#B0B0B0] focus:border-[#4A90E2]"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location" className="text-white flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Current Location
                </Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => handleChange('location', e.target.value)}
                  placeholder="e.g., Bangalore, India"
                  className="bg-[#404040] border-[#606060] text-white placeholder-[#B0B0B0] focus:border-[#4A90E2]"
                />
              </div>

              {/* Resume Upload */}
              <div className="space-y-2">
                <Label className="text-white flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Resume (PDF/DOCX, max 5MB)
                </Label>

                {!uploadedFile ? (
                  <div
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    className={`border-2 border-dashed border-[#606060] rounded-lg p-6 text-center transition-colors hover:border-[#4A90E2] cursor-pointer ${
                      errors.resume ? 'border-red-500' : ''
                    }`}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="w-8 h-8 text-[#B0B0B0] mx-auto mb-2" />
                    <p className="text-[#B0B0B0] mb-1">
                      {isUploading ? 'Uploading...' : 'Drop your resume here or click to browse'}
                    </p>
                    <p className="text-xs text-[#808080]">PDF or DOCX files only</p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,.docx,.doc"
                      onChange={(e) => e.target.files[0] && handleFileUpload(e.target.files[0])}
                      className="hidden"
                    />
                  </div>
                ) : (
                  <div className="bg-[#404040] border border-[#606060] rounded-lg p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-[#4A90E2]" />
                      <div>
                        <p className="text-white text-sm font-medium">{uploadedFile.name}</p>
                        <p className="text-[#B0B0B0] text-xs">
                          {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={removeFile}
                      className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                )}

                {errors.resume && (
                  <p className="text-red-400 text-sm">{errors.resume}</p>
                )}
              </div>
            </div>
          )}

          {/* Step 3: Social Links */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="linkedinUrl" className="text-white flex items-center gap-2">
                    <Linkedin className="w-4 h-4 text-blue-500" />
                    LinkedIn Profile
                  </Label>
                  <Input
                    id="linkedinUrl"
                    value={formData.linkedinUrl}
                    onChange={(e) => handleChange('linkedinUrl', e.target.value)}
                    placeholder="https://linkedin.com/in/yourprofile"
                    className={`bg-[#404040] border-[#606060] text-white placeholder-[#B0B0B0] focus:border-[#4A90E2] ${
                      errors.linkedinUrl ? 'border-red-500' : ''
                    }`}
                  />
                  {errors.linkedinUrl && (
                    <p className="text-red-400 text-sm">{errors.linkedinUrl}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="githubUrl" className="text-white flex items-center gap-2">
                    <Github className="w-4 h-4" />
                    GitHub Profile
                  </Label>
                  <Input
                    id="githubUrl"
                    value={formData.githubUrl}
                    onChange={(e) => handleChange('githubUrl', e.target.value)}
                    placeholder="https://github.com/yourusername"
                    className={`bg-[#404040] border-[#606060] text-white placeholder-[#B0B0B0] focus:border-[#4A90E2] ${
                      errors.githubUrl ? 'border-red-500' : ''
                    }`}
                  />
                  {errors.githubUrl && (
                    <p className="text-red-400 text-sm">{errors.githubUrl}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="leetcodeUrl" className="text-white flex items-center gap-2">
                    <Code className="w-4 h-4 text-orange-500" />
                    LeetCode Profile
                  </Label>
                  <Input
                    id="leetcodeUrl"
                    value={formData.leetcodeUrl}
                    onChange={(e) => handleChange('leetcodeUrl', e.target.value)}
                    placeholder="https://leetcode.com/yourusername"
                    className={`bg-[#404040] border-[#606060] text-white placeholder-[#B0B0B0] focus:border-[#4A90E2] ${
                      errors.leetcodeUrl ? 'border-red-500' : ''
                    }`}
                  />
                  {errors.leetcodeUrl && (
                    <p className="text-red-400 text-sm">{errors.leetcodeUrl}</p>
                  )}
                </div>
              </div>

              {/* Profile Preview */}
              <div className="bg-[#404040] rounded-lg p-4 border border-[#606060]">
                <h3 className="text-white font-medium mb-3 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Profile Preview
                </h3>
                <div className="space-y-2 text-sm">
                  <p className="text-[#B0B0B0]">
                    <span className="text-white font-medium">Name:</span> {formData.firstName} {formData.lastName}
                  </p>
                  <p className="text-[#B0B0B0]">
                    <span className="text-white font-medium">Branch:</span> {formData.branch}
                  </p>
                  <p className="text-[#B0B0B0]">
                    <span className="text-white font-medium">Passing Year:</span> {formData.yearOfPassing}
                  </p>
                  {formData.currentCompany && (
                    <p className="text-[#B0B0B0]">
                      <span className="text-white font-medium">Company:</span> {formData.currentCompany}
                    </p>
                  )}
                  {formData.location && (
                    <p className="text-[#B0B0B0]">
                      <span className="text-white font-medium">Location:</span> {formData.location}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {errors.submit && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
              <p className="text-red-400 text-sm">{errors.submit}</p>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-6">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 1}
              className="bg-transparent border-[#606060] text-white hover:bg-[#404040] disabled:opacity-50"
            >
              Previous
            </Button>

            {currentStep < STEPS.length ? (
              <Button
                onClick={handleNext}
                className="bg-[#4A90E2] hover:bg-[#4A90E2]/90 text-white px-8"
              >
                Next
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={isLoading}
                className="bg-green-600 hover:bg-green-700 text-white px-8"
              >
                {isLoading ? 'Creating Profile...' : 'Complete Setup'}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
