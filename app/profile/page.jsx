"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "../../components/providers/AuthProvider"
import Navbar from "../../components/Navbar"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { Button } from "../../components/ui/button"
import { User, Mail, Building, MapPin, Briefcase, GraduationCap, Github, Linkedin, Code, FileText } from "lucide-react"

export default function ProfilePage() {
  const router = useRouter()
  const { user, session, loading } = useAuth()
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    if (!loading) {
      if (!session) {
        console.log('No session found, redirecting to auth')
        router.push('/auth')
      } else {
        console.log('Session found, showing profile page')
        setIsChecking(false)
      }
    }
  }, [session, loading, router])

  // Show loading while checking authentication
  if (loading || isChecking) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
          <p className="text-foreground-muted">Loading profile...</p>
        </div>
      </div>
    )
  }

  // Don't render if no session
  if (!session) {
    return null
  }

  // Get user data
  const userData = {
    name: user?.user_metadata?.first_name && user?.user_metadata?.last_name 
      ? `${user.user_metadata.first_name} ${user.user_metadata.last_name}`
      : user?.email?.split('@')[0] || "User",
    email: user?.email || "",
    usn: user?.user_metadata?.usn || "N/A",
    branch: user?.user_metadata?.branch || "Not specified",
    batch: user?.user_metadata?.passing_year || "N/A",
    joiningYear: user?.user_metadata?.joining_year || "N/A",
    company: user?.user_metadata?.currentCompany || "Not specified",
    designation: user?.user_metadata?.designation || "Not specified",
    location: user?.user_metadata?.location || "Not specified",
    linkedinUrl: user?.user_metadata?.linkedinUrl || "",
    githubUrl: user?.user_metadata?.githubUrl || "",
    leetcodeUrl: user?.user_metadata?.leetcodeUrl || "",
    resumeUrl: user?.user_metadata?.resumeUrl || "",
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">My Profile</h1>
          <p className="text-foreground-muted">View and manage your profile information</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Profile Card */}
          <div className="lg:col-span-1">
            <Card className="bg-surface border-border">
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <User className="w-12 h-12 text-primary" />
                  </div>
                  <h2 className="text-xl font-bold text-foreground mb-1">{userData.name}</h2>
                  <p className="text-foreground-muted text-sm mb-4">{userData.email}</p>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-center gap-2 text-foreground-muted">
                      <GraduationCap className="w-4 h-4" />
                      <span>{userData.branch}</span>
                    </div>
                    <div className="flex items-center justify-center gap-2 text-foreground-muted">
                      <span className="font-medium">Batch:</span>
                      <span>{userData.batch}</span>
                    </div>
                    <div className="flex items-center justify-center gap-2 text-foreground-muted">
                      <span className="font-medium">USN:</span>
                      <span>{userData.usn}</span>
                    </div>
                  </div>

                  <Button 
                    onClick={() => router.push('/dashboard')}
                    className="w-full mt-6 bg-primary hover:bg-primary-hover"
                  >
                    Go to Dashboard
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Professional Info */}
            <Card className="bg-surface border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="w-5 h-5" />
                  Professional Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-foreground-muted">Company</label>
                    <div className="flex items-center gap-2 mt-1">
                      <Building className="w-4 h-4 text-foreground-muted" />
                      <p className="text-foreground">{userData.company}</p>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground-muted">Designation</label>
                    <div className="flex items-center gap-2 mt-1">
                      <Briefcase className="w-4 h-4 text-foreground-muted" />
                      <p className="text-foreground">{userData.designation}</p>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground-muted">Location</label>
                    <div className="flex items-center gap-2 mt-1">
                      <MapPin className="w-4 h-4 text-foreground-muted" />
                      <p className="text-foreground">{userData.location}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Social Links */}
            <Card className="bg-surface border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="w-5 h-5" />
                  Social Profiles
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {userData.linkedinUrl ? (
                  <a 
                    href={userData.linkedinUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 rounded-lg bg-background hover:bg-surface-hover transition-colors"
                  >
                    <Linkedin className="w-5 h-5 text-blue-500" />
                    <div>
                      <p className="text-sm font-medium text-foreground">LinkedIn</p>
                      <p className="text-xs text-foreground-muted">{userData.linkedinUrl}</p>
                    </div>
                  </a>
                ) : (
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-background opacity-50">
                    <Linkedin className="w-5 h-5 text-foreground-muted" />
                    <p className="text-sm text-foreground-muted">LinkedIn not added</p>
                  </div>
                )}

                {userData.githubUrl ? (
                  <a 
                    href={userData.githubUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 rounded-lg bg-background hover:bg-surface-hover transition-colors"
                  >
                    <Github className="w-5 h-5 text-foreground" />
                    <div>
                      <p className="text-sm font-medium text-foreground">GitHub</p>
                      <p className="text-xs text-foreground-muted">{userData.githubUrl}</p>
                    </div>
                  </a>
                ) : (
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-background opacity-50">
                    <Github className="w-5 h-5 text-foreground-muted" />
                    <p className="text-sm text-foreground-muted">GitHub not added</p>
                  </div>
                )}

                {userData.leetcodeUrl ? (
                  <a 
                    href={userData.leetcodeUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 rounded-lg bg-background hover:bg-surface-hover transition-colors"
                  >
                    <Code className="w-5 h-5 text-orange-500" />
                    <div>
                      <p className="text-sm font-medium text-foreground">LeetCode</p>
                      <p className="text-xs text-foreground-muted">{userData.leetcodeUrl}</p>
                    </div>
                  </a>
                ) : (
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-background opacity-50">
                    <Code className="w-5 h-5 text-foreground-muted" />
                    <p className="text-sm text-foreground-muted">LeetCode not added</p>
                  </div>
                )}

                {userData.resumeUrl ? (
                  <a 
                    href={userData.resumeUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 rounded-lg bg-background hover:bg-surface-hover transition-colors"
                  >
                    <FileText className="w-5 h-5 text-green-500" />
                    <div>
                      <p className="text-sm font-medium text-foreground">Resume</p>
                      <p className="text-xs text-foreground-muted">View Resume</p>
                    </div>
                  </a>
                ) : (
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-background opacity-50">
                    <FileText className="w-5 h-5 text-foreground-muted" />
                    <p className="text-sm text-foreground-muted">Resume not added</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
