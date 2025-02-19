import { NextResponse } from 'next/server'

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
    if (email === MOCK_USER.email && password === MOCK_USER.password) {
      return NextResponse.json({
        user: {
          id: MOCK_USER.id,
          name: MOCK_USER.name,
          email: MOCK_USER.email
        }
      })
    }

    return NextResponse.json(
      { error: 'Invalid credentials' },
      { status: 401 }
    )
  } catch (error) {
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    )
  }
} 