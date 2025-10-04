import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

// Create Supabase admin client with service role key
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export async function POST(request) {
  try {
    const body = await request.json()
    const { auth_id, email, first_name, last_name, usn, branch, branch_code, admission_year, passing_year } = body

    // Validate required fields
    if (!auth_id || !email) {
      return NextResponse.json(
        { error: 'auth_id and email are required' },
        { status: 400 }
      )
    }

    console.log('Creating profile for user:', { auth_id, email })

    // Insert profile using service role (bypasses RLS)
    const { data, error } = await supabaseAdmin
      .from('users')
      .insert({
        auth_id,
        email,
        first_name: first_name || null,
        last_name: last_name || null,
        usn: usn || null,
        branch: branch || null,
        branch_code: branch_code || null,
        admission_year: admission_year || null,
        passing_year: passing_year || null,
        is_email_verified: true,
        profile_completed: false,
        password_hash: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      console.error('Supabase insert error:', error)
      
      // Handle duplicate key error
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'Profile already exists for this user' },
          { status: 409 }
        )
      }
      
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    console.log('Profile created successfully:', data.id)

    // Remove sensitive data from response
    const { password_hash, ...profileData } = data

    return NextResponse.json({
      success: true,
      message: 'Profile created successfully',
      data: profileData
    })

  } catch (err) {
    console.error('API Error:', err)
    return NextResponse.json(
      { error: 'Internal Server Error' },
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
