import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

// Create Supabase admin client with service role key
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

// Validate environment variables
if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing required environment variables:', {
    SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY
  })
}

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
      profile_completed  // 🔧 FIX: Accept profile_completed from request
    } = body

    // Validate required fields
    if (!auth_id || !email) {
      return NextResponse.json(
        { error: 'auth_id and email are required' },
        { status: 400 }
      )
    }

    console.log('Creating profile for user:', { auth_id, email, profile_completed })

    // FIXED: First check if profile already exists
    const { data: existingRows, error: checkError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('auth_id', auth_id)
      .order('updated_at', { ascending: false })
      .limit(1)
    
    const existingProfile = existingRows && existingRows.length > 0 ? existingRows[0] : null
    
    console.log('[PROFILE_CREATE] Existing profile check:', { 
      found: !!existingProfile, 
      count: existingRows?.length,
      profileId: existingProfile?.id,
      checkError: checkError?.message 
    })

    if (existingProfile && !checkError) {
      console.log('Profile already exists, checking if update needed:', existingProfile.id)
      
      // 🔧 FIX: If profile exists but needs to be marked complete, update it
      if (profile_completed && !existingProfile.profile_completed) {
        console.log('Updating existing profile to mark as complete')
        
        const updateData = {
          profile_completed: true,
          updated_at: new Date().toISOString()
        }
        
        // Update optional fields if provided
        if (first_name) updateData.first_name = first_name
        if (last_name) updateData.last_name = last_name
        if (company) updateData.company = company
        if (current_position) updateData.current_position = current_position
        if (location) updateData.location = location
        if (linkedin_url) updateData.linkedin_url = linkedin_url
        if (github_url) updateData.github_url = github_url
        if (bio) updateData.bio = bio
        if (skills) updateData.skills = skills
        if (branch) updateData.branch = branch
        if (passing_year) updateData.passing_year = passing_year
        
        const { data: updated, error: updateError } = await supabaseAdmin
          .from('users')
          .update(updateData)
          .eq('auth_id', auth_id)
          .select()
          .single()
        
        if (updateError) {
          console.error('Error updating existing profile:', updateError)
        } else if (updated) {
          const { password_hash, ...profileData } = updated
          return NextResponse.json({
            success: true,
            message: 'Profile updated successfully',
            data: profileData
          })
        }
      }
      
      // Remove sensitive data from response
      const { password_hash, ...profileData } = existingProfile
      
      return NextResponse.json({
        success: true,
        message: 'Profile already exists',
        data: profileData
      })
    }

    // 🔧 FIX: Check if this is a profile completion (has enough data)
    const isProfileComplete = profile_completed && first_name && last_name && branch && passing_year
    
    // Insert profile using service role (bypasses RLS) - only if doesn't exist
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
        company: company || null,
        current_position: current_position || null,
        location: location || null,
        linkedin_url: linkedin_url || null,
        github_url: github_url || null,
        bio: bio || null,
        skills: skills || null,
        is_email_verified: true,
        profile_completed: isProfileComplete,  // 🔧 FIX: Use computed value based on data completeness
        password_hash: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      console.error('Supabase insert error:', error)
      console.error('[PROFILE_CREATE] Insert failed:', { 
        code: error.code, 
        message: error.message,
        details: error.details,
        hint: error.hint 
      })
      
      // Handle duplicate key error with idempotent response
      if (error.code === '23505') {
        console.log('Duplicate key detected, analyzing conflict...')
        
        // Check if it's the same user (auth_id conflict)
        if (error.message.includes('auth_id')) {
          const { data: raceProfile, error: raceError } = await supabaseAdmin
            .from('users')
            .select('*')
            .eq('auth_id', auth_id)
            .single()
          
          if (raceProfile && !raceError) {
            const { password_hash, ...profileData } = raceProfile
            // 🔧 FIX: Return 200 instead of 409 for existing profiles to avoid conflicts in client
            return NextResponse.json({
              success: true,
              message: 'Profile already exists',
              data: profileData
            })
          }
        }
        
        // If it's a USN conflict (different user), return appropriate error
        if (error.message.includes('usn')) {
          return NextResponse.json(
            { 
              success: false,
              error: 'USN already exists for another user',
              message: 'This University Seat Number is already registered by another user'
            },
            { status: 409 }
          )
        }
        
        // Other conflicts - return 200 with existing profile if possible
        const { data: existingRows } = await supabaseAdmin
          .from('users')
          .select('*')
          .eq('auth_id', auth_id)
          .order('updated_at', { ascending: false })
          .limit(1)
        
        const existingProfile = existingRows && existingRows.length > 0 ? existingRows[0] : null
        
        if (existingProfile) {
          const { password_hash, ...profileData } = existingProfile
          return NextResponse.json({
            success: true,
            message: 'Profile already exists',
            data: profileData
          })
        }
        
        return NextResponse.json(
          { error: 'Profile conflict could not be resolved' },
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
