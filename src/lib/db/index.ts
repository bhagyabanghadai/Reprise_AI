import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { sql } from 'drizzle-orm';
import { exercises, workoutLogs, progressionHistory, userStats, userProfiles } from './schema';

// Initialize the database with explicit error handling
const createDb = () => {
  try {
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL environment variable is not set');
    }
    
    const client = postgres(process.env.DATABASE_URL);
    return drizzle(client);
  } catch (error) {
    console.error('Failed to initialize database:', error);
    throw error;
  }
};

export const db = createDb();

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

// Export table schemas and db instance
export { exercises, workoutLogs, progressionHistory, userStats, userProfiles };