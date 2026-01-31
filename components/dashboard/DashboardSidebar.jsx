"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Button } from "../ui/button"
import { generateAvatar } from "../../lib/utils"
import { useAuth } from "../providers/AuthProvider"
import { useUser } from "../../contexts/UserContext"
import ProfileEditModal from "../profile/ProfileEditModal"
import { Edit3, Home, Briefcase, Calendar, Users, LogOut } from "lucide-react"


export default function DashboardSidebar({ activeTab, onTabChange = () => { }, onAddPost }) {
  const router = useRouter()
  const { user } = useAuth()
  const { userProfile, getFullName } = useUser()
  const [isProfileEditOpen, setIsProfileEditOpen] = useState(false)

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

  const handleNavigation = (tabId) => {
    if (typeof onTabChange === 'function') {
      onTabChange(tabId)
    }

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
    }
  }

  const avatar = generateAvatar(currentUser.name)

  const navItems = [
    { id: "feed", label: "News Feed", icon: Home },
    { id: "jobs", label: "Job Board", icon: Briefcase },
    { id: "events", label: "Events", icon: Calendar },
    { id: "directory", label: "Directory", icon: Users },
  ]

  return (
    <div className="space-y-6">
      <ProfileEditModal
        isOpen={isProfileEditOpen}
        onClose={() => setIsProfileEditOpen(false)}
      />

      {/* User Profile Card */}
      <Card className="glass-card border-0 overflow-hidden">
        {/* Gradient header */}
        <div className="h-20 bg-gradient-to-r from-primary/20 via-accent-blue/20 to-accent-teal/20" />

        <CardContent className="px-6 pb-6 -mt-10">
          <div className="text-center">
            {/* Avatar */}
            <div className="relative inline-block">
              <div
                className="w-20 h-20 rounded-2xl flex items-center justify-center text-white font-bold text-xl ring-4 ring-background shadow-lg"
                style={{ backgroundColor: avatar.backgroundColor }}
              >
                {avatar.initials}
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-accent-green rounded-full border-2 border-background flex items-center justify-center">
                <span className="text-xs">✓</span>
              </div>
            </div>

            <h3 className="mt-4 text-lg font-semibold text-foreground">{currentUser.name}</h3>
            <p className="text-foreground-muted text-sm">
              {currentUser.designation} at {currentUser.company}
            </p>

            {/* Tags */}
            <div className="flex items-center justify-center gap-2 mt-3">
              <span className="badge-primary">{currentUser.branch}</span>
              <span className="text-xs text-foreground-muted">Class of {currentUser.batch}</span>
            </div>

            {/* Profile completion */}
            <div className="mt-6">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-foreground-muted">Profile Completion</span>
                <span className="font-semibold text-primary">{currentUser.profileCompletion}%</span>
              </div>
              <div className="h-2 bg-surface rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary to-accent-blue rounded-full transition-all duration-500"
                  style={{ width: `${currentUser.profileCompletion}%` }}
                />
              </div>
            </div>

            {/* Social Links */}
            <div className="flex justify-center gap-3 mt-6">
              {currentUser.linkedinUrl && (
                <a
                  href={currentUser.linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-lg bg-surface hover:bg-surface-hover flex items-center justify-center text-foreground-muted hover:text-blue-500 transition-all"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                </a>
              )}
              {currentUser.githubUrl && (
                <a
                  href={currentUser.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-lg bg-surface hover:bg-surface-hover flex items-center justify-center text-foreground-muted hover:text-foreground transition-all"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 10.956.69-.069-.5-.25-.5-.556v-2.237c-3.338.724-4.042-1.61-4.042-1.61C2.65 17.4 1.73 16.85 1.73 16.85c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.997.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.467-2.38 1.235-3.221-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.841 1.23 1.911 1.23 3.221 0 4.609-2.807 5.624-5.479 5.921.42.36.81 1.096.81 2.22v3.293c0 .319-.192.694-.801.576C20.565 21.795 24 17.3 24 11.987 24 5.367 18.624.001 12.017.001z" />
                  </svg>
                </a>
              )}
              {currentUser.resumeUrl && (
                <a
                  href={currentUser.resumeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-lg bg-surface hover:bg-surface-hover flex items-center justify-center text-foreground-muted hover:text-accent-teal transition-all"
                  title="Resume"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                  </svg>
                </a>
              )}
            </div>

            {/* Connections */}
            <div className="mt-6 py-4 border-t border-border">
              <span className="text-2xl font-bold text-foreground">{currentUser.connections}</span>
              <span className="text-foreground-muted text-sm ml-2">connections</span>
            </div>

            {/* Edit Profile Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsProfileEditOpen(true)}
              className="w-full bg-surface hover:bg-surface-hover border-border"
            >
              <Edit3 className="w-4 h-4 mr-2" />
              Edit Profile
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <Card className="glass-card border-0 overflow-hidden">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-foreground-muted uppercase tracking-wider">Navigation</CardTitle>
        </CardHeader>
        <CardContent className="p-2">
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavigation(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-200 group ${activeTab === item.id
                      ? "bg-gradient-to-r from-primary/15 to-accent-blue/10 text-primary"
                      : "text-foreground-muted hover:text-foreground hover:bg-surface"
                    }`}
                >
                  <Icon className={`w-5 h-5 ${activeTab === item.id ? 'text-primary' : 'text-foreground-muted group-hover:text-foreground'}`} />
                  <span className="font-medium">{item.label}</span>
                  {activeTab === item.id && (
                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />
                  )}
                </button>
              )
            })}
          </nav>
        </CardContent>
      </Card>

      {/* Logout */}
      <Card className="glass-card border-0">
        <CardContent className="p-3">
          <Button
            variant="ghost"
            className="w-full justify-start text-foreground-muted hover:text-destructive hover:bg-destructive/10"
            onClick={() => router.push('/')}
          >
            <LogOut className="w-5 h-5 mr-3" />
            Logout
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
