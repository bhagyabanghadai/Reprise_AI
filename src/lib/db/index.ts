import { drizzle } from 'drizzle-orm/vercel-postgres';
import { sql } from '@vercel/postgres';
import { exercises, workoutLogs, progressionHistory, userStats } from './schema';

export const db = drizzle(sql);

export type Exercise = typeof exercises.$inferSelect;
export type NewExercise = typeof exercises.$inferInsert;

export type WorkoutLog = typeof workoutLogs.$inferSelect;
export type NewWorkoutLog = typeof workoutLogs.$inferInsert;

export type ProgressionHistory = typeof progressionHistory.$inferSelect;
export type NewProgressionHistory = typeof progressionHistory.$inferInsert;

export type UserStats = typeof userStats.$inferSelect;
export type NewUserStats = typeof userStats.$inferInsert;

export { exercises, workoutLogs, progressionHistory, userStats };
