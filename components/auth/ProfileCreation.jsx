"use client"

import { useState } from "react"
import ProfileCreationFlow from "../profile/ProfileCreationFlow"
import ProfileSuccessToast from "../profile/ProfileSuccessToast"
import { useUser } from "../../contexts/UserContext"

export default function ProfileCreation({ userData, onStepChange }) {
  const [showSuccessToast, setShowSuccessToast] = useState(false)
  const { refreshProfile } = useUser()

  const handleProfileComplete = async (userProfile) => {
    setShowSuccessToast(true)

    // Refresh the user profile context with the new data
    try {
      await refreshProfile()
    } catch (error) {
      console.error('Failed to refresh profile:', error)
    }

    // Redirect after showing success message
    setTimeout(() => {
      window.location.href = "/dashboard"
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
