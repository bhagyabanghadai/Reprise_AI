import { NextResponse } from 'next/server';
import { db, workoutLogs, exercises } from '@/lib/db';
import { eq } from 'drizzle-orm';

export async function POST(request: Request) {
  try {
    const { exerciseId, sets, reps, weight, rpe, notes, userId } = await request.json();
    
    // Validate required fields
    if (!exerciseId || !sets || !reps || !weight || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Log the workout
    const [newLog] = await db.insert(workoutLogs).values({
      exerciseId,
      sets,
      reps,
      weight,
      rpe: rpe || null,
      notes: notes || null,
      userId,
      // Use createdAt instead of date as the column 'date' doesn't exist in the database
      createdAt: new Date(),
    }).returning();

    return NextResponse.json({ success: true, log: newLog });
  } catch (error: any) {
    console.error('Failed to log workout:', error);
    return NextResponse.json(
      { error: 'Failed to log workout' },
      { status: 500 }
    );
  }
}

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

    console.log('Fetching workout logs for userId:', userId);

    // Fetch user's workout logs with exercise details
    try {
      const logs = await db.query.workoutLogs.findMany({
        where: eq(workoutLogs.userId, userId),
        with: {
          exercise: true
        },
        orderBy: (logs, { desc }) => [desc(logs.createdAt)]
      });

      return NextResponse.json({ logs });
    } catch (dbError) {
      console.error('Database error when fetching logs:', dbError);
      // Fallback to empty logs array if there's an error
      return NextResponse.json({ logs: [] });
    }
  } catch (error: any) {
    console.error('Failed to fetch workout logs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch workout logs', details: error.message },
      { status: 500 }
    );
  }
}
