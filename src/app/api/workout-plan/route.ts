import { NextResponse } from 'next/server';
import { db, exercises, userProfiles, workoutLogs } from '@/lib/db';
import { generateWorkoutPlan } from '@/lib/ai/workoutRecommendation';
import { eq } from 'drizzle-orm';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Fetch available exercises first, we'll need them regardless
    const availableExercises = await db.select().from(exercises);
    
    let userProfile;
    // Define type for workout logs
    type WorkoutLogWithExercise = {
      id: number;
      userId: string;
      exerciseId: number;
      sets: number;
      reps: number;
      weight: string | number;
      date: Date | null;
      notes?: string | null;
      exercise?: any;
    };
    let recentWorkouts: WorkoutLogWithExercise[] = [];
    
    try {
      // Attempt to fetch user profile
      const profiles = await db
        .select()
        .from(userProfiles)
        .where(eq(userProfiles.userId, userId));
      
      if (profiles.length > 0) {
        userProfile = profiles[0];
        
        // Fetch recent workout history if we have a profile
        try {
          recentWorkouts = await db
            .select()
            .from(workoutLogs)
            .where(eq(workoutLogs.userId, userId))
            .orderBy(workoutLogs.date) // Default order is ascending, most recent will be last
            .limit(20);
            
          // Join with exercise data
          for (const workout of recentWorkouts) {
            if (workout.exerciseId) {
              const [exercise] = await db
                .select()
                .from(exercises)
                .where(eq(exercises.id, workout.exerciseId));
              
              if (exercise) {
                workout.exercise = exercise;
              }
            }
          }
        } catch (err) {
          console.error('Error fetching recent workouts:', err);
          // Continue with empty workout history
        }
      } else {
        // Create a default profile if none exists
        userProfile = {
          id: 0,
          userId: userId,
          fitnessLevel: 'beginner',
          fitnessGoals: { primary: 'strength', secondary: ['muscle_building'] },
          equipment: ['bodyweight', 'dumbbell'],
          workoutPreference: { daysPerWeek: 3 }
        };
      }
    } catch (profileError) {
      console.error('Error fetching user profile:', profileError);
      // Create a default profile if there was an error
      userProfile = {
        id: 0,
        userId: userId,
        fitnessLevel: 'beginner',
        fitnessGoals: { primary: 'strength', secondary: ['muscle_building'] },
        equipment: ['bodyweight', 'dumbbell'],
        workoutPreference: { daysPerWeek: 3 }
      };
    }

    // Generate workout plan using AI
    const workoutPlan = await generateWorkoutPlan(
      userId,
      userProfile,
      recentWorkouts,
      availableExercises
    );

    return NextResponse.json({ 
      success: true, 
      plan: workoutPlan 
    });
  } catch (error) {
    console.error('Failed to generate workout plan:', error);
    return NextResponse.json(
      { error: 'Failed to generate workout plan' },
      { status: 500 }
    );
  }
}