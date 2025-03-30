import { NextResponse } from 'next/server';
import { aiService } from '@/lib/ai/aiService';
import { db, userProfiles, workoutLogs, exercises, UserProfile, WorkoutLog, Exercise } from '@/lib/db';
import { eq, desc } from 'drizzle-orm';

interface ChatMessage {
  role: string;
  content: string;
  metadata?: any;
}

export async function POST(request: Request) {
  try {
    const { message, userId, chatHistory, intent } = await request.json();
    
    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Valid message is required' },
        { status: 400 }
      );
    }

    // If userId is provided, fetch user profile and recent workouts for context
    let userProfile: UserProfile | undefined = undefined;
    let recentWorkouts: WorkoutLog[] = [];
    let availableExercises: Exercise[] = [];
    
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
          
          // Get available exercises
          availableExercises = await db
            .select()
            .from(exercises);
          
          // Join workouts with exercise details
          for (const log of logs) {
            const exercise = availableExercises.find(e => e.id === log.exerciseId);
            if (exercise) {
              (log as any).exercise = exercise;
            }
          }
          
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
    
    // Generate different responses based on intent
    let response;
    if (intent === 'trainer') {
      // This is for the Interactive AI Trainer - use advanced format
      // Add the generateTrainerResponse method to AIService
      if (typeof aiService.generateTrainerResponse === 'function') {
        response = await aiService.generateTrainerResponse(
          message,
          formattedChatHistory,
          userProfile,
          recentWorkouts,
          availableExercises
        );
      } else {
        // Fallback to standard chat if trainer method is not available
        console.warn('generateTrainerResponse method not found, falling back to standard chat');
        response = await aiService.generateChatResponse(
          message,
          formattedChatHistory,
          userProfile,
          recentWorkouts
        );
      }
    } else {
      // Standard chat
      response = await aiService.generateChatResponse(
        message,
        formattedChatHistory,
        userProfile,
        recentWorkouts
      );
    }

    return NextResponse.json({
      message: response,
      metadata: {
        intent: intent || 'chat',
        modelUsed: "nvidia/llama-3.1-nemotron-70b-instruct",
        timestamp: new Date().toISOString(),
        contextIncluded: {
          userProfile: !!userProfile,
          workoutHistory: recentWorkouts.length > 0,
          exerciseOptions: availableExercises.length > 0
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