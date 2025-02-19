import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value
  const path = request.nextUrl.pathname

  console.log('Middleware - Path:', path) // Debug log
  console.log('Middleware - Token:', token) // Debug log

  // Protected routes that require authentication
  const protectedRoutes = ['/dashboard', '/workouts', '/profile']

  // Auth routes that should redirect to dashboard if logged in
  const authRoutes = ['/login', '/signup']

  // Check if the current path is protected
  const isProtectedRoute = protectedRoutes.some(route => path.startsWith(route))
  const isAuthRoute = authRoutes.some(route => path === route)

  console.log('Is Protected Route:', isProtectedRoute) // Debug log
  console.log('Is Auth Route:', isAuthRoute) // Debug log

  // If user is logged in and tries to access login/signup, redirect to dashboard
  if (isAuthRoute && token) {
    console.log('Redirecting to dashboard - Auth route with token') // Debug log
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // If user is not logged in and tries to access protected route, redirect to login
  if (isProtectedRoute && !token) {
    console.log('Redirecting to login - Protected route without token') // Debug log
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('from', path)
    return NextResponse.redirect(loginUrl)
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