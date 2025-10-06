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
  
  // Add comprehensive logging for debugging
  console.log('Middleware: Request details:', {
    pathname: url.pathname,
    hasSession: !!session,
    sessionUser: session?.user?.email || 'No user',
    sessionExpiry: session?.expires_at ? new Date(session.expires_at * 1000).toISOString() : 'No expiry',
    cookies: Object.fromEntries(request.cookies.getAll().map(c => [c.name, c.value])),
    userAgent: request.headers.get('user-agent')?.substring(0, 50) + '...'
  })
  
  // Define protected routes
  const protectedRoutes = ['/jobs', '/directory', '/events', '/dashboard', '/badges', '/profile']
  const authRoutes = ['/auth']
  
  const isProtectedRoute = protectedRoutes.some(route => 
    url.pathname.startsWith(route)
  )
  const isAuthRoute = authRoutes.some(route => 
    url.pathname.startsWith(route)
  )

  // Check for dummy authentication bypass
  const isDummyAuth = request.cookies.get('dummy-auth-verified')?.value === 'true'

  console.log('Middleware: Route analysis:', {
    isProtectedRoute,
    isAuthRoute,
    isDummyAuth,
    hasSession: !!session
  })

  // If user is not authenticated and trying to access protected route
  if (isProtectedRoute && !session && !isDummyAuth) {
    console.log('Middleware: Redirecting unauthenticated user to auth:', url.pathname)
    const redirectUrl = new URL('/auth', request.url)
    redirectUrl.searchParams.set('redirectTo', url.pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // If user is authenticated and trying to access auth route
  if (isAuthRoute && session) {
    const redirectTo = url.searchParams.get('redirectTo') || '/dashboard'
    console.log('Middleware: Redirecting authenticated user from auth to:', redirectTo)
    return NextResponse.redirect(new URL(redirectTo, request.url))
  }

  console.log('Middleware: Allowing request to proceed:', url.pathname)
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
