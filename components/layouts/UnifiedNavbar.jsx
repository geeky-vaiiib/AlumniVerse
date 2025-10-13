"use client"

import { useState } from "react"
import Link from "next/link"
import { useAuth } from "@/components/providers/AuthProvider"
import { useRouter } from "next/navigation"

export default function UnifiedNavbar({ activeTab = "feed" }) {
  const { user, signOut, loading } = useAuth()
  const router = useRouter()

  const handleSignOut = async () => {
    await signOut()
    router.push('/')
  }

  const navItems = [
    { id: "feed", label: "News Feed", href: "/dashboard" },
    { id: "jobs", label: "Jobs", href: "/jobs" },
    { id: "events", label: "Events", href: "/events" },
    { id: "directory", label: "Directory", href: "/directory" },
  ]

  return (
    <nav className="bg-[#2D2D2D] border-b border-[#3D3D3D]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/dashboard" className="flex items-center space-x-2">
              <svg className="w-8 h-8 text-[#4A90E2]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L13.5 8.5L20 7L14.5 12L21 17L13.5 15.5L12 22L10.5 15.5L4 17L9.5 12L3 7L10.5 8.5L12 2Z"/>
              </svg>
              <span className="text-xl font-bold text-white">AlumniVerse</span>
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === item.id
                    ? "bg-[#3D3D3D] text-white"
                    : "text-[#B0B0B0] hover:text-white hover:bg-[#353535]"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* User Actions */}
          <div className="hidden md:flex items-center space-x-3">
            {user ? (
              <>
                <Link 
                  href="/profile" 
                  className="text-[#B0B0B0] hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Profile
                </Link>
                <button 
                  onClick={handleSignOut}
                  className="bg-[#E74C3C] hover:bg-[#C0392B] text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link 
                  href="/login" 
                  className="text-[#B0B0B0] hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Login
                </Link>
                <Link 
                  href="/auth" 
                  className="bg-[#4A90E2] hover:bg-[#357ABD] text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button className="text-[#B0B0B0] hover:text-white p-2">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}