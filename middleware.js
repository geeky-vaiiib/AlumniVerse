/**
 * Next.js Middleware for Authentication
 * 
 * FIREBASE MIGRATION NOTE:
 * Firebase manages authentication client-side, so we cannot check
 * server-side sessions in middleware. Protected route access is now
 * handled by client-side auth checks in the components.
 * 
 * This middleware now only handles basic route logging.
 */

import { NextResponse } from 'next/server'

export async function middleware(request) {
  const url = request.nextUrl.clone()

  console.log('🛡️ [MIDDLEWARE] path:', url.pathname)

  // Define protected routes (for logging only)
  const protectedRoutes = ['/jobs', '/directory', '/events', '/dashboard', '/badges', '/profile']
  const isProtectedRoute = protectedRoutes.some(route =>
    url.pathname.startsWith(route)
  )

  // Check for a Firebase auth indicator cookie (set by client after login)
  const hasFirebaseAuth = request.cookies.get('firebase-auth-active')?.value === 'true'

  console.log('🛡️ [MIDDLEWARE] Firebase mode:', {
    path: url.pathname,
    isProtectedRoute,
    hasFirebaseAuthCookie: hasFirebaseAuth,
    // Firebase auth is managed client-side, so we allow all requests
    // The Dashboard/protected components will check auth state themselves
    decision: 'ALLOW_ALL_FIREBASE_MODE'
  })

  // FIREBASE MODE: Allow all requests to pass through
  // Client-side auth will redirect unauthenticated users from protected routes
  return NextResponse.next()
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

