import { NextResponse } from 'next/server'

// Simplified directory endpoint
// In Firebase architecture, directory queries are handled client-side via Firestore
// This provides a fallback response for any server-side requests
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

    console.log('Directory request received - delegating to client-side Firestore')

    // Return empty response - client should use Firestore directly
    return NextResponse.json({
      success: true,
      data: {
        alumni: [],
        pagination: {
          currentPage: page,
          totalPages: 0,
          totalCount: 0,
          hasNextPage: false,
          hasPrevPage: false,
          limit
        },
        filters: {
          branch,
          year,
          skills,
          location,
          company,
          search
        },
        message: 'Use client-side Firestore for directory queries'
      }
    })

  } catch (error) {
    console.error('Alumni directory API error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch alumni directory', details: error.message },
      { status: 500 }
    )
  }
}