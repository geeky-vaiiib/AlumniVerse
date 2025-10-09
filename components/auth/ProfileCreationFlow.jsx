"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { Textarea } from "../ui/textarea"
import { Progress } from "../ui/progress"
import { Upload, User, Briefcase, Award, ArrowLeft, ArrowRight, Check } from "lucide-react"
import { parseInstitutionalEmail } from "../../lib/utils/emailParser"
import { useAuth } from "../providers/AuthProvider"

const STEPS = [
  { id: 1, title: "Basic Information", icon: User },
  { id: 2, title: "Professional Details", icon: Briefcase },
  { id: 3, title: "Additional Information", icon: Award }
]

export default function ProfileCreationFlow({ userData, onComplete }) {
  const { user } = useAuth()
  const [currentStep, setCurrentStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState({})
  
  // Form data state
  const [formData, setFormData] = useState({
    // Step 1: Basic Information
    firstName: '',
    lastName: '',
    email: '',
    branch: '',
    joiningYear: '',
    passingYear: '',
    usn: '',
    
    // Step 2: Professional Details
    currentCompany: '',
    designation: '',
    location: '',
    linkedinUrl: '',
    githubUrl: '',
    leetcodeUrl: '',
    resumeFile: null,
    resumeUrl: '',
    
    // Step 3: Additional Information
    skills: '',
    bio: '',
    achievements: '',
    interests: '',
    mentorshipAvailable: false,
    jobReferralsAvailable: false
  })

  // Auto-populate from email on mount
  useEffect(() => {
    if (userData?.email || user?.email) {
      const email = userData?.email || user?.email
      const parsedData = parseInstitutionalEmail(email)

      // Get names from userData or nested userData.userData (from signup metadata)
      const firstName = userData?.firstName || userData?.userData?.first_name || ''
      const lastName = userData?.lastName || userData?.userData?.last_name || ''

      if (parsedData.isValid) {
        setFormData(prev => ({
          ...prev,
          email: email,
          firstName: firstName,
          lastName: lastName,
          branch: parsedData.branch,
          joiningYear: parsedData.joiningYear,
          passingYear: parsedData.passingYear,
          usn: parsedData.usn
        }))
      } else {
        setFormData(prev => ({
          ...prev,
          email: email,
          firstName: firstName,
          lastName: lastName
        }))
      }
    }
  }, [userData, user])

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const validateStep = (step) => {
    const newErrors = {}
    
    switch (step) {
      case 1:
        if (!formData.firstName.trim()) newErrors.firstName = 'First name is required'
        if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required'
        if (!formData.email.trim()) newErrors.email = 'Email is required'
        if (!formData.branch.trim()) newErrors.branch = 'Branch is required'
        if (!formData.passingYear) newErrors.passingYear = 'Passing year is required'
        break
      case 2:
        // Professional details are optional but validate format if provided
        if (formData.linkedinUrl && !formData.linkedinUrl.includes('linkedin.com')) {
          newErrors.linkedinUrl = 'Please enter a valid LinkedIn URL'
        }
        if (formData.githubUrl && !formData.githubUrl.includes('github.com')) {
          newErrors.githubUrl = 'Please enter a valid GitHub URL'
        }
        if (formData.leetcodeUrl && !formData.leetcodeUrl.includes('leetcode.com')) {
          newErrors.leetcodeUrl = 'Please enter a valid LeetCode URL'
        }
        break
      case 3:
        // Additional info is optional
        break
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, STEPS.length))
    }
  }

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1))
  }

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return
    
    setIsLoading(true)
    try {
      console.log('🔧 [PROFILE_FLOW] Starting profile creation...')
      
      // Create profile via API endpoint
      const response = await fetch('/api/profile/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          auth_id: user?.id,
          email: formData.email,
          first_name: formData.firstName,
          last_name: formData.lastName,
          usn: formData.usn,
          branch: formData.branch,
          admission_year: formData.joiningYear,
          passing_year: formData.passingYear,
          company: formData.currentCompany,
          current_position: formData.designation,
          location: formData.location,
          linkedin_url: formData.linkedinUrl,
          github_url: formData.githubUrl,
          bio: formData.bio,
          skills: formData.skills,
          profile_completed: true
        })
      })

      const result = await response.json()

      console.log('🔧 [PROFILE_FLOW] API Response:', { 
        status: response.status, 
        ok: response.ok,
        message: result.message,
        hasData: !!result.data 
      })

      // FIXED: Handle both success and "already exists" responses gracefully
      if (!response.ok) {
        // Don't treat existing profile as an error if we got data back
        if (response.status === 409 && result.data) {
          console.log('🔧 [PROFILE_FLOW] Profile exists, proceeding with existing data')
          const existingProfile = result.data
          
          // CRITICAL: Wait a moment for the session to fully settle before calling onComplete
          await new Promise(resolve => setTimeout(resolve, 500))
          
          onComplete(existingProfile)
          return
        }
        
        throw new Error(result.error || 'Failed to create profile')
      }

      console.log('🔧 [PROFILE_FLOW] Profile operation successful:', result.message)
      
      // CRITICAL: Wait a moment for the session to fully settle before calling onComplete
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Call completion handler with server-created profile data
      const createdProfile = result.data || formData
      onComplete(createdProfile)
    } catch (error) {
      console.error('🔧 [PROFILE_FLOW] Profile creation failed:', error)
      setErrors({ submit: error.message || 'Failed to create profile. Please try again.' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleFileUpload = (event) => {
    const file = event.target.files[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setErrors(prev => ({ ...prev, resumeFile: 'File size must be less than 5MB' }))
        return
      }
      
      if (!file.type.includes('pdf')) {
        setErrors(prev => ({ ...prev, resumeFile: 'Please upload a PDF file' }))
        return
      }
      
      setFormData(prev => ({ ...prev, resumeFile: file }))
      setErrors(prev => ({ ...prev, resumeFile: '' }))
    }
  }

  const progress = (currentStep / STEPS.length) * 100

  return (
    <div className="min-h-screen bg-[#1A1A1A] flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl bg-[#2D2D2D] border-[#3D3D3D]">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-white mb-2">
            Complete Your Profile
          </CardTitle>
          <CardDescription className="text-[#B0B0B0]">
            Step {currentStep} of {STEPS.length}: {STEPS[currentStep - 1].title}
          </CardDescription>
          
          {/* Progress Bar */}
          <div className="mt-4">
            <Progress value={progress} className="h-2 bg-[#3D3D3D]" />
            <div className="flex justify-between mt-2">
              {STEPS.map((step, index) => {
                const Icon = step.icon
                const isCompleted = currentStep > step.id
                const isCurrent = currentStep === step.id
                
                return (
                  <div key={step.id} className="flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      isCompleted 
                        ? 'bg-[#4A90E2] text-white' 
                        : isCurrent 
                        ? 'bg-[#4A90E2]/20 text-[#4A90E2] border-2 border-[#4A90E2]' 
                        : 'bg-[#3D3D3D] text-[#B0B0B0]'
                    }`}>
                      {isCompleted ? <Check className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                    </div>
                    <span className={`text-xs mt-1 ${isCurrent ? 'text-[#4A90E2]' : 'text-[#B0B0B0]'}`}>
                      {step.title}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Step 1: Basic Information */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName" className="text-white">First Name *</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    className="bg-[#3D3D3D] border-[#4D4D4D] text-white"
                    placeholder="Enter your first name"
                  />
                  {errors.firstName && <p className="text-red-400 text-sm mt-1">{errors.firstName}</p>}
                </div>

                <div>
                  <Label htmlFor="lastName" className="text-white">Last Name *</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    className="bg-[#3D3D3D] border-[#4D4D4D] text-white"
                    placeholder="Enter your last name"
                  />
                  {errors.lastName && <p className="text-red-400 text-sm mt-1">{errors.lastName}</p>}
                </div>
              </div>

              <div>
                <Label htmlFor="email" className="text-white">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="bg-[#3D3D3D] border-[#4D4D4D] text-white"
                  placeholder="your.email@sit.ac.in"
                  disabled
                />
                {errors.email && <p className="text-red-400 text-sm mt-1">{errors.email}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="branch" className="text-white">
                    Branch * <span className="text-xs text-[#B0B0B0]">(Auto-extracted from email)</span>
                  </Label>
                  <Input
                    id="branch"
                    value={formData.branch}
                    onChange={(e) => handleInputChange('branch', e.target.value)}
                    className="bg-[#2D2D2D] border-[#4D4D4D] text-white cursor-not-allowed opacity-75"
                    placeholder="Computer Science"
                    disabled
                    readOnly
                  />
                  {errors.branch && <p className="text-red-400 text-sm mt-1">{errors.branch}</p>}
                </div>

                <div>
                  <Label htmlFor="passingYear" className="text-white">
                    Passing Year * <span className="text-xs text-[#B0B0B0]">(Auto-extracted from email)</span>
                  </Label>
                  <Input
                    id="passingYear"
                    type="number"
                    value={formData.passingYear}
                    onChange={(e) => handleInputChange('passingYear', parseInt(e.target.value))}
                    className="bg-[#2D2D2D] border-[#4D4D4D] text-white cursor-not-allowed opacity-75"
                    placeholder="2024"
                    min="2000"
                    max="2030"
                    disabled
                    readOnly
                  />
                  {errors.passingYear && <p className="text-red-400 text-sm mt-1">{errors.passingYear}</p>}
                </div>
              </div>

              <div>
                <Label htmlFor="usn" className="text-white">
                  USN <span className="text-xs text-[#B0B0B0]">(Auto-extracted from email)</span>
                </Label>
                <Input
                  id="usn"
                  value={formData.usn}
                  onChange={(e) => handleInputChange('usn', e.target.value.toUpperCase())}
                  className="bg-[#2D2D2D] border-[#4D4D4D] text-white cursor-not-allowed opacity-75"
                  placeholder="1SI23IS117"
                  disabled
                  readOnly
                />
              </div>
            </div>
          )}

          {/* Step 2: Professional Details */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="currentCompany" className="text-white">Current Company</Label>
                  <Input
                    id="currentCompany"
                    value={formData.currentCompany}
                    onChange={(e) => handleInputChange('currentCompany', e.target.value)}
                    className="bg-[#3D3D3D] border-[#4D4D4D] text-white"
                    placeholder="Google, Microsoft, etc."
                  />
                </div>

                <div>
                  <Label htmlFor="designation" className="text-white">Designation</Label>
                  <Input
                    id="designation"
                    value={formData.designation}
                    onChange={(e) => handleInputChange('designation', e.target.value)}
                    className="bg-[#3D3D3D] border-[#4D4D4D] text-white"
                    placeholder="Software Engineer, etc."
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="location" className="text-white">Location</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  className="bg-[#3D3D3D] border-[#4D4D4D] text-white"
                  placeholder="Bangalore, India"
                />
              </div>

              {/* Resume Upload */}
              <div>
                <Label className="text-white">Resume Upload</Label>
                <div className="mt-2 border-2 border-dashed border-[#4D4D4D] rounded-lg p-6 text-center hover:border-[#4A90E2] transition-colors">
                  <Upload className="w-8 h-8 text-[#B0B0B0] mx-auto mb-2" />
                  <p className="text-[#B0B0B0] mb-2">Drag and drop your resume here, or click to browse</p>
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="resume-upload"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById('resume-upload').click()}
                    className="bg-transparent border-[#4D4D4D] text-white hover:bg-[#3D3D3D]"
                  >
                    Choose File
                  </Button>
                  {formData.resumeFile && (
                    <p className="text-[#4A90E2] mt-2">✓ {formData.resumeFile.name}</p>
                  )}
                  {errors.resumeFile && <p className="text-red-400 text-sm mt-1">{errors.resumeFile}</p>}
                </div>
              </div>

              {/* Professional Links */}
              <div className="space-y-3">
                <Label className="text-white">Professional Links</Label>

                <div>
                  <Input
                    value={formData.linkedinUrl}
                    onChange={(e) => handleInputChange('linkedinUrl', e.target.value)}
                    className="bg-[#3D3D3D] border-[#4D4D4D] text-white"
                    placeholder="https://linkedin.com/in/yourprofile"
                  />
                  {errors.linkedinUrl && <p className="text-red-400 text-sm mt-1">{errors.linkedinUrl}</p>}
                </div>

                <div>
                  <Input
                    value={formData.githubUrl}
                    onChange={(e) => handleInputChange('githubUrl', e.target.value)}
                    className="bg-[#3D3D3D] border-[#4D4D4D] text-white"
                    placeholder="https://github.com/yourusername"
                  />
                  {errors.githubUrl && <p className="text-red-400 text-sm mt-1">{errors.githubUrl}</p>}
                </div>

                <div>
                  <Input
                    value={formData.leetcodeUrl}
                    onChange={(e) => handleInputChange('leetcodeUrl', e.target.value)}
                    className="bg-[#3D3D3D] border-[#4D4D4D] text-white"
                    placeholder="https://leetcode.com/yourusername"
                  />
                  {errors.leetcodeUrl && <p className="text-red-400 text-sm mt-1">{errors.leetcodeUrl}</p>}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Additional Information */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="skills" className="text-white">Skills & Technologies</Label>
                <Textarea
                  id="skills"
                  value={formData.skills}
                  onChange={(e) => handleInputChange('skills', e.target.value)}
                  className="bg-[#3D3D3D] border-[#4D4D4D] text-white"
                  placeholder="React, Node.js, Python, Machine Learning, etc."
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="bio" className="text-white">Bio</Label>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  className="bg-[#3D3D3D] border-[#4D4D4D] text-white"
                  placeholder="Tell us about yourself..."
                  rows={4}
                />
              </div>

              <div>
                <Label htmlFor="achievements" className="text-white">Achievements & Awards</Label>
                <Textarea
                  id="achievements"
                  value={formData.achievements}
                  onChange={(e) => handleInputChange('achievements', e.target.value)}
                  className="bg-[#3D3D3D] border-[#4D4D4D] text-white"
                  placeholder="Hackathon wins, certifications, publications, etc."
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="interests" className="text-white">Interests & Hobbies</Label>
                <Textarea
                  id="interests"
                  value={formData.interests}
                  onChange={(e) => handleInputChange('interests', e.target.value)}
                  className="bg-[#3D3D3D] border-[#4D4D4D] text-white"
                  placeholder="Photography, traveling, open source, etc."
                  rows={2}
                />
              </div>

              {/* Community Preferences */}
              <div className="space-y-3">
                <Label className="text-white">Community Participation</Label>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="mentorshipAvailable"
                    checked={formData.mentorshipAvailable}
                    onChange={(e) => handleInputChange('mentorshipAvailable', e.target.checked)}
                    className="w-4 h-4 text-[#4A90E2] bg-[#3D3D3D] border-[#4D4D4D] rounded focus:ring-[#4A90E2]"
                  />
                  <Label htmlFor="mentorshipAvailable" className="text-white">
                    Available for mentorship
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="jobReferralsAvailable"
                    checked={formData.jobReferralsAvailable}
                    onChange={(e) => handleInputChange('jobReferralsAvailable', e.target.checked)}
                    className="w-4 h-4 text-[#4A90E2] bg-[#3D3D3D] border-[#4D4D4D] rounded focus:ring-[#4A90E2]"
                  />
                  <Label htmlFor="jobReferralsAvailable" className="text-white">
                    Available for job referrals
                  </Label>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-6">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 1}
              className="bg-transparent border-[#4D4D4D] text-white hover:bg-[#3D3D3D]"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>

            {currentStep < STEPS.length ? (
              <Button
                onClick={handleNext}
                className="bg-[#4A90E2] hover:bg-[#357ABD] text-white"
              >
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={isLoading}
                className="bg-[#4A90E2] hover:bg-[#357ABD] text-white"
              >
                {isLoading ? 'Creating Profile...' : 'Complete Profile'}
              </Button>
            )}
          </div>

          {errors.submit && (
            <p className="text-red-400 text-sm text-center">{errors.submit}</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
