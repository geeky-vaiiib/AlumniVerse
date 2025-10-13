/**
 * Next.js Middleware for Authentication
 * Protects routes and manages user sessions
 */

import { createClient } from '@/lib/supabase/middleware'
import { NextResponse } from 'next/server'

export async function middleware(request) {
  const { supabase, supabaseResponse } = createClient(request)

  const url = request.nextUrl.clone()
  
  // DIAGNOSTIC: Enhanced logging for debugging redirect loop
  console.log('🛡️ [MIDDLEWARE] ===== REQUEST START =====')
  console.log('🛡️ [MIDDLEWARE] path:', url.pathname, 'query:', url.search)
  
  // Log all cookies for debugging
  const allCookies = request.cookies.getAll()
  console.log('🛡️ [MIDDLEWARE] cookies:', allCookies.map(c => c.name).join(', '))
  
  // Refresh session if expired - required for Server Components
  const {
    data: { session },
  } = await supabase.auth.getSession()

  console.log('🛡️ [MIDDLEWARE] server session present?', !!session, 'session.user?.id=', session?.user?.id ?? null)
  
  // 🔧 Enhanced session debugging
  if (session) {
    console.log('🛡️ [MIDDLEWARE] ✅ Session details:', {
      userId: session.user.id,
      email: session.user.email,
      expiresAt: new Date(session.expires_at * 1000).toISOString()
    })
  } else {
    // Check if we have Supabase cookies but session failed to load
    const hasSupabaseCookies = allCookies.some(c => 
      c.name.includes('sb-') && c.name.includes('auth-token')
    )
    if (hasSupabaseCookies) {
      console.log('🛡️ [MIDDLEWARE] ⚠️ WARNING: Supabase cookies present but getSession() returned null')
      console.log('🛡️ [MIDDLEWARE] Cookie names:', allCookies
        .filter(c => c.name.includes('sb-') || c.name.includes('auth'))
        .map(c => c.name)
        .join(', ')
      )
    }
  }
  console.log('🛡️ [MIDDLEWARE] Request details:', {
    pathname: url.pathname,
    hasSession: !!session,
    sessionUser: session?.user?.email || 'No user',
    searchParams: url.searchParams.toString(),
    timestamp: new Date().toISOString(),
    userAgent: request.headers.get('user-agent')?.substring(0, 30) + '...'
  })
  
  // Define protected routes
  const protectedRoutes = ['/jobs', '/directory', '/events', '/dashboard', '/badges', '/profile']
  const authRoutes = ['/auth']
  // Add whitelist for auth callbacks and verification flows
  const authWhitelist = ['/auth/callback', '/auth/verify', '/api/auth', '/api/profile']
  
  const isProtectedRoute = protectedRoutes.some(route => 
    url.pathname.startsWith(route)
  )
  const isAuthRoute = authRoutes.some(route => 
    url.pathname.startsWith(route)
  )
  const isAuthWhitelisted = authWhitelist.some(route =>
    url.pathname.startsWith(route)
  )

  // Check for dummy authentication bypass
  const isDummyAuth = request.cookies.get('dummy-auth-verified')?.value === 'true'

  console.log('🛡️ [MIDDLEWARE] Route analysis:', {
    isProtectedRoute,
    isAuthRoute,
    isAuthWhitelisted,
    isDummyAuth,
    hasSession: !!session,
    decision: isAuthWhitelisted ? 'WHITELIST_ALLOW' :
              isProtectedRoute && !session && !isDummyAuth ? 'REDIRECT_TO_AUTH' : 
              isAuthRoute && session ? 'REDIRECT_FROM_AUTH' : 'ALLOW'
  })

  // Always allow whitelisted auth paths to prevent interrupting auth flows
  if (isAuthWhitelisted) {
    console.log('🛡️ [MIDDLEWARE] Allowing whitelisted auth path:', url.pathname)
    return supabaseResponse
  }

  // If user is not authenticated and trying to access protected route
  if (isProtectedRoute && !session && !isDummyAuth) {
    console.log('🛡️ [MIDDLEWARE] Redirecting unauthenticated user to auth:', url.pathname)
    const redirectUrl = new URL('/auth', request.url)
    redirectUrl.searchParams.set('redirectTo', url.pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // 🔧 DISABLED: Let frontend handle profile completion checks
  // Middleware should only check for session, not profile state
  // This prevents redirect loops and race conditions with profile creation
  console.log('🛡️ [MIDDLEWARE] ✅ Session verified, allowing access to protected route:', url.pathname)

  // 🔧 FIX: Allow /profile page without additional checks to prevent loops
  if (url.pathname.startsWith('/profile') && session) {
    console.log('🛡️ [MIDDLEWARE] ✅ Allowing access to profile page:', {
      pathname: url.pathname,
      query: url.search,
      userId: session.user.id
    })
    return supabaseResponse
  }

  // CRITICAL FIX: Only redirect authenticated users from auth route if they're NOT actively in an auth flow
  if (isAuthRoute && session) {
    const redirectTo = url.searchParams.get('redirectTo')
    
    // Don't redirect if there's no redirectTo parameter - let the user stay on auth page
    // This prevents the infinite loop when coming from profile completion
    if (!redirectTo) {
      console.log('🛡️ [MIDDLEWARE] Authenticated user on auth page with no redirectTo, allowing')
      return supabaseResponse
    }
    
    // Additional check: Don't redirect if we're in the middle of auth flow steps
    const isInAuthFlow = url.searchParams.has('step') || url.pathname.includes('/auth/callback')
    if (isInAuthFlow) {
      console.log('🛡️ [MIDDLEWARE] User in auth flow, allowing to complete')
      return supabaseResponse
    }
    
    console.log('🛡️ [MIDDLEWARE] Redirecting authenticated user from auth to:', redirectTo)
    return NextResponse.redirect(new URL(redirectTo, request.url))
  }

  console.log('🛡️ [MIDDLEWARE] Allowing request to proceed:', url.pathname)
  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
