import { drizzle } from 'drizzle-orm/vercel-postgres';
import { sql } from '@vercel/postgres';
import { exercises, workoutLogs, progressionHistory, userStats } from './schema';

// Initialize the database with explicit error handling
const createDb = () => {
  try {
    return drizzle(sql);
  } catch (error) {
    console.error('Failed to initialize database:', error);
    throw error;
  }
};

export const db = createDb();

// Test database connection
export async function testConnection() {
  try {
    const result = await sql`SELECT NOW()`;
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

// Export table schemas and db instance
export { exercises, workoutLogs, progressionHistory, userStats };