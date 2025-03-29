import { NextResponse } from 'next/server';
import { db, userProfiles } from '@/lib/db';
import { eq } from 'drizzle-orm';

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

    // Prepare final data object
    const dbProfileData = {
      userId,
      age: profileData.age ? parseInt(profileData.age) : null,
      weight: profileData.weight ? profileData.weight.toString() : null,
      height: profileData.height ? profileData.height.toString() : null,
      fitnessLevel: profileData.fitnessLevel || 'Beginner',
      fitnessGoals: fitnessGoals,
      workoutPreference: workoutPreference,
      equipment: equipment,
      medicalConditions: medicalConditions ? [medicalConditions] : [],
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

    // Return the profile as is - it's already stored as JSON in the database
    let profile = null;
    if (profiles.length > 0) {
      profile = profiles[0];
      console.log('Found profile:', profile);
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
