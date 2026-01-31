import { NextResponse } from 'next/server'

// Simplified profile creation endpoint
// In Firebase architecture, profile creation is handled client-side via UserContext/AuthProvider
// This API is kept for backward compatibility
export async function POST(request) {
  try {
    const body = await request.json()
    const {
      auth_id,
      email,
      first_name,
      last_name,
      usn,
      branch,
      branch_code,
      admission_year,
      passing_year,
      company,
      current_position,
      location,
      linkedin_url,
      github_url,
      bio,
      skills,
      profile_completed
    } = body

    // Validate required fields
    if (!auth_id || !email) {
      return NextResponse.json(
        { error: 'auth_id and email are required' },
        { status: 400 }
      )
    }

    console.log('Profile creation request for user:', { auth_id, email, profile_completed })

    // In the new Firebase architecture, profile creation is handled client-side
    // The UserContext writes directly to Firestore from the client
    // This endpoint returns success to maintain backward compatibility

    const profileData = {
      id: auth_id,
      authId: auth_id,
      email,
      firstName: first_name || null,
      lastName: last_name || null,
      usn: usn || null,
      branch: branch || null,
      branchCode: branch_code || null,
      admissionYear: admission_year || null,
      passingYear: passing_year || null,
      company: company || null,
      currentPosition: current_position || null,
      location: location || null,
      linkedinUrl: linkedin_url || null,
      githubUrl: github_url || null,
      bio: bio || null,
      skills: skills || [],
      isEmailVerified: true,
      profileCompleted: profile_completed || false,
      isProfileComplete: profile_completed || false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    console.log('Profile creation delegated to client-side Firestore')

    return NextResponse.json({
      success: true,
      message: 'Profile created via client-side Firestore',
      data: profileData
    })

  } catch (err) {
    console.error('Profile create API error:', err)
    return NextResponse.json(
      { error: 'Internal Server Error', details: err.message },
      { status: 500 }
    )
  }
}

// Handle other HTTP methods
export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  )
}
