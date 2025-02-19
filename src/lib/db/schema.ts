import { serial, text, timestamp, integer, decimal, pgTable, boolean, jsonb } from 'drizzle-orm/pg-core';

export const exercises = pgTable('exercises', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  category: text('category').notNull(), // e.g., 'strength', 'cardio'
  muscleGroup: text('muscle_group').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const userProfiles = pgTable('user_profiles', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull(),
  age: integer('age'),
  weight: decimal('weight'), // in kg
  height: decimal('height'), // in cm
  fitnessLevel: text('fitness_level'), // beginner, intermediate, advanced
  fitnessGoals: jsonb('fitness_goals'), // array of goals
  workoutPreference: jsonb('workout_preference'), // preferred days, times, etc
  equipment: jsonb('available_equipment'), // array of available equipment
  medicalConditions: jsonb('medical_conditions'), // any health considerations
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const workoutLogs = pgTable('workout_logs', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull(),
  exerciseId: integer('exercise_id').references(() => exercises.id),
  sets: integer('sets').notNull(),
  reps: integer('reps').notNull(),
  weight: decimal('weight').notNull(), // in kg/lbs
  rpe: integer('rpe'), // Rate of Perceived Exertion (1-10)
  notes: text('notes'),
  date: timestamp('date').defaultNow(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const progressionHistory = pgTable('progression_history', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull(),
  exerciseId: integer('exercise_id').references(() => exercises.id),
  previousWeight: decimal('previous_weight').notNull(),
  newWeight: decimal('new_weight').notNull(),
  previousReps: integer('previous_reps').notNull(),
  newReps: integer('new_reps').notNull(),
  progressionDate: timestamp('progression_date').defaultNow(),
  aiRecommendation: text('ai_recommendation'),
  applied: boolean('applied').default(false),
});

export const workoutPlans = pgTable('workout_plans', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull(),
  planDate: timestamp('plan_date').notNull(),
  exercises: jsonb('exercises').notNull(), // Array of exercise recommendations
  focus: text('focus'), // e.g., 'strength', 'hypertrophy', 'endurance'
  aiNotes: text('ai_notes'), // AI-generated notes about the workout
  completed: boolean('completed').default(false),
  createdAt: timestamp('created_at').defaultNow(),
});

export const userStats = pgTable('user_stats', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull(),
  exerciseId: integer('exercise_id').references(() => exercises.id),
  personalBest: decimal('personal_best').notNull(),
  lastWeight: decimal('last_weight').notNull(),
  avgRpe: decimal('avg_rpe'),
  totalSets: integer('total_sets').default(0),
  totalReps: integer('total_reps').default(0),
  updatedAt: timestamp('updated_at').defaultNow(),
});