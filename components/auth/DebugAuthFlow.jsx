"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "../providers/AuthProvider"
import { useUser } from "../../contexts/UserContext"
import { supabase } from "../../lib/supabaseClient"

export default function DebugAuthFlow() {
  const router = useRouter()
  const { session, loading, isLoggedIn, isReady, user } = useAuth()
  const { userProfile, loading: profileLoading, error: profileError } = useUser()
  const [debugInfo, setDebugInfo] = useState({})
  const [testResults, setTestResults] = useState({})

  // Get redirect URL from search params
  const urlParams = new URLSearchParams(window.location.search)
  const redirectTo = urlParams.get('redirectTo') || '/dashboard'

  useEffect(() => {
    async function runDiagnostics() {
      if (!user?.id) return

      const info = {
        authState: {
          user: !!user,
          userId: user?.id,
          userEmail: user?.email,
          session: !!session,
          isLoggedIn,
          isReady,
          loading,
        },
        profileState: {
          userProfile: !!userProfile,
          profileLoading,
          profileError: profileError?.message,
          profileId: userProfile?.id,
          profileCompleted: userProfile?.profileCompleted,
        },
        urlInfo: {
          currentUrl: window.location.href,
          redirectTo,
        }
      }

      // Test database connection
      const tests = {}
      
      try {
        // Test 1: Can we connect to Supabase?
        const { error: connectionError } = await supabase.from('users').select('*').limit(1)
        tests.supabaseConnection = connectionError ? `❌ ${connectionError.message}` : '✅ Connected'
      } catch (e) {
        tests.supabaseConnection = `❌ ${e.message}`
      }

      try {
        // Test 2: Does auth_id column exist?
        const { data, error } = await supabase
          .from('users')
          .select('auth_id')
          .eq('auth_id', user.id)
          .maybeSingle()
        
        if (error) {
          if (error.code === '42703') {
            tests.authIdColumn = '❌ auth_id column does not exist'
          } else {
            tests.authIdColumn = `❌ ${error.message}`
          }
        } else {
          tests.authIdColumn = '✅ auth_id column exists'
          tests.profileExists = data ? '✅ Profile found' : '⚠️ No profile found'
        }
      } catch (e) {
        tests.authIdColumn = `❌ ${e.message}`
      }

      try {
        // Test 3: Can we create a profile via API?
        const response = await fetch('/api/profile/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            auth_id: user.id,
            email: user.email,
            first_name: 'Test',
            last_name: 'User'
          })
        })
        
        if (response.ok) {
          tests.apiEndpoint = '✅ /api/profile/create works'
        } else {
          const errorText = await response.text()
          tests.apiEndpoint = `❌ API Error: ${response.status} ${errorText.slice(0, 100)}`
        }
      } catch (e) {
        tests.apiEndpoint = `❌ ${e.message}`
      }

      setDebugInfo(info)
      setTestResults(tests)
      
      // Auto-redirect if everything is working
      if (user?.id && userProfile && tests.supabaseConnection?.startsWith('✅') && tests.authIdColumn?.startsWith('✅') && tests.profileExists?.startsWith('✅')) {
        console.log('DebugAuthFlow: All systems working, auto-redirecting in 3 seconds...')
        setTimeout(() => {
          handleForceRedirect()
        }, 3000)
      }
    }

    runDiagnostics()
  }, [user, session, isLoggedIn, isReady, userProfile, profileLoading, profileError])

  const handleForceRedirect = () => {
    console.log('Force redirecting to:', redirectTo)
    
    // Clear any auth-related URL parameters
    const cleanUrl = new URL(window.location)
    cleanUrl.searchParams.delete('redirectTo')
    
    // Update URL without redirectTo parameter first
    window.history.replaceState({}, '', cleanUrl.pathname)
    
    // Then redirect to dashboard
    router.push(redirectTo)
  }

  const handleRunMigration = () => {
    alert(`⚠️ REQUIRED: Run database migration

1. Open Supabase Dashboard → SQL Editor
2. Copy & paste: backend/database/FINAL_COMPREHENSIVE_FIX.sql
3. Click "Run"
4. Refresh this page

This will add the missing auth_id column and fix RLS policies.`)
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-card border border-border rounded-lg p-6 space-y-6">
          <h1 className="text-2xl font-bold text-foreground mb-4">
            🔍 Authentication Debug Dashboard
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

          {/* URL Info */}
          <div className="space-y-2">
            <h2 className="text-lg font-semibold text-foreground">URL Information</h2>
            <div className="bg-muted p-4 rounded text-sm font-mono">
              <pre>{JSON.stringify(debugInfo.urlInfo, null, 2)}</pre>
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
            <button
              onClick={handleRunMigration}
              className="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700"
            >
              🔧 Fix Database Schema
            </button>
          </div>

          {/* Instructions */}
          <div className="bg-yellow-50 border border-yellow-200 rounded p-4">
            <h3 className="font-semibold text-yellow-800 mb-2">💡 Common Issues & Solutions:</h3>
            <ul className="text-yellow-700 space-y-1 text-sm">
              <li>• <strong>auth_id column missing</strong> → Run database migration</li>
              <li>• <strong>406 errors</strong> → auth_id column doesn't exist</li>
              <li>• <strong>API Error 500</strong> → Add SUPABASE_SERVICE_ROLE_KEY to .env.local</li>
              <li>• <strong>Profile not loading</strong> → Check UserContext for infinite loops</li>
            </ul>
          </div>

          {testResults.apiEndpoint?.includes('500') && (
            <div className="bg-red-50 border border-red-200 rounded p-4">
              <h3 className="font-semibold text-red-800 mb-2">🚨 CRITICAL: Missing Service Role Key</h3>
              <p className="text-red-700 text-sm mb-3">
                The API endpoint is failing because SUPABASE_SERVICE_ROLE_KEY is not configured.
              </p>
              <div className="bg-red-100 p-3 rounded text-sm font-mono text-red-800">
                <p>Add to your .env.local file:</p>
                <p className="mt-1">SUPABASE_SERVICE_ROLE_KEY=your-service-role-key</p>
              </div>
              <p className="text-red-700 text-sm mt-2">
                Get this key from: Supabase Dashboard → Settings → API → service_role key
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
