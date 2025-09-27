"use client"

import { useAuth } from "@/components/providers/AuthProvider"
import EventsPage from "@/components/events/EventsPage"

export default function Events() {
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
          <p className="text-foreground-muted mb-6">Please log in to access events.</p>
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

  return <EventsPage />
}
