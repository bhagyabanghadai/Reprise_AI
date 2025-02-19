import { NextResponse } from 'next/server';
import { db, userProfiles } from '@/lib/db';
import { eq } from 'drizzle-orm';

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const { userId, ...profileData } = data;

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Check if profile exists
    const existingProfile = await db
      .select()
      .from(userProfiles)
      .where(eq(userProfiles.userId, userId));

    if (existingProfile.length > 0) {
      // Update existing profile
      await db
        .update(userProfiles)
        .set({
          ...profileData,
          updatedAt: new Date(),
        })
        .where(eq(userProfiles.userId, userId));
    } else {
      // Create new profile
      await db.insert(userProfiles).values({
        userId,
        ...profileData,
      });
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
      },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const profile = await db
      .select()
      .from(userProfiles)
      .where(eq(userProfiles.userId, userId));

    return NextResponse.json({
      profile: profile[0] || null,
      success: true,
    });
  } catch (error: any) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch profile',
        details: error.message,
      },
      { status: 500 }
    );
  }
}
