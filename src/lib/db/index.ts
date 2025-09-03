import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { sql } from 'drizzle-orm';
import * as schema from './schema';
import { exercises, workoutLogs, progressionHistory, userStats, userProfiles, chatMessages } from './schema';

// Initialize the database with explicit error handling
let _db: ReturnType<typeof drizzle> | null = null;

const createDb = () => {
  if (_db) return _db;
  
  try {
    if (!process.env.DATABASE_URL) {
      // During build time, return a mock database to prevent errors
      if (process.env.NODE_ENV === 'production' && !process.env.RAILWAY_ENVIRONMENT) {
        console.warn('DATABASE_URL not set during build, using mock database');
        return null as any;
      }
      throw new Error('DATABASE_URL environment variable is not set');
    }
    
    const client = postgres(process.env.DATABASE_URL);
    _db = drizzle(client, { schema });
    return _db;
  } catch (error) {
    console.error('Failed to initialize database:', error);
    throw error;
  }
};

export const db = new Proxy({} as ReturnType<typeof drizzle>, {
  get(target, prop) {
    const actualDb = createDb();
    if (!actualDb) {
      throw new Error('Database not available during build time');
    }
    return actualDb[prop as keyof typeof actualDb];
  }
});

// Test database connection
export async function testConnection() {
  try {
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL environment variable is not set');
    }
    
    const client = postgres(process.env.DATABASE_URL);
    const result = await client`SELECT NOW()`;
    console.log('Database connection successful:', result);
    return true;
  } catch (error) {
    console.error('Database connection error:', error);
    return false;
  }
}

// Export types for use in other files
export type Exercise = typeof exercises.$inferSelect;
export type NewExercise = typeof exercises.$inferInsert;

export type WorkoutLog = typeof workoutLogs.$inferSelect;
export type NewWorkoutLog = typeof workoutLogs.$inferInsert;

export type ProgressionHistory = typeof progressionHistory.$inferSelect;
export type NewProgressionHistory = typeof progressionHistory.$inferInsert;

export type UserStats = typeof userStats.$inferSelect;
export type NewUserStats = typeof userStats.$inferInsert;

// Export types for user profiles
export type UserProfile = typeof userProfiles.$inferSelect;
export type NewUserProfile = typeof userProfiles.$inferInsert;

// Export types for chat messages
export type ChatMessage = typeof chatMessages.$inferSelect;
export type NewChatMessage = typeof chatMessages.$inferInsert;

// Export table schemas and db instance
export { exercises, workoutLogs, progressionHistory, userStats, userProfiles, chatMessages };