import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { userProfiles, workoutLogs, userStats, exercises } from '@/lib/db/schema';
import { eq, desc, count, avg, and, sql } from 'drizzle-orm';

// Define interfaces based on the actual database schema
interface UserProfile {
  id?: number;
  userId: string;
  name?: string;
  email?: string;
  height?: string | null;
  weight?: string | null;
  fitnessGoals?: any;
  fitnessLevel?: string;
  createdAt?: Date;
  updatedAt?: Date;
  strengthLimits?: any;
  trainingHistory?: any;
  injuryHistory?: any;
  recoveryMetrics?: any;
  workoutStats?: any;
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const userId = data.userId || "user-123"; // Use provided ID or fallback to mock for testing
    
    // Check if this is an AI-generated profile
    const isAIGenerated = data.source === 'ai-chat';
    
    // Remove userId from data to avoid duplication in the database
    const { userId: _, source: __, ...profileData } = data;

    // Check if profile exists
    const existingProfile = await db
      .select()
      .from(userProfiles)
      .where(eq(userProfiles.userId, userId));

    // Handle fitness goals formatting. This can come in various formats from different sources
    let fitnessGoals;
    
    if (profileData.fitnessGoals) {
      // Handle object format from AI: {primary: 'x', secondary: ['y', 'z']}
      if (typeof profileData.fitnessGoals === 'object' && !Array.isArray(profileData.fitnessGoals)) {
        fitnessGoals = profileData.fitnessGoals;
      } 
      // Handle array format from UI: ['primary goal', 'secondary goal']
      else if (Array.isArray(profileData.fitnessGoals)) {
        fitnessGoals = {
          primary: profileData.fitnessGoals[0] || 'General Fitness',
          secondary: profileData.fitnessGoals.slice(1) || []
        };
      }
      // Handle string format from AI: "Goal is to lose weight"
      else if (typeof profileData.fitnessGoals === 'string') {
        const goalString = profileData.fitnessGoals.toLowerCase();
        let primaryGoal = 'General Fitness';
        
        if (goalString.includes('muscle') || goalString.includes('gain') || goalString.includes('bulk')) {
          primaryGoal = 'Build Muscle';
        } else if (goalString.includes('lose') || goalString.includes('fat') || goalString.includes('weight')) {
          primaryGoal = 'Lose Fat';
        } else if (goalString.includes('strength') || goalString.includes('strong')) {
          primaryGoal = 'Increase Strength';
        } else if (goalString.includes('endurance') || goalString.includes('cardio')) {
          primaryGoal = 'Improve Endurance';
        }
        
        fitnessGoals = {
          primary: primaryGoal,
          secondary: []
        };
      } else {
        fitnessGoals = {
          primary: 'General Fitness',
          secondary: []
        };
      }
    } else {
      fitnessGoals = {
        primary: 'General Fitness',
        secondary: []
      };
    }

    // Parse equipment from various formats
    const equipment = Array.isArray(profileData.equipment)
      ? profileData.equipment
      : typeof profileData.equipment === 'string'
        ? profileData.equipment.split(',').map((item: string) => item.trim())
        : [];

    // Parse medical conditions and injuries
    let medicalConditions = [];
    
    if (profileData.medicalConditions) {
      if (typeof profileData.medicalConditions === 'string') {
        medicalConditions = [profileData.medicalConditions];
      } else if (Array.isArray(profileData.medicalConditions)) {
        medicalConditions = profileData.medicalConditions;
      }
    }
    
    if (profileData.injuries) {
      if (typeof profileData.injuries === 'string') {
        medicalConditions.push(profileData.injuries);
      } else if (Array.isArray(profileData.injuries)) {
        medicalConditions = [...medicalConditions, ...profileData.injuries];
      }
    }

    // Format workout preference as JSON
    const workoutPreference = {
      daysPerWeek: profileData.workoutPreference?.daysPerWeek || 
                  profileData.daysPerWeek || 
                  (typeof profileData.workoutsPerWeek === 'number' ? profileData.workoutsPerWeek : 3),
      preferredDays: profileData.workoutPreference?.preferredDays || 
                    profileData.preferredDays || 
                    [],
      timePerWorkout: profileData.workoutPreference?.timePerWorkout || 
                     profileData.timePerWorkout || 
                     profileData.minutesPerWorkout ||
                     60
    };

