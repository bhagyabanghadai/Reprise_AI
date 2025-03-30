import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { userProfiles } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

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
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const userId = data.userId || "user-123"; // Use provided ID or fallback to mock for testing
    
    // Remove userId from data to avoid duplication in the database
    const { userId: _, ...profileData } = data;

    // Check if profile exists
    const existingProfile = await db
      .select()
      .from(userProfiles)
      .where(eq(userProfiles.userId, userId));

    // Prepare data for PostgreSQL
    // Convert non-object fields to JSON for database storage
    const fitnessGoals = Array.isArray(profileData.fitnessGoals) 
      ? profileData.fitnessGoals 
      : [];

    const equipment = Array.isArray(profileData.equipment)
      ? profileData.equipment
      : [];

    const medicalConditions = profileData.medicalConditions || '';

    // Format workout preference as JSON
    const workoutPreference = profileData.workoutPreference || {
      daysPerWeek: 3,
      preferredDays: [],
      timePerWorkout: 60
    };

    // Prepare final data object to match actual database schema
    const dbProfileData: UserProfile = {
      userId,
      weight: profileData.weight ? profileData.weight.toString() : null,
      height: profileData.height ? profileData.height.toString() : null,
      fitnessLevel: profileData.fitnessLevel || 'Beginner',
      fitnessGoals: fitnessGoals,
      // Store everything else in training_history
      trainingHistory: {
        workoutPreference: workoutPreference,
        age: profileData.age ? parseInt(profileData.age) : null,
        equipment: equipment
      },
      // Store medical conditions in injury_history
      injuryHistory: medicalConditions ? [medicalConditions] : [],
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

    console.log('Fetching profile for user:', userId);

    // Fetch the user profile
    const profiles = await db
      .select()
      .from(userProfiles)
      .where(eq(userProfiles.userId, userId));

    // Transform the profile data to match the expected frontend format
    let profile = null;
    if (profiles.length > 0) {
      const dbProfile = profiles[0] as UserProfile;
      console.log('Found database profile:', dbProfile);
      
      // Transform to frontend format - safely handle possible undefined objects
      const trainingHistory = dbProfile.trainingHistory || {};
      const injuryHistory = dbProfile.injuryHistory || {};

      profile = {
        age: trainingHistory.age || null,
        weight: dbProfile.weight || null,
        height: dbProfile.height || null,
        fitnessLevel: dbProfile.fitnessLevel || 'Beginner',
        fitnessGoals: dbProfile.fitnessGoals || [],
        workoutPreference: trainingHistory.workoutPreference || {
          daysPerWeek: 3,
          preferredDays: [],
          timePerWorkout: 60
        },
        equipment: trainingHistory.equipment || [],
        medicalConditions: Array.isArray(injuryHistory) && injuryHistory.length > 0 
          ? injuryHistory[0] 
          : ''
      };
    }

    // If no profile is found, return a default profile structure
    const defaultProfile = {
      age: null,
      weight: null,
      height: null,
      fitnessLevel: 'Beginner',
      fitnessGoals: [],
      workoutPreference: {
        daysPerWeek: 3,
        preferredDays: [],
        timePerWorkout: 60
      },
      equipment: [],
      medicalConditions: ''
    };

    return NextResponse.json({
      profile: profile || defaultProfile,
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
