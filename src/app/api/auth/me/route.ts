import { NextResponse } from 'next/server'

// Mock authenticated user - in a real app, this would check session/token
const MOCK_USER = {
  id: '1',
  name: 'Test User',
  email: 'test@example.com'
}

export async function GET() {
  try {
    // Mock authentication check - replace with real authentication logic
    return NextResponse.json(MOCK_USER)
  } catch (error) {
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 401 }
    )
  }
} 