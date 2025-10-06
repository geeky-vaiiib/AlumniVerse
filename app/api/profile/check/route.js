import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

// Create Supabase admin client with service role key
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

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

    // Check if profile exists in users table
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('id, auth_id, email, first_name, last_name, profile_completed, created_at, updated_at')
      .eq('auth_id', authId)
      .maybeSingle()

    if (error) {
      console.error('Profile check error:', error)
      return NextResponse.json(
        { error: 'Database error', details: error.message },
        { status: 500 }
      )
    }

    if (!data) {
      console.log('Profile check: No profile found for auth_id:', authId)
      return NextResponse.json(
        { 
          exists: false, 
          message: 'Profile not found',
          auth_id: authId 
        },
        { status: 404 }
      )
    }

    console.log('Profile check: Profile found:', {
      id: data.id,
      auth_id: data.auth_id,
      email: data.email,
      profile_completed: data.profile_completed
    })

    return NextResponse.json({
      exists: true,
      profile: data,
      message: 'Profile found successfully'
    })

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



