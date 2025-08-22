import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { userProfiles, workoutLogs } from '@/lib/db/schema';
import { analyzeWorkout } from '@/lib/ai/workoutRecommendation';
import { eq } from 'drizzle-orm';

export async function POST(request: Request) {
  try {
    const { userId, workoutId } = await request.json();
    
    if (!userId || !workoutId) {
      return NextResponse.json(
        { error: 'User ID and Workout ID are required' },
        { status: 400 }
      );
    }

    // Fetch user profile
    const [userProfile] = await db
      .select()
      .from(userProfiles)
      .where(eq(userProfiles.userId, userId));

    if (!userProfile) {
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 }
      );
    }

    // Fetch the current workout
    const [currentWorkout] = await db.query.workoutLogs.findMany({
      where: eq(workoutLogs.id, workoutId),
      with: {
        exercise: true,
      },
    });

    if (!currentWorkout) {
      return NextResponse.json(
        { error: 'Workout not found' },
        { status: 404 }
      );
    }

    // Fetch previous workouts for the same exercise
    const previousWorkouts = await db.query.workoutLogs.findMany({
      where: (logs, { and, eq, lt }) => and(
        eq(logs.userId, userId),
        eq(logs.exerciseId, currentWorkout.exerciseId!),
        lt(logs.date, currentWorkout.date!)
      ),
      with: {
        exercise: true,
      },
      orderBy: (logs, { desc }) => [desc(logs.date)],
      limit: 5, // Get the 5 most recent previous workouts
    });

    // Generate analysis using AI
    const analysis = await analyzeWorkout(
      currentWorkout,
      userProfile,
      previousWorkouts
    );

    return NextResponse.json({ 
      success: true, 
      analysis 
    });
  } catch (error) {
    console.error('Failed to analyze workout:', error);
    return NextResponse.json(
      { error: 'Failed to analyze workout' },
      { status: 500 }
    );
  }
}