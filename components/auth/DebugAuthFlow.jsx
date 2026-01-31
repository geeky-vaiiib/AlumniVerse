"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "../providers/AuthProvider"
import { useUser } from "../../contexts/UserContext"
import { db } from "../../lib/firebase"
import { collection, query, limit, getDocs } from "firebase/firestore"

export default function DebugAuthFlow() {
  const router = useRouter()
  const { user, userProfile: authProfile, loading } = useAuth()
  const { userProfile, loading: profileLoading, error: profileError } = useUser()
  const [debugInfo, setDebugInfo] = useState({})
  const [testResults, setTestResults] = useState({})

  // Get redirect URL from search params
  const urlParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null
  const redirectTo = urlParams?.get('redirectTo') || '/dashboard'

  useEffect(() => {
    async function runDiagnostics() {
      if (!user?.uid) return

      const info = {
        authState: {
          user: !!user,
          userId: user?.uid,
          userEmail: user?.email,
          isEmailVerified: user?.emailVerified,
          loading,
        },
        profileState: {
          userProfile: !!userProfile,
          profileLoading,
          profileError: profileError?.message,
          profileId: userProfile?.id,
          profileCompleted: userProfile?.isProfileComplete,
        },
        urlInfo: {
          currentUrl: typeof window !== 'undefined' ? window.location.href : '',
          redirectTo,
        }
      }

      // Test Firebase connection
      const tests = {}

      try {
        // Test 1: Can we connect to Firestore?
        const usersRef = collection(db, 'users')
        const q = query(usersRef, limit(1))
        await getDocs(q)
        tests.firestoreConnection = '✅ Connected'
      } catch (e) {
        tests.firestoreConnection = `⚠️ ${e.message}`
      }

      tests.authActive = user ? '✅ Authenticated' : '❌ Not authenticated'
      tests.profileExists = userProfile ? '✅ Profile found' : '⚠️ No profile found'

      setDebugInfo(info)
      setTestResults(tests)

      // Auto-redirect if everything is working
      if (user?.uid && userProfile && tests.firestoreConnection?.startsWith('✅')) {
        console.log('DebugAuthFlow: All systems working, auto-redirecting in 3 seconds...')
        setTimeout(() => {
          handleForceRedirect()
        }, 3000)
      }
    }

    runDiagnostics()
  }, [user, userProfile, profileLoading, profileError])

  const handleForceRedirect = () => {
    console.log('Force redirecting to:', redirectTo)
    router.push(redirectTo)
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-card border border-border rounded-lg p-6 space-y-6">
          <h1 className="text-2xl font-bold text-foreground mb-4">
            🔍 Authentication Debug Dashboard (Firebase)
          </h1>

          {/* Auth State */}
          <div className="space-y-2">
            <h2 className="text-lg font-semibold text-foreground">Authentication State</h2>
            <div className="bg-muted p-4 rounded text-sm font-mono">
              <pre>{JSON.stringify(debugInfo.authState, null, 2)}</pre>
            </div>
          </div>

          {/* Profile State */}
          <div className="space-y-2">
            <h2 className="text-lg font-semibold text-foreground">Profile State</h2>
            <div className="bg-muted p-4 rounded text-sm font-mono">
              <pre>{JSON.stringify(debugInfo.profileState, null, 2)}</pre>
            </div>
          </div>

          {/* Test Results */}
          <div className="space-y-2">
            <h2 className="text-lg font-semibold text-foreground">System Tests</h2>
            <div className="bg-muted p-4 rounded space-y-2">
              {Object.entries(testResults).map(([test, result]) => (
                <div key={test} className="flex justify-between">
                  <span className="font-medium">{test}:</span>
                  <span className={result.startsWith('✅') ? 'text-green-600' : result.startsWith('⚠️') ? 'text-yellow-600' : 'text-red-600'}>
                    {result}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <button
              onClick={handleForceRedirect}
              className="bg-primary text-primary-foreground px-4 py-2 rounded hover:bg-primary/90"
            >
              Force Redirect to Dashboard
            </button>
          </div>

          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded p-4">
            <h3 className="font-semibold text-blue-800 mb-2">💡 Firebase Information:</h3>
            <ul className="text-blue-700 space-y-1 text-sm">
              <li>• <strong>Using Firebase Auth</strong> for authentication</li>
              <li>• <strong>Firestore</strong> for user profiles</li>
              <li>• If offline warnings appear, check Firebase Console rules</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
