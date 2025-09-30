"use client"

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import LoginForm from './LoginForm'
import SignUpForm from './SignUpForm'

export default function AuthFlow() {
  const searchParams = useSearchParams()
  const mode = searchParams.get('mode')
  
  const [currentStep, setCurrentStep] = useState(mode === 'signup' ? 'signup' : 'login')

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold gradient-text">
            {currentStep === 'login' ? 'Sign in to AlumniVerse' : 'Join AlumniVerse'}
          </h2>
          <p className="mt-2 text-sm text-foreground-muted">
            {currentStep === 'login' 
              ? "Don't have an account?" 
              : "Already have an account?"
            }
            <button
              onClick={() => setCurrentStep(currentStep === 'login' ? 'signup' : 'login')}
              className="ml-1 font-medium text-primary hover:text-primary-hover"
            >
              {currentStep === 'login' ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>

        {currentStep === 'login' ? (
          <LoginForm />
        ) : (
          <SignUpForm />
        )}
      </div>
    </div>
  )
}