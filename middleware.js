/**
 * Next.js Middleware for Authentication
 * Protects routes and manages user sessions
 */

import { createClient } from '@/lib/supabase/middleware'
import { NextResponse } from 'next/server'

export async function middleware(request) {
  const { supabase, supabaseResponse } = createClient(request)

  // Refresh session if expired - required for Server Components
  const {
    data: { session },
  } = await supabase.auth.getSession()

  const url = request.nextUrl.clone()
  
  // DIAGNOSTIC: Enhanced logging for debugging redirect loop
  console.log('🛡️ [MIDDLEWARE] ===== REQUEST START =====')
  console.log('🛡️ [MIDDLEWARE] path:', url.pathname, 'query:', url.search)
  console.log('🛡️ [MIDDLEWARE] server session present?', !!session, 'session.user?.id=', session?.user?.id ?? null)
  console.log('🛡️ [MIDDLEWARE] cookies:', request.cookies.getAll().map(c => c.name).join(', '))
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

  // CRITICAL FIX: Only redirect authenticated users from auth route if they're NOT actively in an auth flow
  if (isAuthRoute && session) {
    const redirectTo = url.searchParams.get('redirectTo')
    
    // Don't redirect if there's no redirectTo parameter - let the user stay on auth page
    // This prevents the infinite loop when coming from profile completion
    if (!redirectTo) {
      console.log('🛡️ [MIDDLEWARE] Authenticated user on auth page with no redirectTo, allowing')
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
