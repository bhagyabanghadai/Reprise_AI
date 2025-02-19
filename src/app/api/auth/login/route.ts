import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

// This is a mock implementation. In a real app, you'd validate against a database
const MOCK_USER = {
  id: '1',
  name: 'Test User',
  email: 'test@example.com',
  password: 'password123' // In real app, this would be hashed
}

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    // Mock authentication - replace with real authentication logic
    if (email && password) {
      // Set the auth token in an HTTP-only cookie
      cookies().set('auth_token', 'demo-token', {
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