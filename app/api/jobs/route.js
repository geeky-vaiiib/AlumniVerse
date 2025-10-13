import { getSupabaseClient } from '@/lib/supabase-singleton'
import { NextResponse } from 'next/server'

const supabase = getSupabaseClient()

export async function GET() {
  try {
    const { data: jobs, error } = await supabase
      .from('jobs')
      .select(`
        *,
        posted_by_user:users!posted_by (
          id,
          first_name,
          last_name,
          avatar_path,
          current_position,
          company
        )
      `)
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('❌ [API] Error fetching jobs:', error)
      return NextResponse.json({ success: false, error: error.message }, { status: 400 })
    }

    // Transform to expected format
    const transformedJobs = (jobs || []).map(job => ({
      id: job.id,
      title: job.title,
      company: job.company,
      location: job.location,
      type: job.type,
      experience: job.experience_level || 'Entry Level',
      description: job.description,
      salary: job.salary_range || 'Not specified',
      skills: job.required_skills || [],
      postedBy: {
        id: job.posted_by_user?.id,
        name: `${job.posted_by_user?.first_name || ''} ${job.posted_by_user?.last_name || ''}`.trim() || 'Anonymous',
        avatar: job.posted_by_user?.avatar_path,
        batch: job.posted_by_user?.passing_year || 'Unknown',
        position: job.posted_by_user?.current_position,
        company: job.posted_by_user?.company
      },
      postedDate: job.created_at,
      applicants: 0 // TODO: Add applicant count if needed
    }))

    return NextResponse.json({ 
      success: true, 
      data: { jobs: transformedJobs },
      count: transformedJobs.length 
    })
  } catch (error) {
    console.error('❌ [API] Jobs fetch error:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    // Get the session from the request
    const { session } = await supabase.auth.getSession()
    
    if (!session?.user) {
      return NextResponse.json({ 
        success: false, 
        error: 'Authentication required' 
      }, { status: 401 })
    }

    const jobData = await request.json()

    // Get user's internal ID
    const { data: userProfile, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('auth_id', session.user.id)
      .single()

    if (userError || !userProfile) {
      console.error('❌ [API] User profile not found:', userError)
      return NextResponse.json({ 
        success: false, 
        error: 'User profile not found' 
      }, { status: 400 })
    }

    // Create job posting
    const { data: job, error } = await supabase
      .from('jobs')
      .insert([{
        title: jobData.title,
        description: jobData.description,
        company: jobData.company,
        location: jobData.location,
        type: jobData.type || 'job',
        experience_level: jobData.experienceLevel || jobData.experience,
        salary_range: jobData.salaryRange || jobData.salary,
        required_skills: jobData.requiredSkills || jobData.skills || [],
        application_url: jobData.applicationUrl,
        contact_email: jobData.contactEmail,
        deadline: jobData.deadline,
        posted_by: userProfile.id
      }])
      .select(`
        *,
        posted_by_user:users!posted_by (
          id,
          first_name,
          last_name,
          avatar_path,
          current_position,
          company
        )
      `)
      .single()

    if (error) {
      console.error('❌ [API] Error creating job:', error)
      return NextResponse.json({ 
        success: false, 
        error: error.message 
      }, { status: 400 })
    }

    console.log('✅ [API] Job created successfully:', job.id)

    // Transform to expected format
    const transformedJob = {
      id: job.id,
      title: job.title,
      company: job.company,
      location: job.location,
      type: job.type,
      experience: job.experience_level || 'Entry Level',
      description: job.description,
      salary: job.salary_range || 'Not specified',
      skills: job.required_skills || [],
      postedBy: {
        id: job.posted_by_user?.id,
        name: `${job.posted_by_user?.first_name || ''} ${job.posted_by_user?.last_name || ''}`.trim() || 'Anonymous',
        avatar: job.posted_by_user?.avatar_path,
        batch: job.posted_by_user?.passing_year || 'Unknown'
      },
      postedDate: job.created_at,
      applicants: 0
    }

    return NextResponse.json({ 
      success: true, 
      data: transformedJob 
    })
  } catch (error) {
    console.error('❌ [API] Job creation error:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}