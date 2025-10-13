"use client"

import { useAuth } from "@/components/providers/AuthProvider"
import JobBoard from "@/components/jobs/JobBoard"
import DashboardLayout from "@/components/layouts/DashboardLayout"

export default function JobsPage() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
          <p className="mt-4 text-foreground-muted">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Access Restricted</h1>
          <p className="text-foreground-muted mb-6">Please log in to access the job board.</p>
          <a
            href="/auth"
            className="bg-primary text-primary-foreground hover:bg-primary-hover px-6 py-3 rounded-md transition-colors"
          >
            Sign In
          </a>
        </div>
      </div>
    )
  }

  return (
    <DashboardLayout
      title="Job Board"
      subtitle="Find opportunities from your alumni network"
      activeTab="jobs"
    >
      <JobBoard />
    </DashboardLayout>
  )
}