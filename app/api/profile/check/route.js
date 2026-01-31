import { NextResponse } from 'next/server'

// Simplified profile check endpoint
// With Firebase, profile management is handled through the client-side Firestore SDK
// This endpoint provides basic compatibility for existing code
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const authId = searchParams.get('auth_id')

    if (!authId) {
      return NextResponse.json(
        { error: 'auth_id parameter is required' },
        { status: 400 }
      )
    }

    console.log('Profile check: Looking for profile with auth_id:', authId)

    // In Firebase architecture, profile data is managed client-side via Firestore
    // This API is kept for backward compatibility but returns a "check-client" response
    // The actual profile lookup should be done via the UserContext/AuthProvider

    return NextResponse.json({
      exists: false,
      message: 'Profile check delegated to client-side Firestore',
      auth_id: authId
    }, { status: 200 })

  } catch (err) {
    console.error('Profile check API error:', err)
    return NextResponse.json(
      { error: 'Internal Server Error', details: err.message },
      { status: 500 }
    )
  }
}

// Handle other HTTP methods
export async function POST() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  )
}
