"use client"

import { Suspense } from 'react'
import AuthFlow from "../../components/auth/AuthFlow"

function AuthContent() {
  return <AuthFlow initialStep="signup" />
}

export default function AuthPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#1A1A1A] flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    }>
      <AuthContent />
    </Suspense>
  )
}
