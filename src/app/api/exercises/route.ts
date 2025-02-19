import { NextResponse } from 'next/server';
import { db, exercises, testConnection } from '@/lib/db';
import { asc } from 'drizzle-orm';

export async function GET() {
  try {
    // First test the database connection
    const isConnected = await testConnection();
    if (!isConnected) {
      throw new Error('Database connection failed');
    }

    // Initialize exercises table if needed
    const result = await db.select().from(exercises).orderBy(asc(exercises.name));

    // Add some default exercises if none exist
    if (result.length === 0) {
      const defaultExercises = [
        { name: 'Bench Press', description: 'Barbell bench press', category: 'strength', muscleGroup: 'chest' },
        { name: 'Squat', description: 'Barbell squat', category: 'strength', muscleGroup: 'legs' },
        { name: 'Deadlift', description: 'Barbell deadlift', category: 'strength', muscleGroup: 'back' },
      ];

      for (const exercise of defaultExercises) {
        await db.insert(exercises).values(exercise);
      }

      // Fetch again after inserting defaults
      result = await db.select().from(exercises).orderBy(asc(exercises.name));
    }

    console.log('Successfully fetched exercises:', result);

    return NextResponse.json({ 
      exercises: result,
      success: true 
    });
  } catch (error: any) {
    console.error('Failed to fetch exercises:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch exercises',
        details: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}