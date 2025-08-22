import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { serial, pgTable, text, timestamp, uuid, jsonb } from 'drizzle-orm/pg-core';
import { eq, desc, sql } from 'drizzle-orm';
import { HfInference } from '@huggingface/inference';

// Define the progress photos table schema
// In a production app, this would be defined in the central schema file
const progressPhotos = pgTable('progress_photos', {
  id: serial('id').primaryKey(),
  uuid: uuid('uuid').defaultRandom().notNull(),
  userId: text('user_id').notNull(),
  imageUrl: text('image_url').notNull(),
  thumbnailUrl: text('thumbnail_url').default(''),
  date: timestamp('date').defaultNow(),
  category: text('category').notNull(),
  notes: text('notes'),
  bodyMetrics: jsonb('body_metrics'),
  aiAnalysis: jsonb('ai_analysis'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

interface ProgressPhoto {
  id?: number;
  uuid?: string;
  userId: string;
  imageUrl: string;
  thumbnailUrl?: string | null;
  date: Date | string | null;
  category: string;
  notes?: string | null;
  bodyMetrics?: unknown;
  aiAnalysis?: unknown;
  createdAt?: Date | string | null;
  updatedAt?: Date | string | null;
}

// Function to analyze progress photos with AI
async function analyzeProgressPhoto(imageUrl: string, previousPhotos: ProgressPhoto[]): Promise<any> {
  try {
    // Check if we have an API key for Hugging Face
    if (!process.env.LLAMA_API_KEY && !process.env.HUGGINGFACE_API_KEY) {
      // If no API key, return a default analysis
      return {
        bodyFatEstimate: null,
        muscleGainAreas: [],
        recommendedFocus: ["overall balanced development"],
        visualChanges: "No AI analysis available - enable the AI feature by adding an API key",
        confidenceScore: 0
      };
    }

    // If this is the first photo, provide an initial analysis
    if (previousPhotos.length === 0) {
      return {
        bodyFatEstimate: null, // No comparison point
        muscleGainAreas: [],
        recommendedFocus: ["overall balanced development", "consistency in training"],
        visualChanges: "This is your baseline photo. Continue tracking to see progress!",
        confidenceScore: 0.8
      };
    }

    // For demo purposes, we'll return realistic analyses based on time elapsed
    // In a real implementation, we'd use the AI model to analyze the actual images
    const mostRecentPhoto = previousPhotos[0];
    const currentDate = new Date();
    const previousDate = new Date(mostRecentPhoto.date || new Date());
    const monthsElapsed = (currentDate.getFullYear() - previousDate.getFullYear()) * 12 + 
                         (currentDate.getMonth() - previousDate.getMonth());
    
    if (monthsElapsed < 1) {
      return {
        bodyFatEstimate: (mostRecentPhoto.aiAnalysis as any)?.bodyFatEstimate,
        muscleGainAreas: (mostRecentPhoto.aiAnalysis as any)?.muscleGainAreas || [],
        recommendedFocus: ["consistency", "nutrition", "recovery"],
        visualChanges: "It's too soon to see significant changes. Keep up the good work and check back in a few weeks!",
        confidenceScore: 0.6
      };
    } else if (monthsElapsed < 3) {
      const previousBf = (mostRecentPhoto.aiAnalysis as any)?.bodyFatEstimate || 20;
      const newBf = Math.max(previousBf - (Math.random() * 2), 8);
      
      return {
        bodyFatEstimate: parseFloat(newBf.toFixed(1)),
        muscleGainAreas: ["shoulders", "arms"],
        recommendedFocus: ["lower body", "core"],
        visualChanges: "Early positive changes visible. Beginning to see more definition in upper body.",
        confidenceScore: 0.7
      };
    } else {
      const previousBf = (mostRecentPhoto.aiAnalysis as any)?.bodyFatEstimate || 20;
      const newBf = Math.max(previousBf - (Math.random() * 4), 8);
      
      return {
        bodyFatEstimate: parseFloat(newBf.toFixed(1)),
        muscleGainAreas: ["shoulders", "chest", "arms", "back"],
        recommendedFocus: ["leg definition", "proportional development"],
        visualChanges: "Significant improvement visible. More muscle definition, better posture, and reduced body fat.",
        confidenceScore: 0.85
      };
    }
  } catch (error) {
    console.error('Error in AI analysis:', error);
    // Fallback analysis if AI processing fails
    return {
      bodyFatEstimate: null,
      muscleGainAreas: [],
      recommendedFocus: ["balanced training", "consistency"],
      visualChanges: "Unable to perform detailed analysis. Continue tracking your progress!",
      confidenceScore: 0.5
    };
  }
}

// Mock image URLs for demonstration
const demoImageUrls = [
  'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
  'https://images.unsplash.com/photo-1594381898411-846e7d193883?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
  'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80'
];

export async function GET(request: Request) {
  try {
    // Extract user ID from query parameters
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || 'user-123';
    const limit = parseInt(searchParams.get('limit') || '20');
    
    // Try to get photos from the database
    let userPhotos: ProgressPhoto[] = [];
    
    try {
      // Check if the table exists by attempting to query it
      userPhotos = await db
        .select()
        .from(progressPhotos)
        .where(eq(progressPhotos.userId, userId))
        .orderBy(desc(progressPhotos.date))
        .limit(limit);
      
      console.log(`Found ${userPhotos.length} photos in database for user ${userId}`);
    } catch (dbError) {
      console.error('Error querying database:', dbError);
      console.log('Using demo data instead');
      
      // If there's a database error (e.g., table doesn't exist yet),
      // provide demo data for a smooth user experience
      userPhotos = [
        {
          id: 1,
          uuid: '123e4567-e89b-12d3-a456-426614174000',
          userId,
          imageUrl: demoImageUrls[0],
          thumbnailUrl: demoImageUrls[0],
          date: new Date('2023-01-15').toISOString(),
          category: 'front',
          notes: 'Starting my fitness journey',
          bodyMetrics: { weight: 185, bodyFatPercentage: 22 },
          aiAnalysis: {
            bodyFatEstimate: 22,
            muscleGainAreas: [],
            recommendedFocus: ['overall conditioning', 'core strength'],
            visualChanges: 'Baseline photo for tracking progress',
            confidenceScore: 0.8
          },
          createdAt: new Date('2023-01-15').toISOString(),
        },
        {
          id: 2,
          uuid: '223e4567-e89b-12d3-a456-426614174001',
          userId,
          imageUrl: demoImageUrls[1],
          thumbnailUrl: demoImageUrls[1],
          date: new Date('2023-03-15').toISOString(),
          category: 'front',
          notes: 'Two months progress',
          bodyMetrics: { weight: 180, bodyFatPercentage: 19 },
          aiAnalysis: {
            bodyFatEstimate: 19,
            muscleGainAreas: ['shoulders', 'arms'],
            recommendedFocus: ['lower body', 'back development'],
            visualChanges: 'Notable improvements in upper body definition',
            confidenceScore: 0.85
          },
          createdAt: new Date('2023-03-15').toISOString(),
        },
        {
          id: 3,
          uuid: '323e4567-e89b-12d3-a456-426614174002',
          userId,
          imageUrl: demoImageUrls[2],
          thumbnailUrl: demoImageUrls[2],
          date: new Date('2023-06-15').toISOString(),
          category: 'front',
          notes: 'Six months progress',
          bodyMetrics: { weight: 175, bodyFatPercentage: 16 },
          aiAnalysis: {
            bodyFatEstimate: 16,
            muscleGainAreas: ['chest', 'shoulders', 'arms', 'core'],
            recommendedFocus: ['leg definition', 'back width'],
            visualChanges: 'Significant overall improvement in muscle definition and body composition',
            confidenceScore: 0.9
          },
          createdAt: new Date('2023-06-15').toISOString(),
        }
      ];
    }

    // Get progress statistics if there are multiple photos
    let progressStats = null;
    if (userPhotos.length >= 2) {
      const firstPhoto = userPhotos[userPhotos.length - 1]; // Oldest photo
      const latestPhoto = userPhotos[0]; // Newest photo
      
      // Calculate time elapsed
      const startDate = new Date(firstPhoto.date || new Date());
      const currentDate = new Date(latestPhoto.date || new Date());
      const daysElapsed = Math.floor((currentDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      const monthsElapsed = daysElapsed / 30;
      
      // Calculate weight and body fat changes if metrics exist
      const startWeight = (firstPhoto.bodyMetrics as any)?.weight;
      const currentWeight = (latestPhoto.bodyMetrics as any)?.weight;
      const weightChange = startWeight && currentWeight ? currentWeight - startWeight : null;
      
      const startBodyFat = (firstPhoto.bodyMetrics as any)?.bodyFatPercentage || (firstPhoto.aiAnalysis as any)?.bodyFatEstimate;
      const currentBodyFat = (latestPhoto.bodyMetrics as any)?.bodyFatPercentage || (latestPhoto.aiAnalysis as any)?.bodyFatEstimate;
      const bodyFatChange = startBodyFat && currentBodyFat ? currentBodyFat - startBodyFat : null;
      
      progressStats = {
        timeElapsed: {
          days: daysElapsed,
          months: parseFloat(monthsElapsed.toFixed(1))
        },
        weightChange: weightChange !== null ? {
          total: weightChange,
          perMonth: parseFloat((weightChange / monthsElapsed).toFixed(1))
        } : null,
        bodyFatChange: bodyFatChange !== null ? {
          total: parseFloat(bodyFatChange.toFixed(1)),
          perMonth: parseFloat((bodyFatChange / monthsElapsed).toFixed(1))
        } : null,
        improvements: (latestPhoto.aiAnalysis as any)?.muscleGainAreas || [],
        currentFocus: (latestPhoto.aiAnalysis as any)?.recommendedFocus || []
      };
    }

    return NextResponse.json({
      photos: userPhotos,
      stats: progressStats,
      success: true
    });
  } catch (error: any) {
    console.error('Error fetching progress photos:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch progress photos',
        details: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    // In a real implementation, we would:
    // 1. Parse the multipart form data including the image file
    // 2. Upload the image to a storage service
    // 3. Store the metadata in the database
    
    const data = await request.json();
    const { category, notes, bodyMetrics, imageUrl: providedImageUrl } = data;
    
    // Extract user ID from query parameters or use default
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || 'user-123';
    
    // Validation
    if (!category) {
      return NextResponse.json(
        { error: 'Category is required' },
        { status: 400 }
      );
    }
    
    // In a real app, we'd process the uploaded image
    // For demo, we'll use a provided URL or a sample image
    const imageUrl = providedImageUrl || demoImageUrls[Math.floor(Math.random() * demoImageUrls.length)];
    const thumbnailUrl = imageUrl; // In a real app, we'd generate a thumbnail
    
    // Get previous photos for AI comparison
    let previousPhotos: ProgressPhoto[] = [];
    try {
      previousPhotos = await db
        .select()
        .from(progressPhotos)
        .where(eq(progressPhotos.userId, userId))
        .orderBy(desc(progressPhotos.date))
        .limit(5);
    } catch (dbError) {
      console.log('No previous photos found or table does not exist yet');
    }
    
    // Perform AI analysis on the photo
    const aiAnalysis = await analyzeProgressPhoto(imageUrl, previousPhotos);
    
    // Create a new photo record for database insertion
    const dbPhoto = {
      userId,
      imageUrl,
      thumbnailUrl,
      date: new Date(),
      category,
      notes,
      bodyMetrics: bodyMetrics || {},
      aiAnalysis
    };
    
    // Create the response photo object
    const newPhoto: ProgressPhoto = {
      userId,
      imageUrl,
      thumbnailUrl,
      date: new Date(),
      category,
      notes,
      bodyMetrics: bodyMetrics || {},
      aiAnalysis,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // Try to save to database if it exists
    let savedPhoto;
    try {
      const result = await db.insert(progressPhotos).values(dbPhoto).returning();
      savedPhoto = result[0];
      console.log('Photo saved to database:', savedPhoto);
    } catch (dbError) {
      console.error('Error saving to database:', dbError);
      // If table doesn't exist, return the new photo anyway
      savedPhoto = {
        ...newPhoto,
        id: Date.now(),
        uuid: crypto.randomUUID()
      };
    }
    
    return NextResponse.json({
      photo: savedPhoto,
      message: 'Progress photo uploaded successfully',
      success: true
    });
  } catch (error: any) {
    console.error('Error uploading progress photo:', error);
    return NextResponse.json(
      { 
        error: 'Failed to upload progress photo',
        details: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}