import { NextResponse } from 'next/server';
import { db, exercises, userProfiles, workoutLogs, progressionHistory } from '@/lib/db';
import { generateAdvancedWorkoutPlan } from '@/lib/ai/advancedWorkoutRecommendation';
import { eq } from 'drizzle-orm';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const includeAI = searchParams.get('includeAI') !== 'false'; // Default to true
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Fetch available exercises first, we'll need them regardless
    const availableExercises = await db.select().from(exercises);
    
    let userProfile;
    
    try {
      // Attempt to fetch user profile
      const profiles = await db
        .select()
        .from(userProfiles)
        .where(eq(userProfiles.userId, userId));
      
      if (profiles.length > 0) {
        userProfile = profiles[0];
      } else {
        // Create a default profile if none exists
        userProfile = {
          id: 0,
          userId: userId,
          name: null,
          email: null,
          height: null,
          weight: null,
          fitnessLevel: 'beginner',
          fitnessGoals: { primary: 'strength', secondary: ['muscle_building'] },
          strengthLimits: {},
          trainingHistory: { equipment: ['bodyweight', 'dumbbell'] },
          injuryHistory: {},
          recoveryMetrics: {},
          createdAt: new Date(),
          updatedAt: new Date()
        };
      }
    } catch (profileError) {
      console.error('Error fetching user profile:', profileError);
      // Create a default profile if there was an error
      userProfile = {
        id: 0,
        userId: userId,
        name: null,
        email: null,
        height: null,
        weight: null,
        fitnessLevel: 'beginner',
        fitnessGoals: { primary: 'strength', secondary: ['muscle_building'] },
        strengthLimits: {},
        trainingHistory: { equipment: ['bodyweight', 'dumbbell'] },
        injuryHistory: {},
        recoveryMetrics: {},
        createdAt: new Date(),
        updatedAt: new Date()
      };
    }

    // Generate advanced workout plan
    const workoutPlan = await generateAdvancedWorkoutPlan(
      userId,
      userProfile,
      availableExercises,
      includeAI
    );

    return NextResponse.json({ 
      success: true, 
      plan: workoutPlan 
    });
  } catch (error) {
    console.error('Failed to generate advanced workout plan:', error);
    return NextResponse.json(
      { error: 'Failed to generate advanced workout plan' },
      { status: 500 }
    );
  }
}

/**
 * API route for saving user feedback on a workout plan
 */
export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { userId, planId, feedback, rating } = data;
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    if (!feedback && !rating) {
      return NextResponse.json(
        { error: 'Feedback or rating is required' },
        { status: 400 }
      );
    }
    
    // In a real implementation, we would save this feedback to use
    // for improving future workout recommendations
    // For now, we'll just log it and return success
    
    console.log(`Received feedback for plan ${planId || 'unknown'} from user ${userId}:`);
    if (feedback) console.log(`Feedback: ${feedback}`);
    if (rating) console.log(`Rating: ${rating}/5`);
    
    return NextResponse.json({
      success: true,
      message: 'Feedback received successfully'
    });
  } catch (error) {
    console.error('Error processing workout plan feedback:', error);
    return NextResponse.json(
      { error: 'Failed to process feedback' },
      { status: 500 }
    );
  }
}