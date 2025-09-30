"use client"

import { useState } from "react"
import { useAuth } from "@/components/providers/AuthProvider"
import { useRouter } from "next/navigation"

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { user, signOut, loading } = useAuth()
  const router = useRouter()

  const handleSignOut = async () => {
    await signOut()
    router.push('/')
  }

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      })
    }
    setIsMenuOpen(false) // Close mobile menu after clicking
  }

  return (
    <nav className="sticky top-0 z-50 glass border-b border-border-subtle">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <a href="/">
                <h1 className="text-2xl font-bold gradient-text">AlumniVerse</h1>
              </a>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              {!user && (
                <button
                  onClick={() => scrollToSection('features')}
                  className="text-foreground-muted hover:text-foreground px-3 py-2 text-sm font-medium transition-colors cursor-pointer relative group"
                >
                  Features
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300 ease-out"></span>
                </button>
              )}
              {user && (
                <>
                  <a
                    href="/directory"
                    className="text-foreground-muted hover:text-foreground px-3 py-2 text-sm font-medium transition-colors"
                  >
                    Directory
                  </a>
                  <a
                    href="/jobs"
                    className="text-foreground-muted hover:text-foreground px-3 py-2 text-sm font-medium transition-colors"
                  >
                    Jobs
                  </a>
                  <a
                    href="/events"
                    className="text-foreground-muted hover:text-foreground px-3 py-2 text-sm font-medium transition-colors"
                  >
                    Events
                  </a>
                  <a
                    href="/dashboard"
                    className="text-foreground-muted hover:text-foreground px-3 py-2 text-sm font-medium transition-colors"
                  >
                    Dashboard
                  </a>
                </>
              )}
              {!user && (
                <>
                  <button
                    onClick={() => scrollToSection('about')}
                    className="text-foreground-muted hover:text-foreground px-3 py-2 text-sm font-medium transition-colors cursor-pointer relative group"
                  >
                  About
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300 ease-out"></span>
                  </button>
                  <button
                    onClick={() => scrollToSection('footer')}
                    className="text-foreground-muted hover:text-foreground px-3 py-2 text-sm font-medium transition-colors cursor-pointer relative group"
                  >
                  Contact
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300 ease-out"></span>
                  </button>
                </>
              )}
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {!user && !loading && (
              <>
                <button className="text-foreground-muted hover:text-foreground px-4 py-2 rounded-md transition-colors relative group">
                  <a href="/auth">Login</a>
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300 ease-out"></span>
                </button>
                <button className="bg-primary text-primary-foreground hover:bg-primary-hover px-4 py-2 rounded-md transition-colors hover-glow">
                  <a href="/auth?mode=signup">Get Started</a>
                </button>
              </>
            )}
            {user && (
              <div className="flex items-center space-x-4">
                <span className="text-foreground-muted text-sm">
                  Welcome, {user.email?.split('@')[0]}
                </span>
                <button
                  onClick={handleSignOut}
                  className="text-foreground-muted hover:text-foreground px-4 py-2 rounded-md transition-colors"
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-foreground-muted hover:text-foreground p-2"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t border-border-subtle">
              <button
                onClick={() => scrollToSection('features')}
                className="text-foreground-muted hover:text-foreground block px-3 py-2 text-base font-medium w-full text-left relative group"
              >
                Features
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300 ease-out"></span>
              </button>
              <a
                href="/directory"
                className="text-foreground-muted hover:text-foreground block px-3 py-2 text-base font-medium"
              >
                Directory
              </a>
              <a
                href="/jobs"
                className="text-foreground-muted hover:text-foreground block px-3 py-2 text-base font-medium"
              >
                Jobs
              </a>
              <a
                href="/dashboard"
                className="text-foreground-muted hover:text-foreground block px-3 py-2 text-base font-medium"
              >
                Dashboard
              </a>
              <button
                onClick={() => scrollToSection('about')}
                className="text-foreground-muted hover:text-foreground block px-3 py-2 text-base font-medium w-full text-left relative group"
              >
                About
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300 ease-out"></span>
              </button>
              <button
                onClick={() => scrollToSection('footer')}
                className="text-foreground-muted hover:text-foreground block px-3 py-2 text-base font-medium w-full text-left relative group"
              >
                Contact
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300 ease-out"></span>
              </button>
              <div className="pt-4 pb-3 border-t border-border-subtle">
                <div className="flex items-center space-x-3">
                  <button className="w-full text-foreground-muted hover:text-foreground px-4 py-2 rounded-md transition-colors relative group">
                    <a href="/auth">Login</a>
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300 ease-out"></span>
                  </button>
                  <button className="w-full bg-primary text-primary-foreground hover:bg-primary-hover px-4 py-2 rounded-md transition-colors">
                    <a href="/auth?mode=signup">Get Started</a>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
