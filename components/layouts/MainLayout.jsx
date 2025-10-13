"use client"

import { useUser } from "@/contexts/UserContext"
import DashboardSidebar from "../dashboard/DashboardSidebar"
import { useState } from "react"

export default function MainLayout({ children, title, subtitle, rightSidebar = null }) {
  const [activeTab, setActiveTab] = useState('feed')
  const { userProfile, loading } = useUser()

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1A1A1A] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#4A90E2] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#1A1A1A]">
      {/* Header with Title and Subtitle */}
      <header className="bg-[#2D2D2D] border-b border-[#3D3D3D] px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">{title}</h1>
            {subtitle && <p className="text-[#B0B0B0] mt-1">{subtitle}</p>}
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-[#4A90E2] text-2xl font-bold">✨ AlumniVerse</span>
          </div>
        </div>
      </header>

      {/* Main Content Grid */}
      <div className="px-6 pb-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Sidebar */}
          <aside className="lg:col-span-1">
            <DashboardSidebar 
              activeTab={activeTab} 
              onTabChange={setActiveTab}
            />
          </aside>

          {/* Main Content */}
          <main className={`${rightSidebar ? 'lg:col-span-2' : 'lg:col-span-3'}`}>
            {children}
          </main>

          {/* Right Sidebar (Optional) */}
          {rightSidebar && (
            <aside className="lg:col-span-1">
              {rightSidebar}
            </aside>
          )}
        </div>
      </div>
    </div>
  )
}