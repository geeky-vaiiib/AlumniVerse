"use client"

import { Suspense } from 'react'
import AuthFlow from '../../components/auth/AuthFlow'

function LoginContent() {
  return (
    <div className="min-h-screen bg-background">
      {/* No Navbar on login page as per requirements */}
      <AuthFlow initialStep="login" />
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#1A1A1A] flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  )
}
