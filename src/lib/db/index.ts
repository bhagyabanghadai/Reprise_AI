import { drizzle } from 'drizzle-orm/vercel-postgres';
import { sql } from '@vercel/postgres';
import { exercises, workoutLogs, progressionHistory, userStats } from './schema';

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set");
}

// Initialize the database connection
export const db = drizzle(sql(DATABASE_URL));

// Create a function to test the database connection
export async function testConnection() {
  try {
    const result = await sql`SELECT NOW()`;
    return !!result;
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

// Export table schemas
export { exercises, workoutLogs, progressionHistory, userStats };