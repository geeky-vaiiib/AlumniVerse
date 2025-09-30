"use client"

import { useState } from "react"
import DashboardSidebar from "./DashboardSidebar"
import MainFeed from "./MainFeed"
import RightSidebar from "./RightSidebar"

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("feed")
  const [posts, setPosts] = useState([])

  const handleAddPost = (newPost) => {
    setPosts(prevPosts => [newPost, ...prevPosts])
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-surface border-b border-border-subtle">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
              <p className="text-foreground-muted">Welcome back to your alumni network</p>
            </div>
            <div className="flex items-center space-x-4">
              <button className="relative p-2 text-foreground-muted hover:text-foreground transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 17h5l-5 5v-5zM9 7H4l5-5v5z"
                  />
                </svg>
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full"></span>
              </button>
              <button className="relative p-2 text-foreground-muted hover:text-foreground transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 17h5l-5 5v-5zM9 7H4l5-5v5z"
                  />
                </svg>
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-destructive rounded-full"></span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left Sidebar */}
          <div className="lg:w-80 flex-shrink-0">
            <DashboardSidebar activeTab={activeTab} onTabChange={setActiveTab} onAddPost={handleAddPost} />
          </div>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            <MainFeed activeTab={activeTab} userPosts={posts} />
          </div>

          {/* Right Sidebar */}
          <div className="lg:w-80 flex-shrink-0">
            <RightSidebar />
          </div>
        </div>
      </div>
    </div>
  )
}
