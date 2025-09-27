/**
 * Next.js API Route for Signup
 * Proxies requests to the Express backend
 */

import { NextResponse } from 'next/server'

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5001'

export async function POST(request) {
  try {
    const body = await request.json()
    
    // Forward the request to the Express backend
    const response = await fetch(`${BACKEND_URL}/api/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    })

    const data = await response.json()

    // Return the response with the same status code
    return NextResponse.json(data, { status: response.status })

  } catch (error) {
    console.error('API route error:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: 'Internal server error' 
      }, 
      { status: 500 }
    )
  }
}
