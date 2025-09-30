"use client"

import { useState } from "react"
import ProfileCreationFlow from "../profile/ProfileCreationFlow"
import ProfileSuccessToast from "../profile/ProfileSuccessToast"

export default function ProfileCreation({ userData, onStepChange }) {
  const [showSuccessToast, setShowSuccessToast] = useState(false)

  const handleProfileComplete = (userProfile) => {
    setShowSuccessToast(true)

    // Redirect after showing success message
    setTimeout(() => {
      if (onStepChange) {
        onStepChange("dashboard", userProfile)
      } else {
        window.location.href = "/dashboard"
      }
    }, 2000)
  }

  return (
    <>
      <ProfileCreationFlow
        userData={userData}
        onComplete={handleProfileComplete}
      />

      <ProfileSuccessToast
        isVisible={showSuccessToast}
        onClose={() => setShowSuccessToast(false)}
        message="Profile created successfully! Welcome to AlumniVerse!"
      />
    </>
  )
}
