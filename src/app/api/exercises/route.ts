import { NextResponse } from 'next/server';
import { db, exercises } from '@/lib/db';
import { asc } from 'drizzle-orm';

export async function GET() {
  try {
    // Test database connection first
    const result = await db.select().from(exercises).orderBy(asc(exercises.name));

    // Debug log
    console.log('Fetched exercises:', result);

    return NextResponse.json({ 
      exercises: result,
      success: true 
    });
  } catch (error: any) {
    console.error('Failed to fetch exercises:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch exercises',
        details: error.message 
      },
      { status: 500 }
    );
  }
}