/**
 * Server-side Session Sync Endpoint (Firebase version)
 * 
 * This endpoint is called by the client after OTP verification to ensure
 * the session is properly synchronized to the server.
 */

import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    console.log('🔐 [SESSION_API] POST /api/auth/session - Firebase session sync')

    const body = await request.json()
    const { access_token } = body

    if (!access_token) {
      console.error('🔐 [SESSION_API] ❌ No access_token provided')
      return NextResponse.json(
        { error: 'access_token is required' },
        { status: 400 }
      )
    }

    console.log('🔐 [SESSION_API] Received Firebase ID token:', {
      hasAccessToken: !!access_token,
      tokenPrefix: access_token.substring(0, 20) + '...'
    })

    // For Firebase, the ID token is verified on each API call
    // We don't need to store it in cookies like Supabase
    // Just acknowledge the sync was successful

    const response = NextResponse.json({
      success: true,
      message: 'Firebase session acknowledged',
      note: 'Firebase uses ID tokens verified per-request'
    })

    console.log('🔐 [SESSION_API] ✅ Session sync acknowledged')

    return response

  } catch (error) {
    console.error('🔐 [SESSION_API] ❌ Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    console.log('🔐 [SESSION_API] GET /api/auth/session - Checking session status')

    // For Firebase, session is managed client-side
    // This endpoint just returns acknowledgment
    return NextResponse.json({
      hasSession: false,
      message: 'Firebase manages sessions client-side. Use Firebase Auth state.'
    })

  } catch (error) {
    console.error('🔐 [SESSION_API] ❌ Unexpected error:', error)
    return NextResponse.json({ hasSession: false, error: error.message })
  }
}
