require('dotenv').config();
const postgres = require('postgres');
const path = require('path');
const fs = require('fs');

async function createTables() {
  try {
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL environment variable is not set');
    }

    const sql = postgres(process.env.DATABASE_URL);
    
    // Check if we can connect
    const result = await sql`SELECT NOW()`;
    console.log('Connected to database:', result);

    // Create exercises table
    await sql`
      CREATE TABLE IF NOT EXISTS exercises (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        category TEXT,
        muscle_group TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log('Created exercises table');

    // Create user_profiles table
    await sql`
      CREATE TABLE IF NOT EXISTS user_profiles (
        id SERIAL PRIMARY KEY,
        user_id TEXT NOT NULL UNIQUE,
        name TEXT,
        email TEXT,
        height FLOAT,
        weight FLOAT,
        fitness_goals JSONB,
        fitness_level TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log('Created user_profiles table');

    // Create workout_logs table
    await sql`
      CREATE TABLE IF NOT EXISTS workout_logs (
        id SERIAL PRIMARY KEY,
        user_id TEXT NOT NULL,
        exercise_id INTEGER NOT NULL,
        sets INTEGER NOT NULL,
        reps INTEGER NOT NULL,
        weight FLOAT NOT NULL,
        rpe INTEGER,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (exercise_id) REFERENCES exercises(id)
      )
    `;
    console.log('Created workout_logs table');

    // Create progression_history table
    await sql`
      CREATE TABLE IF NOT EXISTS progression_history (
        id SERIAL PRIMARY KEY,
        user_id TEXT NOT NULL,
        exercise_id INTEGER NOT NULL,
        start_weight FLOAT,
        current_weight FLOAT,
        max_weight FLOAT,
        start_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (exercise_id) REFERENCES exercises(id)
      )
    `;
    console.log('Created progression_history table');

    // Create user_stats table
    await sql`
      CREATE TABLE IF NOT EXISTS user_stats (
        id SERIAL PRIMARY KEY,
        user_id TEXT NOT NULL UNIQUE,
        total_workouts INTEGER DEFAULT 0,
        total_volume INTEGER DEFAULT 0,
        strength_score INTEGER DEFAULT 0,
        recovery_score INTEGER DEFAULT 0,
        streak INTEGER DEFAULT 0,
        last_workout_date TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log('Created user_stats table');

    // Create workout_plans table
    await sql`
      CREATE TABLE IF NOT EXISTS workout_plans (
        id SERIAL PRIMARY KEY,
        user_id TEXT NOT NULL,
        name TEXT NOT NULL,
        description TEXT,
        exercises JSONB NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log('Created workout_plans table');

    console.log('All tables created successfully');
    await sql.end();
    process.exit(0);
  } catch (error) {
    console.error('Error creating tables:', error);
    process.exit(1);
  }
}

createTables();