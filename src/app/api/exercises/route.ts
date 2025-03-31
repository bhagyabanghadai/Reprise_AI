import { NextResponse } from 'next/server';
import { db, testConnection } from '@/lib/db';
import { exercises } from '@/lib/db/schema';
import { asc } from 'drizzle-orm';

export async function GET() {
  try {
    // First test the database connection
    const isConnected = await testConnection();
    if (!isConnected) {
      throw new Error('Database connection failed');
    }

    // Initialize exercises table if needed
    let result = await db.select().from(exercises).orderBy(asc(exercises.name));

    // Add some default exercises if none exist
    if (result.length === 0) {
      const defaultExercises = [
        // Compound Movements
        { name: 'Bench Press', description: 'Barbell bench press for chest development', category: 'strength', muscleGroup: 'chest' },
        { name: 'Squat', description: 'Barbell squat for lower body strength', category: 'strength', muscleGroup: 'legs' },
        { name: 'Deadlift', description: 'Barbell deadlift for posterior chain development', category: 'strength', muscleGroup: 'back' },
        { name: 'Pull-up', description: 'Body weight pull-up for back and biceps', category: 'strength', muscleGroup: 'back' },
        { name: 'Overhead Press', description: 'Barbell overhead press for shoulder strength', category: 'strength', muscleGroup: 'shoulders' },
        
        // Isolation Exercises
        { name: 'Bicep Curl', description: 'Dumbbell bicep curl for arm development', category: 'isolation', muscleGroup: 'arms' },
        { name: 'Lateral Raise', description: 'Dumbbell lateral raise for shoulder width', category: 'isolation', muscleGroup: 'shoulders' },
        { name: 'Tricep Extension', description: 'Cable tricep extension for arm definition', category: 'isolation', muscleGroup: 'arms' },
        { name: 'Leg Press', description: 'Machine leg press for quad development', category: 'strength', muscleGroup: 'legs' },
        { name: 'Romanian Deadlift', description: 'Barbell Romanian deadlift for hamstring strength', category: 'strength', muscleGroup: 'legs' },
        
        // Cardio Options
        { name: 'Running', description: 'Outdoor or treadmill running', category: 'cardio', muscleGroup: 'fullbody' },
        { name: 'Cycling', description: 'Outdoor or stationary cycling', category: 'cardio', muscleGroup: 'legs' },
        { name: 'Rowing', description: 'Rowing machine workout', category: 'cardio', muscleGroup: 'fullbody' },
        
        // Functional Exercises
        { name: 'Kettlebell Swing', description: 'Explosive kettlebell movement', category: 'functional', muscleGroup: 'fullbody' },
        { name: 'Battle Ropes', description: 'High-intensity rope training', category: 'functional', muscleGroup: 'fullbody' },
        { name: 'Box Jumps', description: 'Plyometric box jumps for power', category: 'functional', muscleGroup: 'legs' }
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