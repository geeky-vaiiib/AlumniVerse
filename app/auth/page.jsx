"use client"

import { Suspense } from 'react'
import AuthFlow from "../../components/auth/AuthFlow"
import Navbar from "../../components/Navbar"

function AuthContent() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <AuthFlow initialStep="signup" />
    </div>
  )
}

export default function AuthPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    }>
      <AuthContent />
    </Suspense>
  )
}
