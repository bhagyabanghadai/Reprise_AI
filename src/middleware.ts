import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Get auth token from cookies
  const token = request.cookies.get('auth_token')?.value
  const path = request.nextUrl.pathname

  // Protected routes that require authentication
  const protectedRoutes = ['/dashboard', '/workouts', '/profile']

  // Auth routes that should not be accessed when logged in
  const authRoutes = ['/login', '/signup']

  // Check if the current path matches any protected route
  const isProtectedRoute = protectedRoutes.some(route => path.startsWith(route))
  const isAuthRoute = authRoutes.some(route => path === route)

  // If trying to access protected route without valid token, redirect to login
  if (isProtectedRoute && !token) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('from', path)
    return NextResponse.redirect(loginUrl)
  }

  // Allow access to auth routes only if not logged in
  if (isAuthRoute && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/workouts/:path*',
    '/profile/:path*',
    '/login',
    '/signup'
  ]
}