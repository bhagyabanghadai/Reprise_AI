import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { exercises } from '@/lib/db/schema';
import { desc } from 'drizzle-orm';

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

    // Get today's exercises from the database
    const todaysExercises = await db.select().from(exercises)
      .orderBy(desc(exercises.createdAt))
      .limit(4);

    const workoutPlan = {
      id: 'today-1',
      name: "Today's Strength Training",
      description: `Focus on compound movements:
        ${todaysExercises.map(ex => `\n• ${ex.name} - ${ex.description}`).join('')}`,
      exercises: todaysExercises
    };

    return NextResponse.json(workoutPlan);
  } catch (error) {
    console.error('Failed to fetch workout plan:', error);
    return NextResponse.json(
      { error: 'Failed to fetch workout plan' },
      { status: 500 }
    );
  }
}
