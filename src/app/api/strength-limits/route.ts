import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { userProfiles } from '@/lib/db/schema';
import { eq, sql } from 'drizzle-orm';
import { UserProfile } from '@/lib/db';

// GET handler to retrieve strength limits for a user
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({
      success: false,
      error: 'UserId is required',
    }, { status: 400 });
  }

  // Check if database is available
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({
      success: false,
      error: 'Database not configured',
    }, { status: 503 });
  }

  try {
    // Test DB connection
    await db.execute(sql`SELECT 1`);

    // Fetch user profile
    const userProfile = await db.query.userProfiles.findFirst({
      where: eq(userProfiles.userId, userId),
    });

    if (!userProfile) {
      return NextResponse.json({
        success: false,
        strengthLimits: [],
        error: 'User profile not found',
      }, { status: 404 });
    }

    // Return strength limits if they exist, or an empty array
    return NextResponse.json({
      success: true,
      strengthLimits: userProfile.strengthLimits || [],
    });
  } catch (error) {
    console.error('Failed to fetch strength limits:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch strength limits',
    }, { status: 500 });
  }
}

// POST handler to save strength limits for a user
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, strengthLimits } = body;

    if (!userId) {
      return NextResponse.json({
        success: false,
        error: 'UserId is required',
      }, { status: 400 });
    }

    if (!strengthLimits || !Array.isArray(strengthLimits)) {
      return NextResponse.json({
        success: false,
        error: 'Strength limits must be an array',
      }, { status: 400 });
    }

    // First check if the user profile exists
    const userProfile = await db.query.userProfiles.findFirst({
      where: eq(userProfiles.userId, userId),
    });

    if (userProfile) {
      // Update existing profile
      await db.update(userProfiles)
        .set({
          strengthLimits: strengthLimits,
          updatedAt: new Date(),
        })
        .where(eq(userProfiles.userId, userId));
    } else {
      // Create new profile (this should rarely happen as profiles are created during onboarding)
      await db.insert(userProfiles).values({
        userId: userId,
        strengthLimits: strengthLimits,
        fitnessLevel: 'beginner',
        fitnessGoals: { primary: 'strength', secondary: [] },
        trainingHistory: { equipment: [], workoutPreference: { daysPerWeek: 3 } },
        injuryHistory: {},
        recoveryMetrics: {}
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Strength limits saved successfully',
    });
  } catch (error) {
    console.error('Failed to save strength limits:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to save strength limits',
    }, { status: 500 });
  }
}