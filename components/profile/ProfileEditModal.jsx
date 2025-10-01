"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { useUser } from "../../contexts/UserContext"
import { X } from "lucide-react"

export default function ProfileEditModal({ isOpen, onClose }) {
  const { userProfile, updateProfile } = useUser()
  const [formData, setFormData] = useState({
    firstName: userProfile?.firstName || '',
    lastName: userProfile?.lastName || '',
    currentCompany: userProfile?.currentCompany || '',
    designation: userProfile?.designation || '',
    location: userProfile?.location || '',
    linkedinUrl: userProfile?.linkedinUrl || '',
    githubUrl: userProfile?.githubUrl || '',
    leetcodeUrl: userProfile?.leetcodeUrl || '',
    resumeUrl: userProfile?.resumeUrl || '',
    bio: userProfile?.bio || ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState({})

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const validateUrls = () => {
    const urlErrors = {}
    
    // Validate LinkedIn URL
    if (formData.linkedinUrl && !formData.linkedinUrl.includes('linkedin.com')) {
      urlErrors.linkedinUrl = 'Please enter a valid LinkedIn URL'
    }
    
    // Validate GitHub URL
    if (formData.githubUrl && !formData.githubUrl.includes('github.com')) {
      urlErrors.githubUrl = 'Please enter a valid GitHub URL'
    }
    
    // Validate LeetCode URL
    if (formData.leetcodeUrl && !formData.leetcodeUrl.includes('leetcode.com')) {
      urlErrors.leetcodeUrl = 'Please enter a valid LeetCode URL'
    }
    
    setErrors(urlErrors)
    return Object.keys(urlErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateUrls()) return
    
    setIsLoading(true)
    
    try {
      await updateProfile(formData)
      
      // Show success message
      alert('Profile updated successfully!')
      onClose()
    } catch (error) {
      console.error('Profile update error:', error)
      alert('Failed to update profile. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-surface border-border">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-xl font-bold text-foreground">Edit Profile</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-foreground-muted hover:text-foreground"
          >
            <X className="w-5 h-5" />
          </Button>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">Basic Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-foreground">First Name</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    className="bg-background border-border text-foreground"
                    placeholder="Enter your first name"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-foreground">Last Name</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    className="bg-background border-border text-foreground"
                    placeholder="Enter your last name"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="bio" className="text-foreground">Bio</Label>
                <textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  className="w-full p-3 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  rows={3}
                  placeholder="Tell us about yourself..."
                />
              </div>
            </div>

            {/* Professional Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">Professional Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="currentCompany" className="text-foreground">Current Company</Label>
                  <Input
                    id="currentCompany"
                    value={formData.currentCompany}
                    onChange={(e) => handleInputChange('currentCompany', e.target.value)}
                    className="bg-background border-border text-foreground"
                    placeholder="e.g., Google, Microsoft"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="designation" className="text-foreground">Designation</Label>
                  <Input
                    id="designation"
                    value={formData.designation}
                    onChange={(e) => handleInputChange('designation', e.target.value)}
                    className="bg-background border-border text-foreground"
                    placeholder="e.g., Software Engineer"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="location" className="text-foreground">Location</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  className="bg-background border-border text-foreground"
                  placeholder="e.g., Bangalore, India"
                />
              </div>
            </div>

            {/* Social Media Links */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">Social Media & Links</h3>
              
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="linkedinUrl" className="text-foreground">LinkedIn URL</Label>
                  <Input
                    id="linkedinUrl"
                    value={formData.linkedinUrl}
                    onChange={(e) => handleInputChange('linkedinUrl', e.target.value)}
                    className="bg-background border-border text-foreground"
                    placeholder="https://linkedin.com/in/username"
                  />
                  {errors.linkedinUrl && (
                    <p className="text-red-400 text-sm">{errors.linkedinUrl}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="githubUrl" className="text-foreground">GitHub URL</Label>
                  <Input
                    id="githubUrl"
                    value={formData.githubUrl}
                    onChange={(e) => handleInputChange('githubUrl', e.target.value)}
                    className="bg-background border-border text-foreground"
                    placeholder="https://github.com/username"
                  />
                  {errors.githubUrl && (
                    <p className="text-red-400 text-sm">{errors.githubUrl}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="leetcodeUrl" className="text-foreground">LeetCode URL</Label>
                  <Input
                    id="leetcodeUrl"
                    value={formData.leetcodeUrl}
                    onChange={(e) => handleInputChange('leetcodeUrl', e.target.value)}
                    className="bg-background border-border text-foreground"
                    placeholder="https://leetcode.com/username"
                  />
                  {errors.leetcodeUrl && (
                    <p className="text-red-400 text-sm">{errors.leetcodeUrl}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="resumeUrl" className="text-foreground">Resume URL</Label>
                  <Input
                    id="resumeUrl"
                    value={formData.resumeUrl}
                    onChange={(e) => handleInputChange('resumeUrl', e.target.value)}
                    className="bg-background border-border text-foreground"
                    placeholder="https://drive.google.com/your-resume"
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isLoading}
                className="bg-transparent border-border text-foreground hover:bg-surface-hover"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="bg-primary hover:bg-primary-hover text-white"
              >
                {isLoading ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
