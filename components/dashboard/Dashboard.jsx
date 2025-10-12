"use client"

import { useState, useEffect } from "react"
import DashboardSidebar from "./DashboardSidebar"
import MainFeed from "./MainFeed"
import RightSidebar from "./RightSidebar"

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("feed")
  const [posts, setPosts] = useState([])
  
  // ✅ Confirmation log that dashboard mounted successfully
  useEffect(() => {
    console.log("[DASHBOARD] ✅ Dashboard mounted successfully, user session stable")
  }, [])

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
              {/* AlumniVerse Logo/Branding */}
              <div className="flex items-center space-x-2 text-primary">
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2L13.5 8.5L20 7L14.5 12L21 17L13.5 15.5L12 22L10.5 15.5L4 17L9.5 12L3 7L10.5 8.5L12 2Z"/>
                </svg>
                <span className="text-lg font-bold hidden sm:block">AlumniVerse</span>
              </div>
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