    // Process strength limits if available
    let strengthLimits = existingProfile[0]?.strengthLimits || {};
    
    if (profileData.strengthLimits) {
      strengthLimits = profileData.strengthLimits;
    } else if (profileData.oneRepMaxes) {
      // Convert simple object of max lifts
      strengthLimits = Object.entries(profileData.oneRepMaxes).map(([exercise, weight]) => ({
        exercise,
        oneRepMax: parseFloat(weight as string),
        estimatedMax: true,
        lastUpdated: new Date().toISOString()
      }));
    }

    // Prepare final data object to match actual database schema
    const dbProfileData: UserProfile = {
      userId,
      name: profileData.name || existingProfile[0]?.name,
      email: profileData.email || existingProfile[0]?.email,
      weight: profileData.weight ? profileData.weight.toString() : existingProfile[0]?.weight || null,
      height: profileData.height ? profileData.height.toString() : existingProfile[0]?.height || null,
      fitnessLevel: profileData.fitnessLevel || existingProfile[0]?.fitnessLevel || 'Beginner',
      fitnessGoals: fitnessGoals,
      // Update or preserve strength limits
      strengthLimits: strengthLimits,
      // Store everything else in training_history
      trainingHistory: {
        workoutPreference: workoutPreference,
        age: profileData.age ? parseInt(profileData.age.toString()) : 
             (existingProfile[0]?.trainingHistory as any)?.age || null,
        equipment: equipment,
        experience: profileData.experience || (existingProfile[0]?.trainingHistory as any)?.experience || null,
        aiNotes: isAIGenerated ? 
                (profileData.notes || 'Profile updated via AI chat') : 
                (existingProfile[0]?.trainingHistory as any)?.aiNotes || null
      },
      // Store medical conditions and injuries
      injuryHistory: medicalConditions.length > 0 ? medicalConditions : 
                    existingProfile[0]?.injuryHistory || [],
      // Initialize or preserve recovery metrics
      recoveryMetrics: profileData.recoveryMetrics || existingProfile[0]?.recoveryMetrics || {
        sleepQuality: null,
        stressLevel: null,
        soreness: null,
        energyLevel: null,
        lastUpdated: null
      },
      updatedAt: new Date()
    };

    console.log('Saving profile data:', dbProfileData);

    if (existingProfile.length > 0) {
      // Update existing profile
      await db
        .update(userProfiles)
        .set(dbProfileData)
        .where(eq(userProfiles.userId, userId));
      
      console.log('Updated existing profile for user:', userId);
    } else {
      // Create new profile
      await db.insert(userProfiles).values(dbProfileData);
      
      console.log('Created new profile for user:', userId);
    }

