"use client"

import { useState } from "react"
import StatsSidebar from "./StatsSidebar"
import UnifiedNavbar from "./UnifiedNavbar"

/**
 * Unified Dashboard Layout
 * Ensures consistent 3-column layout across all dashboard pages
 * (Feed, Jobs, Events, Directory, etc.)
 */
export default function DashboardLayout({ 
  children,
  title = "Dashboard",
  subtitle = "Welcome back to your alumni network",
  activeTab = "feed"
}) {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <UnifiedNavbar activeTab={activeTab} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left Sidebar - Now contains profile and stats only */}
          <div className="lg:w-80 flex-shrink-0">
            <StatsSidebar />
          </div>

          {/* Main Content - Expanded to fill more space */}
          <div className="flex-1 min-w-0">
            <div className="bg-surface border border-border-subtle rounded-lg p-6 mb-6">
              <h1 className="text-2xl font-bold text-foreground">{title}</h1>
              <p className="text-foreground-muted">{subtitle}</p>
            </div>
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}