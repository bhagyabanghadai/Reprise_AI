import { NextResponse } from 'next/server';
import { aiService } from '@/lib/ai/aiService';
import { db, userProfiles, workoutLogs, UserProfile, WorkoutLog } from '@/lib/db';
import { eq, desc } from 'drizzle-orm';

interface ChatMessage {
  role: string;
  content: string;
}

export async function POST(request: Request) {
  try {
    const { message, userId, chatHistory } = await request.json();
    
    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Valid message is required' },
        { status: 400 }
      );
    }

    // If userId is provided, fetch user profile and recent workouts for context
    let userProfile: UserProfile | undefined = undefined;
    let recentWorkouts: WorkoutLog[] = [];
    
    if (userId) {
      try {
        // Get user profile
        const profiles = await db
          .select()
          .from(userProfiles)
          .where(eq(userProfiles.userId, userId));
        
        if (profiles && profiles.length > 0) {
          userProfile = profiles[0];
          
          // Get recent workouts
          const logs = await db
            .select()
            .from(workoutLogs)
            .where(eq(workoutLogs.userId, userId))
            .orderBy(desc(workoutLogs.createdAt))
            .limit(10);
          
          // We'd like to join with exercises, but will do that later
          recentWorkouts = logs;
        }
      } catch (err) {
        console.error('Error fetching user context:', err);
        // Continue without context if there's an error
      }
    }
    
    // Format chat history properly
    const formattedChatHistory: ChatMessage[] = Array.isArray(chatHistory) 
      ? chatHistory 
      : [];
    
    // Use the AI service to generate a response
    const response = await aiService.generateChatResponse(
      message,
      formattedChatHistory,
      userProfile,
      recentWorkouts
    );

    return NextResponse.json({
      message: response,
      metadata: {
        modelUsed: "nvidia/llama-3.1-nemotron-70b-instruct",
        timestamp: new Date().toISOString(),
        contextIncluded: {
          userProfile: !!userProfile,
          workoutHistory: recentWorkouts.length > 0
        }
      }
    });
  } catch (error: any) {
    console.error('AI Chat API error:', error.message);
    return NextResponse.json(
      { error: 'Failed to process message. Please try again.' },
      { status: 500 }
    );
  }
}