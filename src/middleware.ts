import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value
  const path = request.nextUrl.pathname

  // List of protected routes that require authentication
  const protectedRoutes = ['/dashboard', '/workouts', '/profile']

  // List of auth routes that should redirect to dashboard if already logged in
  const authRoutes = ['/login', '/signup']

  // Check if the requested path is a protected route
  const isProtectedRoute = protectedRoutes.some(route => path.startsWith(route))
  const isAuthRoute = authRoutes.some(route => path === route)

  // If trying to access protected route without token, redirect to login
  if (isProtectedRoute && !token) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('from', path)
    return NextResponse.redirect(loginUrl)
  }

  // If trying to access auth routes with token, redirect to dashboard
  if (isAuthRoute && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

// Configure the paths that trigger the middleware
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/workouts/:path*',
    '/profile/:path*',
    '/login',
    '/signup'
  ]
}