"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Button } from "../ui/button"
import { generateAvatar } from "../../lib/utils"
import { useAuth } from "../providers/AuthProvider"
import { useUser } from "../../contexts/UserContext"
import ProfileEditModal from "../profile/ProfileEditModal"
import { Edit3 } from "lucide-react"


export default function DashboardSidebar({ activeTab, onTabChange, onAddPost }) {
  const router = useRouter()
  const { user } = useAuth()
  const { userProfile, getFullName } = useUser()
  const [isProfileEditOpen, setIsProfileEditOpen] = useState(false)

  // Get user data from UserContext
  const currentUser = {
    name: getFullName(),
    email: userProfile?.email || user?.email || "",
    batch: userProfile?.passingYear || "N/A",
    branch: userProfile?.branch || "N/A",
    company: userProfile?.currentCompany || "Not specified",
    designation: userProfile?.designation || "Not specified",
    location: userProfile?.location || "Not specified",
    connections: userProfile?.connections || 0,
    profileCompletion: userProfile?.profileCompletion || 50,
    linkedinUrl: userProfile?.linkedinUrl || "",
    githubUrl: userProfile?.githubUrl || "",
    leetcodeUrl: userProfile?.leetcodeUrl || "",
    resumeUrl: userProfile?.resumeUrl || "",
  }
  
  // 🔧 FIX: Real-time navigation handler
  const handleNavigation = (tabId) => {
    console.log(`[DASHBOARD_SIDEBAR] 🎯 Navigating to: ${tabId}`)
    
    // Update active tab for UI state
    onTabChange(tabId)
    
    // Navigate to actual route for real-time navigation
    switch (tabId) {
      case 'feed':
        router.push('/dashboard')
        break
      case 'jobs':
        router.push('/jobs')
        break
      case 'events':
        router.push('/events')
        break
      case 'directory':
        router.push('/directory')
        break
      default:
        console.warn(`[DASHBOARD_SIDEBAR] ⚠️ Unknown tab: ${tabId}`)
    }
  }
  
  const avatar = generateAvatar(currentUser.name)

  return (
    <div className="space-y-6">
      {/* Profile Edit Modal */}
      <ProfileEditModal 
        isOpen={isProfileEditOpen} 
        onClose={() => setIsProfileEditOpen(false)} 
      />

      {/* User Profile Card */}
      <Card className="bg-gradient-to-br from-primary/5 to-chart-2/5">
        <CardContent className="p-6">
          <div className="text-center">
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center text-white font-bold text-xl mx-auto mb-4"
              style={{ backgroundColor: avatar.backgroundColor }}
            >
              {avatar.initials}
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-1">{currentUser.name}</h3>
            <p className="text-foreground-muted text-sm mb-2">
              {currentUser.designation} at {currentUser.company}
            </p>
            <div className="flex items-center justify-center space-x-2 mb-4">
              <span className="text-xs text-primary bg-primary/10 px-2 py-1 rounded">{currentUser.branch}</span>
              <span className="text-xs text-foreground-muted">Class of {currentUser.batch}</span>
            </div>

            {/* Profile completion */}
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-foreground-muted">Profile Completion</span>
                <span className="text-primary font-medium">{currentUser.profileCompletion}%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-primary to-chart-2 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${currentUser.profileCompletion}%` }}
                ></div>
              </div>
            </div>

            {/* Quick links */}
            <div className="flex justify-center space-x-4 mb-4">
              {currentUser.resumeUrl && (
                <a
                  href={currentUser.resumeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-foreground-muted hover:text-primary transition-colors"
                  title="Resume"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
                      clipRule="evenodd"
                    />
                  </svg>
                </a>
              )}

              {currentUser.linkedinUrl && (
                <a
                  href={currentUser.linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-foreground-muted hover:text-blue-500 transition-colors"
                  title="LinkedIn"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </a>
              )}

              {currentUser.githubUrl && (
                <a
                  href={currentUser.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-foreground-muted hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                  title="GitHub"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 10.956.69-.069-.5-.25-.5-.556v-2.237c-3.338.724-4.042-1.61-4.042-1.61C2.65 17.4 1.73 16.85 1.73 16.85c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.997.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.467-2.38 1.235-3.221-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.841 1.23 1.911 1.23 3.221 0 4.609-2.807 5.624-5.479 5.921.42.36.81 1.096.81 2.22v3.293c0 .319-.192.694-.801.576C20.565 21.795 24 17.3 24 11.987 24 5.367 18.624.001 12.017.001z"/>
                  </svg>
                </a>
              )}

              {currentUser.leetcodeUrl && (
                <a
                  href={currentUser.leetcodeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-foreground-muted hover:text-orange-500 transition-colors"
                  title="LeetCode"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M13.483 0a1.374 1.374 0 0 0-.961.438L7.116 6.226l-3.854 4.126a5.266 5.266 0 0 0-1.209 2.104 5.35 5.35 0 0 0-.125.513 5.527 5.527 0 0 0 .062 2.362 5.83 5.83 0 0 0 .349 1.017 5.938 5.938 0 0 0 1.271 1.818l4.277 4.193.039.038c2.248 2.165 5.852 2.133 8.063-.074l2.396-2.392c.54-.54.54-1.414.003-1.955a1.378 1.378 0 0 0-1.951-.003l-2.396 2.392a3.021 3.021 0 0 1-4.205.038l-.02-.019-4.276-4.193c-.652-.64-.972-1.469-.948-2.263a2.68 2.68 0 0 1 .066-.523 2.545 2.545 0 0 1 .619-1.164L9.13 8.114c1.058-1.134 3.204-1.27 4.43-.278l3.501 2.831c.593.48 1.461.387 1.94-.207a1.384 1.384 0 0 0-.207-1.943l-3.5-2.831c-.8-.647-1.766-1.045-2.774-1.202l2.015-2.158A1.384 1.384 0 0 0 13.483 0zm-2.866 12.815a1.38 1.38 0 0 0-1.38 1.382 1.38 1.38 0 0 0 1.38 1.382H20.79a1.38 1.38 0 0 0 1.38-1.382 1.38 1.38 0 0 0-1.38-1.382z"/>
                  </svg>
                </a>
              )}
            </div>

            <div className="text-sm text-foreground-muted mb-4">
              <span className="font-medium text-primary">{currentUser.connections}</span> connections
            </div>

            {/* Edit Profile Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsProfileEditOpen(true)}
              className="w-full bg-transparent border-border text-foreground hover:bg-surface-hover"
            >
              <Edit3 className="w-4 h-4 mr-2" />
              Edit Profile
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Navigation</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <nav className="space-y-1">
            {[
              { id: "feed", label: "News Feed", icon: "🏠" },
              { id: "jobs", label: "Job Board", icon: "💼" },
              { id: "events", label: "Events", icon: "📅" },
              { id: "directory", label: "Alumni Directory", icon: "👥" },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavigation(item.id)}
                className={`w-full flex items-center space-x-3 px-6 py-3 text-left transition-colors hover:scale-105 transition-transform duration-200 ${
                  activeTab === item.id
                    ? "bg-primary/10 text-primary border-r-2 border-primary"
                    : "text-foreground-muted hover:text-foreground hover:bg-surface-hover"
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
          </nav>
        </CardContent>
      </Card>

      {/* Logout */}
      <Card>
        <CardContent className="p-4">
          <Button variant="outline" className="w-full bg-transparent">
            <a href="/">Logout</a>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
