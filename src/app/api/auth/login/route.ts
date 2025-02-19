import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    // Mock authentication - replace with real authentication logic
    if (email && password) {
      // Only set the auth token after successful authentication
      const cookieStore = cookies()
      cookieStore.set('auth_token', '', { // Clear any existing token
        maxAge: 0,
        path: '/',
      })

      // Set the new token
      cookieStore.set('auth_token', 'demo-token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 // 24 hours
      })

      return NextResponse.json({
        success: true,
        user: {
          id: '1',
          name: email.split('@')[0],
          email: email
        }
      })
    }

    return NextResponse.json(
      { error: 'Invalid credentials' },
      { status: 401 }
    )
  } catch (error) {
    console.error('Authentication error:', error)
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    )
  }
}