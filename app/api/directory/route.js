import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

// Create Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    
    const branch = searchParams.get('branch')
    const year = searchParams.get('year')
    const skills = searchParams.get('skills')
    const location = searchParams.get('location')
    const company = searchParams.get('company')
    const search = searchParams.get('search')
    const page = parseInt(searchParams.get('page')) || 1
    const limit = parseInt(searchParams.get('limit')) || 20
    const sortBy = searchParams.get('sortBy') || 'first_name'
    const sortOrder = searchParams.get('sortOrder') || 'asc'

    // Build Supabase query with filters
    let dbQuery = supabase
      .from('users')
      .select('*', { count: 'exact' })
      .eq('is_deleted', false)
      .eq('is_email_verified', true)

    // Apply filters
    if (branch) {
      dbQuery = dbQuery.eq('branch', branch)
    }

    if (year) {
      dbQuery = dbQuery.eq('passing_year', parseInt(year))
    }

    if (location) {
      dbQuery = dbQuery.ilike('location', `%${location}%`)
    }

    if (company) {
      dbQuery = dbQuery.ilike('company', `%${company}%`)
    }

    if (skills) {
      // Search in skills JSONB array
      const skillsArray = skills.split(',').map(skill => skill.trim())
      dbQuery = dbQuery.overlaps('skills', skillsArray)
    }

    if (search) {
      dbQuery = dbQuery.or(`
        first_name.ilike.%${search}%,
        last_name.ilike.%${search}%,
        company.ilike.%${search}%,
        current_position.ilike.%${search}%,
        bio.ilike.%${search}%
      `)
    }

    // Apply sorting
    const validSortFields = ['first_name', 'last_name', 'company', 'passing_year', 'created_at']
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'first_name'
    const sortDirection = sortOrder.toLowerCase() === 'asc'

    dbQuery = dbQuery.order(sortField, { ascending: sortDirection })

    // Apply pagination
    const pageNum = Math.max(1, parseInt(page))
    const limitNum = Math.min(Math.max(1, parseInt(limit)), 100)
    const offset = (pageNum - 1) * limitNum

    dbQuery = dbQuery.range(offset, offset + limitNum - 1)

    // Execute query
    const { data: alumni, error, count: totalCount } = await dbQuery

    if (error) {
      console.error('Supabase alumni query error:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch alumni directory' },
        { status: 500 }
      )
    }

    // Remove sensitive information and format response
    const sanitizedAlumni = alumni.map(user => {
      const { password_hash, auth_id, ...alumniData } = user

      // Format additional fields
      return {
        ...alumniData,
        fullName: `${alumniData.first_name || ''} ${alumniData.last_name || ''}`.trim(),
        graduationYear: alumniData.passing_year,
        profileComplete: !!(alumniData.bio && alumniData.current_position && alumniData.company)
      }
    })

    // Calculate pagination metadata
    const totalPages = Math.ceil((totalCount || 0) / limitNum)
    const hasNextPage = pageNum < totalPages
    const hasPrevPage = pageNum > 1

    return NextResponse.json({
      success: true,
      data: {
        alumni: sanitizedAlumni,
        pagination: {
          currentPage: pageNum,
          totalPages,
          totalCount: totalCount || 0,
          hasNextPage,
          hasPrevPage,
          limit: limitNum
        },
        filters: {
          branch,
          year,
          skills,
          location,
          company,
          search
        }
      }
    })

  } catch (error) {
    console.error('Alumni directory fetch error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch alumni directory' },
      { status: 500 }
    )
  }
}