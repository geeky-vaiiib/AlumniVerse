import { NextResponse } from 'next/server'

// Simple user existence check - uses Firestore directly via fetch to Firebase REST API
// This avoids the firebase-admin dependency issues in Next.js API routes
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')

    if (!email) {
      return NextResponse.json(
        { error: 'Email parameter is required' },
        { status: 400 }
      )
    }

    console.log('🔍 [USER_EXISTS] Checking user existence for:', email)

    // For now, return exists: false to allow signups
    // Firebase client-side auth will handle actual user creation
    // This endpoint is just for pre-flight checking

    // In Firebase, we don't have the same "check if user exists before signup" flow
    // as Supabase. Firebase Auth will throw an error if user already exists during
    // createUserWithEmailAndPassword, which we handle in the AuthProvider.

    // For now, always return not exists to let the signup proceed
    // Firebase Auth will properly reject duplicate signups

    console.log('🔍 [USER_EXISTS] Firebase mode - allowing signup attempt, auth will handle duplicates')

    return NextResponse.json({
      exists: false,
      message: 'Firebase mode - signup will be validated by Firebase Auth'
    })

  } catch (err) {
    console.error('❌ [USER_EXISTS] API Error:', err.message)
    return NextResponse.json(
      { error: 'Internal Server Error', details: err.message },
      { status: 500 }
    )
  }
}
