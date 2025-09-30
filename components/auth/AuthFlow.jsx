"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import LoginForm from "./LoginForm"
import SignUpForm from "./SignUpForm"
import OTPVerification from "./OTPVerification"
import ProfileCreation from "./ProfileCreation"
import ForgotPassword from "./ForgotPassword"

export default function AuthFlow() {
  const searchParams = useSearchParams()
  const mode = searchParams.get('mode')
  const [currentStep, setCurrentStep] = useState(mode === 'signup' ? 'signup' : 'login') // login, signup, otp, profile, forgot
  const [userData, setUserData] = useState({})

  const handleStepChange = (step, data = {}) => {
    setCurrentStep(step)
    setUserData((prev) => ({ ...prev, ...data }))
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left side - Auth forms */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {currentStep === "login" && <LoginForm onStepChange={handleStepChange} />}
          {currentStep === "signup" && <SignUpForm onStepChange={handleStepChange} />}
          {currentStep === "otp" && <OTPVerification email={userData.email} onStepChange={handleStepChange} />}
          {currentStep === "profile" && <ProfileCreation userData={userData} onStepChange={handleStepChange} />}
          {currentStep === "forgot" && <ForgotPassword onStepChange={handleStepChange} />}
        </div>
      </div>

      {/* Right side - Feature showcase */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-primary/10 to-secondary/10 items-center justify-center p-8">
        <div className="max-w-lg text-center">
          <h2 className="text-3xl font-bold text-foreground mb-6">
            Join Your <span className="gradient-text">Alumni Network</span>
          </h2>
          <div className="space-y-6">
            <div className="flex items-center space-x-4 text-left">
              <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center">
                <span className="text-2xl">🎓</span>
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Connect with Alumni</h3>
                <p className="text-foreground-muted text-sm">Find and connect with fellow graduates</p>
              </div>
            </div>
            <div className="flex items-center space-x-4 text-left">
              <div className="w-12 h-12 bg-secondary/20 rounded-lg flex items-center justify-center">
                <span className="text-2xl">💼</span>
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Career Opportunities</h3>
                <p className="text-foreground-muted text-sm">Access exclusive job postings and referrals</p>
              </div>
            </div>
            <div className="flex items-center space-x-4 text-left">
              <div className="w-12 h-12 bg-accent/20 rounded-lg flex items-center justify-center">
                <span className="text-2xl">🤝</span>
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Professional Growth</h3>
                <p className="text-foreground-muted text-sm">Mentorship and networking opportunities</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
