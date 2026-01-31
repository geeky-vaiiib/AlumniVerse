"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useAuth } from "@/components/providers/AuthProvider"
import { useRouter } from "next/navigation"

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { user, signOut, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

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
    setIsMenuOpen(false)
  }

  return (
    <nav className={`sticky top-0 z-50 transition-all duration-300 ${scrolled
        ? 'bg-background/80 backdrop-blur-glass border-b border-border shadow-lg shadow-black/5'
        : 'bg-transparent border-b border-transparent'
      }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-primary to-accent-blue rounded-lg blur-sm opacity-50 group-hover:opacity-75 transition-opacity" />
                <div className="relative w-10 h-10 rounded-lg bg-gradient-to-r from-primary to-accent-blue flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2L13.5 8.5L20 7L14.5 12L21 17L13.5 15.5L12 22L10.5 15.5L4 17L9.5 12L3 7L10.5 8.5L12 2Z" />
                  </svg>
                </div>
              </div>
              <span className="text-xl font-bold gradient-text">AlumniVerse</span>
            </Link>
          </div>

          {/* Desktop Navigation - Center */}
          <div className="hidden md:flex items-center space-x-1">
            {['Features', 'About', 'Contact'].map((item) => (
              <button
                key={item}
                onClick={() => scrollToSection(item.toLowerCase() === 'contact' ? 'footer' : item.toLowerCase())}
                className="relative px-4 py-2 text-sm font-medium text-foreground-muted hover:text-foreground transition-colors group"
              >
                {item}
                <span className="absolute inset-x-2 -bottom-px h-px bg-gradient-to-r from-primary/0 via-primary to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            ))}
          </div>

          {/* Right Side - Auth Buttons */}
          <div className="hidden md:flex items-center space-x-3">
            {user ? (
              <>
                <Link
                  href="/dashboard"
                  className="px-4 py-2 text-sm font-medium text-foreground-muted hover:text-foreground transition-colors"
                >
                  Dashboard
                </Link>
                <Link
                  href="/profile"
                  className="px-4 py-2 text-sm font-medium text-foreground-muted hover:text-foreground transition-colors"
                >
                  Profile
                </Link>
                <button
                  onClick={handleSignOut}
                  className="px-4 py-2 rounded-lg text-sm font-medium bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-4 py-2 text-sm font-medium text-foreground-muted hover:text-foreground transition-colors"
                >
                  Login
                </Link>
                <Link
                  href="/auth"
                  className="btn-gradient px-5 py-2.5 rounded-lg text-sm font-semibold"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-lg text-foreground-muted hover:text-foreground hover:bg-surface transition-colors"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <div className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${isMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
          }`}>
          <div className="px-2 pt-2 pb-4 space-y-1 border-t border-border">
            {['Features', 'About', 'Contact'].map((item) => (
              <button
                key={item}
                onClick={() => scrollToSection(item.toLowerCase() === 'contact' ? 'footer' : item.toLowerCase())}
                className="block w-full text-left px-4 py-3 rounded-lg text-base font-medium text-foreground-muted hover:text-foreground hover:bg-surface transition-colors"
              >
                {item}
              </button>
            ))}
            <div className="pt-4 space-y-2">
              {user ? (
                <>
                  <Link href="/dashboard" className="block w-full px-4 py-3 rounded-lg text-center font-medium bg-surface hover:bg-surface-hover transition-colors">
                    Dashboard
                  </Link>
                  <button onClick={handleSignOut} className="block w-full px-4 py-3 rounded-lg text-center font-medium bg-destructive/10 text-destructive">
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" className="block w-full px-4 py-3 rounded-lg text-center font-medium bg-surface hover:bg-surface-hover transition-colors">
                    Login
                  </Link>
                  <Link href="/auth" className="block w-full px-4 py-3 rounded-lg text-center font-semibold btn-gradient">
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}
