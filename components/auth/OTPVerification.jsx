"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { Button } from "../ui/button"

export default function OTPVerification({ email, onStepChange }) {
  const [otp, setOtp] = useState(["", "", "", "", "", ""])
  const [isLoading, setIsLoading] = useState(false)
  const [timer, setTimer] = useState(60)
  const [canResend, setCanResend] = useState(false)

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1)
      }, 1000)
      return () => clearInterval(interval)
    } else {
      setCanResend(true)
    }
  }, [timer])

  const handleOtpChange = (index, value) => {
    if (value.length > 1) return

    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`)
      if (nextInput) nextInput.focus()
    }
  }

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`)
      if (prevInput) prevInput.focus()
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const otpValue = otp.join("")

    // BYPASS: Accept any 6-digit code for demo
    if (otpValue.length !== 6) {
      alert("Please enter all 6 digits (any 6 digits will work)")
      return
    }

    setIsLoading(true)

    // Simulate API call - accept any OTP
    setTimeout(() => {
      setIsLoading(false)
      onStepChange("profile")
    }, 1000)
  }

  const handleResend = () => {
    setTimer(60)
    setCanResend(false)
    // Simulate resend API call
    console.log("Resending OTP...")
  }

  return (
    <Card className="w-full">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold">Verify Your Email</CardTitle>
        <CardDescription>
          We've sent a 6-digit code to <strong>{email}</strong>
        </CardDescription>
        <div className="mt-2 text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded">
          Demo Mode: Enter any 6 digits (e.g., 123456)
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex justify-center space-x-2">
            {otp.map((digit, index) => (
              <input
                key={index}
                id={`otp-${index}`}
                type="text"
                inputMode="numeric"
                maxLength="1"
                value={digit}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="w-12 h-12 text-center text-lg font-semibold border border-input rounded-md bg-input focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            ))}
          </div>

          <Button type="submit" className="w-full hover-glow" disabled={isLoading}>
            {isLoading ? "Verifying..." : "Verify Email"}
          </Button>
        </form>

        <div className="mt-6 text-center">
          {!canResend ? (
            <p className="text-foreground-muted text-sm">Resend code in {timer} seconds</p>
          ) : (
            <button onClick={handleResend} className="text-primary hover:text-primary-hover text-sm font-medium">
              Resend verification code
            </button>
          )}
        </div>

        <div className="mt-4 text-center">
          <button
            onClick={() => onStepChange("signup")}
            className="text-foreground-muted hover:text-foreground text-sm"
          >
            ← Back to sign up
          </button>
        </div>
      </CardContent>
    </Card>
  )
}
