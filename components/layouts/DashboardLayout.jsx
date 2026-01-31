"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import StatsSidebar from "./StatsSidebar"
import UnifiedNavbar from "./UnifiedNavbar"
import { useAuth } from "../providers/AuthProvider"

/**
 * Unified Dashboard Layout
 * Ensures consistent 3-column layout across all dashboard pages
 * (Feed, Jobs, Events, Directory, etc.)
 * 
 * Includes client-side auth protection for Firebase mode
 */
export default function DashboardLayout({
  children,
  title = "Dashboard",
  subtitle = "Welcome back to your alumni network",
  activeTab = "feed"
}) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  // Client-side auth protection
  useEffect(() => {
    if (isClient && !loading && !user) {
      console.log('[DASHBOARD_LAYOUT] No user found, redirecting to login')
      router.push('/login')
    }
  }, [isClient, loading, user, router])

  // Show loading while checking auth
  if (loading || !isClient) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  // If not authenticated, don't render (redirect is happening)
  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-foreground-muted">Redirecting to login...</p>
        </div>
      </div>
    )
  }

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