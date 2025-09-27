"use client"

import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Button } from "../ui/button"
import { generateAvatar } from "../../lib/utils"

// Mock user data
const currentUser = {
  name: "John Doe",
  batch: "2020",
  branch: "Computer Science",
  company: "Tech Corp",
  designation: "Software Engineer",
  location: "Bangalore, India",
  connections: 156,
  profileCompletion: 85,
  linkedinUrl: "https://linkedin.com/in/johndoe",
  githubUrl: "https://github.com/johndoe",
  resumeUrl: "/resume.pdf",
}

const quickActions = [
  { id: "post", label: "Create Post", icon: "✏️", color: "from-primary to-chart-2" },
  { id: "job", label: "Post Job", icon: "💼", color: "from-chart-2 to-success" },
  { id: "achievement", label: "Share Achievement", icon: "🏆", color: "from-success to-warning" },
  { id: "mentorship", label: "Offer Mentorship", icon: "🤝", color: "from-warning to-primary" },
]

export default function DashboardSidebar({ activeTab, onTabChange }) {
  const avatar = generateAvatar(currentUser.name)

  return (
    <div className="space-y-6">
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
              <a
                href={currentUser.resumeUrl}
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
              <a
                href={currentUser.linkedinUrl}
                className="text-foreground-muted hover:text-primary transition-colors"
                title="LinkedIn"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M16.338 16.338H13.67V12.16c0-.995-.017-2.277-1.387-2.277-1.39 0-1.601 1.086-1.601 2.207v4.248H8.014v-8.59h2.559v1.174h.037c.356-.675 1.227-1.387 2.526-1.387 2.703 0 3.203 1.778 3.203 4.092v4.711zM5.005 6.575a1.548 1.548 0 11-.003-3.096 1.548 1.548 0 01.003 3.096zm-1.337 9.763H6.34v-8.59H3.667v8.59zM17.668 1H2.328C1.595 1 1 1.581 1 2.298v15.403C1 18.418 1.595 19 2.328 19h15.34c.734 0 1.332-.582 1.332-1.299V2.298C19 1.581 18.402 1 17.668 1z"
                    clipRule="evenodd"
                  />
                </svg>
              </a>
              <a
                href={currentUser.githubUrl}
                className="text-foreground-muted hover:text-primary transition-colors"
                title="GitHub"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </a>
            </div>

            <div className="text-sm text-foreground-muted">
              <span className="font-medium text-primary">{currentUser.connections}</span> connections
            </div>
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
              { id: "directory", label: "Alumni Directory", icon: "👥" },
              { id: "jobs", label: "Job Board", icon: "💼" },
              { id: "events", label: "Events", icon: "📅" },
              { id: "badges", label: "Badges", icon: "🏆" },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center space-x-3 px-6 py-3 text-left transition-colors ${
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

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            {quickActions.map((action) => (
              <button
                key={action.id}
                className="p-3 rounded-lg border border-border hover:border-primary transition-all duration-300 hover:scale-105 group"
              >
                <div
                  className={`w-8 h-8 rounded-lg bg-gradient-to-r ${action.color} flex items-center justify-center mb-2 group-hover:scale-110 transition-transform`}
                >
                  <span className="text-sm">{action.icon}</span>
                </div>
                <div className="text-xs font-medium text-foreground group-hover:text-primary transition-colors">
                  {action.label}
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Back to Flow View */}
      <Card>
        <CardContent className="p-4">
          <Button variant="outline" className="w-full bg-transparent">
            <a href="/">Back to Flow View</a>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
