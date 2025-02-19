import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json()

    // Mock signup - in a real app, you'd save to database
    const newUser = {
      id: Date.now().toString(),
      name,
      email
    }

    return NextResponse.json(newUser)
  } catch (error) {
    return NextResponse.json(
      { error: 'Signup failed' },
      { status: 500 }
    )
  }
} 