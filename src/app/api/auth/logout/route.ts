import { NextResponse } from 'next/server'

export async function POST() {
  try {
    // In a real app, you'd clear session/tokens here
    return NextResponse.json({ message: 'Logged out successfully' })
  } catch (error) {
    return NextResponse.json(
      { error: 'Logout failed' },
      { status: 500 }
    )
  }
} 