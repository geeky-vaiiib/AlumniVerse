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
  
  // Define protected routes
  const protectedRoutes = ['/jobs', '/directory', '/events', '/dashboard', '/badges']
  const authRoutes = ['/auth']
  
  const isProtectedRoute = protectedRoutes.some(route => 
    url.pathname.startsWith(route)
  )
  const isAuthRoute = authRoutes.some(route => 
    url.pathname.startsWith(route)
  )

  // Check for demo mode in cookies or headers
  const isDemoMode = request.cookies.get('demoMode')?.value === 'true' ||
                    request.headers.get('x-demo-mode') === 'true'

  // If user is not authenticated and trying to access protected route
  if (isProtectedRoute && !session && !isDemoMode) {
    const redirectUrl = new URL('/auth', request.url)
    redirectUrl.searchParams.set('redirectTo', url.pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // If user is authenticated and trying to access auth route
  if (isAuthRoute && session) {
    const redirectTo = url.searchParams.get('redirectTo') || '/dashboard'
    return NextResponse.redirect(new URL(redirectTo, request.url))
  }

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