    return NextResponse.json({
      message: 'Profile saved successfully',
      profile: await getEnrichedProfile(userId), // Return the full, enriched profile
      success: true,
    });
  } catch (error: any) {
    console.error('Error saving user profile:', error);
    return NextResponse.json(
      {
        error: 'Failed to save profile',
        details: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    // Extract user ID from query parameters if available
    const url = new URL(req.url);
    const userId = url.searchParams.get('userId') || "user-123";
    const includeStats = url.searchParams.get('includeStats') === 'true';

    console.log('Fetching profile for user:', userId);

    // Get the enriched profile with stats if requested
    const profile = await getEnrichedProfile(userId, includeStats);

    return NextResponse.json({
      profile,
      success: true,
    });
  } catch (error: any) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch profile',
        details: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}

// Helper function to get an enriched profile with workout stats
async function getEnrichedProfile(userId: string, includeStats: boolean = false) {
  // Fetch the user profile
  const profiles = await db
    .select()
    .from(userProfiles)
    .where(eq(userProfiles.userId, userId));

  // Transform the profile data to match the expected frontend format
  let profile: any = null;
  if (profiles.length > 0) {
    const dbProfile = profiles[0] as UserProfile;
    
    // Transform to frontend format - safely handle possible undefined objects
    const trainingHistory = dbProfile.trainingHistory || {};
    const injuryHistory = dbProfile.injuryHistory || [];
    const strengthLimits = dbProfile.strengthLimits || {};
    const recoveryMetrics = dbProfile.recoveryMetrics || {};

    profile = {
      age: trainingHistory.age || null,
      weight: dbProfile.weight || null,
      height: dbProfile.height || null,
      fitnessLevel: dbProfile.fitnessLevel || 'Beginner',
      fitnessGoals: dbProfile.fitnessGoals || { primary: 'General Fitness', secondary: [] },
      workoutPreference: trainingHistory.workoutPreference || {
        daysPerWeek: 3,
        preferredDays: [],
        timePerWorkout: 60
      },
      equipment: trainingHistory.equipment || [],
      medicalConditions: Array.isArray(injuryHistory) ? injuryHistory : [],
      strengthLimits: strengthLimits,
      recoveryMetrics: recoveryMetrics,
      experience: trainingHistory.experience || null,
      aiNotes: trainingHistory.aiNotes || null
    };

    // Include workout stats if requested
    if (includeStats) {
      profile.workoutStats = await getWorkoutStats(userId);
    }
  }

  // If no profile is found, return a default profile structure
  if (!profile) {
    profile = {
      age: null,
      weight: null,
      height: null,
      fitnessLevel: 'Beginner',
      fitnessGoals: { primary: 'General Fitness', secondary: [] },
      workoutPreference: {
        daysPerWeek: 3,
        preferredDays: [],
        timePerWorkout: 60
      },
      equipment: [],
      medicalConditions: [],
      strengthLimits: {},
      recoveryMetrics: {
        sleepQuality: null,
        stressLevel: null,
        soreness: null,
        energyLevel: null,
        lastUpdated: null
      }
    };

    if (includeStats) {
      profile.workoutStats = {
        totalWorkouts: 0,
        recentWorkouts: 0,
        mostTrainedMuscleGroup: null,
        avgWorkoutsPerWeek: 0,
        avgRpe: 0,
        hasData: false
      };
    }
  }

  return profile;
}

// Helper function to get workout statistics for a user
async function getWorkoutStats(userId: string) {
  try {
    // Count total workouts
    const totalWorkoutsResult = await db
      .select({ count: count() })
      .from(workoutLogs)
      .where(eq(workoutLogs.userId, userId));
    
    const totalWorkouts = totalWorkoutsResult[0]?.count || 0;
    
    // Count recent workouts (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentWorkoutsResult = await db
      .select({ count: count() })
      .from(workoutLogs)
      .where(
        and(
          eq(workoutLogs.userId, userId),
          sql`${workoutLogs.date} > ${thirtyDaysAgo.toISOString()}`
        )
      );
    
    const recentWorkouts = recentWorkoutsResult[0]?.count || 0;
    
    // Get most trained muscle group
    const muscleGroupResult = await db
      .select({
        muscleGroup: exercises.muscleGroup,
        count: count()
      })
      .from(workoutLogs)
      .innerJoin(exercises, eq(workoutLogs.exerciseId, exercises.id))
      .where(eq(workoutLogs.userId, userId))
      .groupBy(exercises.muscleGroup)
      .orderBy(desc(count()))
      .limit(1);
    
    const mostTrainedMuscleGroup = muscleGroupResult.length > 0 ? 
      muscleGroupResult[0].muscleGroup : null;
    
    // Calculate average workouts per week
    const avgWorkoutsPerWeek = totalWorkouts > 0 ? 
      Math.min(Math.round((recentWorkouts / 4) * 10) / 10, 7) : 0;
    
    // Get average RPE
    const avgRpeResult = await db
      .select({
        avgRpe: avg(workoutLogs.rpe)
      })
      .from(workoutLogs)
      .where(eq(workoutLogs.userId, userId));
    
    const avgRpe = avgRpeResult[0]?.avgRpe || 0;
    
    return {
      totalWorkouts,
      recentWorkouts,
      mostTrainedMuscleGroup,
      avgWorkoutsPerWeek,
      avgRpe,
      hasData: totalWorkouts > 0
    };
  } catch (error) {
    console.error('Error getting workout stats:', error);
    return {
      totalWorkouts: 0,
      recentWorkouts: 0,
      mostTrainedMuscleGroup: null,
      avgWorkoutsPerWeek: 0,
      avgRpe: 0,
      hasData: false
    };
  }
}
