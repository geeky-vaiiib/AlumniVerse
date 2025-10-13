/**
 * Server-side Session Sync Endpoint
 * 
 * This endpoint is called by the client after OTP verification to ensure
 * the session is properly synchronized to the server and accessible by middleware.
 * 
 * CRITICAL for fixing the OTP redirect freeze issue where client has session
 * but server middleware doesn't recognize it.
 */

import { createClient } from '@/lib/supabase/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    console.log('🔐 [SESSION_API] POST /api/auth/session - Starting session sync')
    
    const body = await request.json()
    const { access_token, refresh_token } = body
    
    if (!access_token) {
      console.error('🔐 [SESSION_API] ❌ No access_token provided')
      return NextResponse.json(
        { error: 'access_token is required' },
        { status: 400 }
      )
    }
    
    console.log('🔐 [SESSION_API] Received tokens:', {
      hasAccessToken: !!access_token,
      hasRefreshToken: !!refresh_token,
      accessTokenPrefix: access_token.substring(0, 20) + '...'
    })
    
    // 🔧 CRITICAL: We need to create a NextResponse FIRST so we can set cookies on it
    let response = NextResponse.json({ 
      success: true,
      message: 'Session synchronized to server',
      userId: null
    })
    
    // Create Supabase server client with custom cookie handling that sets cookies on our response
    const cookieStore = cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            // 🔧 Set cookies on both the cookie store AND the response
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
              response.cookies.set(name, value, options)
              console.log('🔐 [SESSION_API] Setting cookie:', name, '(length:', value?.length, ')')
            })
          },
        },
      }
    )
    
    // Set the session on the server - this will trigger setAll() callback above
    const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
      access_token,
      refresh_token: refresh_token || access_token
    })
    
    if (sessionError) {
      console.error('🔐 [SESSION_API] ❌ Failed to set session:', sessionError)
      return NextResponse.json(
        { error: 'Failed to set session', details: sessionError.message },
        { status: 500 }
      )
    }
    
    console.log('🔐 [SESSION_API] ✅ Session set successfully:', {
      userId: sessionData.session?.user?.id,
      email: sessionData.session?.user?.email,
      expiresAt: sessionData.session?.expires_at
    })
    
    // Update response with user ID
    response = NextResponse.json({ 
      success: true,
      message: 'Session synchronized to server',
      userId: sessionData.session?.user?.id
    })
    
    // Make sure cookies are set on the response
    const allCookies = cookieStore.getAll()
    allCookies.forEach(cookie => {
      if (cookie.name.includes('sb-') || cookie.name.includes('auth')) {
        response.cookies.set(cookie.name, cookie.value, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 60 * 60 * 24 * 7,
          path: '/'
        })
      }
    })
    
    console.log('🔐 [SESSION_API] ✅ Cookies set on response successfully')
    
    return response
    
  } catch (error) {
    console.error('🔐 [SESSION_API] ❌ Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    console.log('🔐 [SESSION_API] GET /api/auth/session - Checking session status')
    
    const supabase = createClient()
    const { data: { session }, error } = await supabase.auth.getSession()
    
    if (error) {
      console.error('🔐 [SESSION_API] ❌ Error getting session:', error)
      return NextResponse.json({ hasSession: false, error: error.message })
    }
    
    console.log('🔐 [SESSION_API] Session status:', {
      hasSession: !!session,
      userId: session?.user?.id,
      email: session?.user?.email
    })
    
    return NextResponse.json({
      hasSession: !!session,
      user: session?.user ? {
        id: session.user.id,
        email: session.user.email
      } : null
    })
    
  } catch (error) {
    console.error('🔐 [SESSION_API] ❌ Unexpected error:', error)
    return NextResponse.json({ hasSession: false, error: error.message })
  }
}
