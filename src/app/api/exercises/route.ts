import { NextResponse } from 'next/server';
import { db, exercises } from '@/lib/db';

export async function GET() {
  try {
    const exerciseList = await db.select().from(exercises).orderBy(exercises.name);
    return NextResponse.json({ exercises: exerciseList });
  } catch (error: any) {
    console.error('Failed to fetch exercises:', error);
    return NextResponse.json(
      { error: 'Failed to fetch exercises' },
      { status: 500 }
    );
  }
}
