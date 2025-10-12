import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

// Create Supabase admin client with service role key
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export async function POST(request) {
  try {
    // Check if environment variables are available
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error('Missing Supabase environment variables')
      return NextResponse.json(
        { error: 'Server configuration error - missing Supabase credentials' },
        { status: 500 }
      )
    }

    // Get authorization header
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Missing or invalid authorization header' },
        { status: 401 }
      )
    }

    const token = authHeader.replace('Bearer ', '')
    
    // Verify the user's token
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)
    
    if (authError || !user) {
      console.error('Authentication error:', authError)
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const {
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
      leetcode_url,
      bio,
      skills,
      resume_url
    } = body

    console.log('[PROFILE_COMPLETE] Completing profile for user:', user.id)

    // Check if profile exists
    const { data: existingProfile, error: checkError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('auth_id', user.id)
      .maybeSingle()

    if (checkError) {
      console.error('[PROFILE_COMPLETE] Error checking profile:', checkError)
      return NextResponse.json(
        { error: 'Database error while checking profile' },
        { status: 500 }
      )
    }

    if (!existingProfile) {
      console.error('[PROFILE_COMPLETE] No profile found for user:', user.id)
      return NextResponse.json(
        { error: 'Profile not found. Please create a profile first.' },
        { status: 404 }
      )
    }

    // Validate required fields for profile completion
    if (!first_name || !last_name || !branch || !passing_year) {
      return NextResponse.json(
        { 
          error: 'Missing required fields',
          message: 'first_name, last_name, branch, and passing_year are required to complete profile'
        },
        { status: 400 }
      )
    }

    console.log('[PROFILE_COMPLETE] Updating profile with complete data...')

    // Update profile with all provided data and mark as complete
    const updateData = {
      first_name,
      last_name,
      branch,
      passing_year: parseInt(passing_year),
      profile_completed: true,  // ✅ Mark as complete
      updated_at: new Date().toISOString()
    }

    // Add optional fields if provided
    if (usn) updateData.usn = usn
    if (branch_code) updateData.branch_code = branch_code
    if (admission_year) updateData.admission_year = admission_year
    if (company) updateData.company = company
    if (current_position) updateData.current_position = current_position
    if (location) updateData.location = location
    if (linkedin_url) updateData.linkedin_url = linkedin_url
    if (github_url) updateData.github_url = github_url
    if (leetcode_url) updateData.leetcode_url = leetcode_url
    if (bio) updateData.bio = bio
    if (skills) updateData.skills = skills
    if (resume_url) updateData.resume_url = resume_url

    const { data: updatedProfile, error: updateError } = await supabaseAdmin
      .from('users')
      .update(updateData)
      .eq('auth_id', user.id)
      .select()
      .single()

    if (updateError) {
      console.error('[PROFILE_COMPLETE] Error updating profile:', updateError)
      return NextResponse.json(
        { error: 'Failed to update profile', details: updateError.message },
        { status: 500 }
      )
    }

    console.log('[PROFILE_COMPLETE] ✅ Profile marked as complete:', updatedProfile.id)

    // Remove sensitive data from response
    const { password_hash, ...profileData } = updatedProfile

    // Also update the user's metadata in auth
    try {
      await supabaseAdmin.auth.admin.updateUserById(user.id, {
        user_metadata: {
          ...user.user_metadata,
          profile_completed: true,
          first_name,
          last_name
        }
      })
      console.log('[PROFILE_COMPLETE] ✅ Updated auth metadata')
    } catch (metaError) {
      console.warn('[PROFILE_COMPLETE] Could not update auth metadata:', metaError)
      // Don't fail the request if metadata update fails
    }

    return NextResponse.json({
      success: true,
      message: 'Profile completed successfully',
      data: {
        user: profileData,
        isProfileComplete: true
      }
    })

  } catch (err) {
    console.error('[PROFILE_COMPLETE] API Error:', err)
    return NextResponse.json(
      { error: 'Internal Server Error', details: err.message },
      { status: 500 }
    )
  }
}

// Handle other HTTP methods
export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed. Use POST to complete profile.' },
    { status: 405 }
  )
}
