"use client"

import { useState } from "react"
import Link from "next/link"
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
              <Link href="/">
                <h1 className="text-2xl font-bold gradient-text">AlumniVerse</h1>
              </Link>
            </div>
          </div>

          {/* Desktop Navigation - Center */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              <button
                onClick={() => scrollToSection('features')}
                className="relative group text-foreground-muted hover:text-foreground px-3 py-2 text-sm font-medium transition-colors cursor-pointer"
              >
                Features
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300 ease-out"></span>
              </button>
              <button
                onClick={() => scrollToSection('about')}
                className="relative group text-foreground-muted hover:text-foreground px-3 py-2 text-sm font-medium transition-colors cursor-pointer"
              >
                About
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300 ease-out"></span>
              </button>
              <button
                onClick={() => scrollToSection('footer')}
                className="relative group text-foreground-muted hover:text-foreground px-3 py-2 text-sm font-medium transition-colors cursor-pointer"
              >
                Contact
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300 ease-out"></span>
              </button>
            </div>
          </div>

          {/* Right Side - Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <>
                <Link href="/profile" className="relative group text-foreground-muted hover:text-foreground px-4 py-2 rounded-md transition-colors">
                  Profile
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300 ease-out"></span>
                </Link>
                <Link href="/dashboard" className="relative group text-foreground-muted hover:text-foreground px-4 py-2 rounded-md transition-colors">
                  Dashboard
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300 ease-out"></span>
                </Link>
                <button 
                  onClick={handleSignOut}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90 px-4 py-2 rounded-md transition-colors"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="relative group text-foreground-muted hover:text-foreground px-4 py-2 rounded-md transition-colors">
                  Login
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300 ease-out"></span>
                </Link>
                <Link href="/auth" className="bg-primary text-primary-foreground hover:bg-primary-hover px-4 py-2 rounded-md transition-colors hover-glow">
                  Get Started
                </Link>
              </>
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
                className="relative group text-foreground-muted hover:text-foreground block px-3 py-2 text-base font-medium w-full text-left"
              >
                Features
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300 ease-out"></span>
              </button>
              <button
                onClick={() => scrollToSection('about')}
                className="relative group text-foreground-muted hover:text-foreground block px-3 py-2 text-base font-medium w-full text-left"
              >
                About
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300 ease-out"></span>
              </button>
              <button
                onClick={() => scrollToSection('footer')}
                className="relative group text-foreground-muted hover:text-foreground block px-3 py-2 text-base font-medium w-full text-left"
              >
                Contact
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300 ease-out"></span>
              </button>
              <div className="pt-4 pb-3 border-t border-border-subtle">
                <div className="flex items-center space-x-3">
                  <button className="relative group w-full text-foreground-muted hover:text-foreground px-4 py-2 rounded-md transition-colors">
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
