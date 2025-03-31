import { NextResponse } from 'next/server';
import { db, testConnection } from '@/lib/db';
import { exercises } from '@/lib/db/schema';
import { asc } from 'drizzle-orm';

export async function GET() {
  try {
    // First test the database connection
    const isConnected = await testConnection();
    if (!isConnected) {
      throw new Error('Database connection failed');
    }

    // Initialize exercises table if needed
    let result = await db.select().from(exercises).orderBy(asc(exercises.name));

    // Add some default exercises if none exist
    if (result.length === 0) {
      const defaultExercises = [
        // CHEST EXERCISES
        { name: 'Bench Press', description: 'Barbell bench press for chest development', category: 'strength', muscleGroup: 'chest' },
        { name: 'Incline Bench Press', description: 'Targets upper chest muscles', category: 'strength', muscleGroup: 'chest' },
        { name: 'Decline Bench Press', description: 'Targets lower chest muscles', category: 'strength', muscleGroup: 'chest' },
        { name: 'Dumbbell Flyes', description: 'Isolation exercise for chest', category: 'isolation', muscleGroup: 'chest' },
        { name: 'Cable Crossover', description: 'Cable exercise for chest definition', category: 'isolation', muscleGroup: 'chest' },
        { name: 'Push-ups', description: 'Bodyweight exercise for chest, shoulders, and triceps', category: 'bodyweight', muscleGroup: 'chest' },
        { name: 'Dumbbell Bench Press', description: 'Dumbbell version of bench press for better range of motion', category: 'strength', muscleGroup: 'chest' },
        { name: 'Machine Chest Press', description: 'Machine-based chest exercise', category: 'machine', muscleGroup: 'chest' },
        
        // BACK EXERCISES
        { name: 'Deadlift', description: 'Barbell deadlift for posterior chain development', category: 'strength', muscleGroup: 'back' },
        { name: 'Pull-up', description: 'Body weight pull-up for back and biceps', category: 'bodyweight', muscleGroup: 'back' },
        { name: 'Bent Over Row', description: 'Barbell row for mid-back strength', category: 'strength', muscleGroup: 'back' },
        { name: 'Lat Pulldown', description: 'Cable exercise for latissimus dorsi', category: 'machine', muscleGroup: 'back' },
        { name: 'T-Bar Row', description: 'Targets mid-back muscles', category: 'strength', muscleGroup: 'back' },
        { name: 'Seated Cable Row', description: 'Cable exercise for back thickness', category: 'machine', muscleGroup: 'back' },
        { name: 'Single-Arm Dumbbell Row', description: 'Unilateral back exercise', category: 'strength', muscleGroup: 'back' },
        { name: 'Chin-up', description: 'Bodyweight exercise with underhand grip', category: 'bodyweight', muscleGroup: 'back' },
        { name: 'Hyperextension', description: 'Lower back exercise', category: 'isolation', muscleGroup: 'back' },
        
        // LEGS EXERCISES
        { name: 'Squat', description: 'Barbell squat for lower body strength', category: 'strength', muscleGroup: 'legs' },
        { name: 'Leg Press', description: 'Machine leg press for quad development', category: 'machine', muscleGroup: 'legs' },
        { name: 'Romanian Deadlift', description: 'Barbell Romanian deadlift for hamstring strength', category: 'strength', muscleGroup: 'legs' },
        { name: 'Lunges', description: 'Walking or stationary lunges for legs', category: 'strength', muscleGroup: 'legs' },
        { name: 'Leg Extension', description: 'Isolation exercise for quadriceps', category: 'isolation', muscleGroup: 'legs' },
        { name: 'Leg Curl', description: 'Isolation exercise for hamstrings', category: 'isolation', muscleGroup: 'legs' },
        { name: 'Calf Raise', description: 'Standing or seated calf raises', category: 'isolation', muscleGroup: 'legs' },
        { name: 'Hack Squat', description: 'Machine-based squat variation', category: 'machine', muscleGroup: 'legs' },
        { name: 'Bulgarian Split Squat', description: 'Unilateral leg exercise', category: 'strength', muscleGroup: 'legs' },
        { name: 'Glute Bridge', description: 'Exercise focusing on glute activation', category: 'isolation', muscleGroup: 'legs' },
        { name: 'Box Jumps', description: 'Plyometric box jumps for power', category: 'functional', muscleGroup: 'legs' },
        
        // SHOULDERS EXERCISES
        { name: 'Overhead Press', description: 'Barbell overhead press for shoulder strength', category: 'strength', muscleGroup: 'shoulders' },
        { name: 'Lateral Raise', description: 'Dumbbell lateral raise for shoulder width', category: 'isolation', muscleGroup: 'shoulders' },
        { name: 'Front Raise', description: 'Dumbbell front raise for anterior deltoids', category: 'isolation', muscleGroup: 'shoulders' },
        { name: 'Rear Delt Fly', description: 'Targets posterior deltoids', category: 'isolation', muscleGroup: 'shoulders' },
        { name: 'Upright Row', description: 'Barbell or dumbbell upright row', category: 'strength', muscleGroup: 'shoulders' },
        { name: 'Arnold Press', description: 'Rotational dumbbell press', category: 'strength', muscleGroup: 'shoulders' },
        { name: 'Face Pull', description: 'Cable exercise for rear deltoids and rotator cuff', category: 'isolation', muscleGroup: 'shoulders' },
        { name: 'Shrugs', description: 'Trapezius exercise with barbells or dumbbells', category: 'isolation', muscleGroup: 'shoulders' },
        
        // ARMS EXERCISES
        { name: 'Bicep Curl', description: 'Dumbbell bicep curl for arm development', category: 'isolation', muscleGroup: 'arms' },
        { name: 'Tricep Extension', description: 'Cable tricep extension for arm definition', category: 'isolation', muscleGroup: 'arms' },
        { name: 'Hammer Curl', description: 'Neutral grip bicep curl', category: 'isolation', muscleGroup: 'arms' },
        { name: 'Skull Crusher', description: 'Lying tricep extension', category: 'isolation', muscleGroup: 'arms' },
        { name: 'Preacher Curl', description: 'Supported bicep curl variation', category: 'isolation', muscleGroup: 'arms' },
        { name: 'Dips', description: 'Bodyweight exercise for triceps and chest', category: 'bodyweight', muscleGroup: 'arms' },
        { name: 'Concentration Curl', description: 'Seated isolation bicep exercise', category: 'isolation', muscleGroup: 'arms' },
        { name: 'Tricep Pushdown', description: 'Cable exercise for triceps', category: 'isolation', muscleGroup: 'arms' },
        { name: 'EZ Bar Curl', description: 'Bicep curl with EZ curl bar', category: 'isolation', muscleGroup: 'arms' },
        { name: 'Overhead Tricep Extension', description: 'Isolation exercise for triceps', category: 'isolation', muscleGroup: 'arms' },
        
        // CORE EXERCISES
        { name: 'Plank', description: 'Isometric core strength exercise', category: 'bodyweight', muscleGroup: 'core' },
        { name: 'Crunches', description: 'Basic abdominal exercise', category: 'bodyweight', muscleGroup: 'core' },
        { name: 'Russian Twist', description: 'Rotational core exercise', category: 'bodyweight', muscleGroup: 'core' },
        { name: 'Hanging Leg Raise', description: 'Advanced core exercise', category: 'bodyweight', muscleGroup: 'core' },
        { name: 'Ab Wheel Rollout', description: 'Equipment-based core exercise', category: 'isolation', muscleGroup: 'core' },
        { name: 'Mountain Climber', description: 'Dynamic core and cardio exercise', category: 'bodyweight', muscleGroup: 'core' },
        { name: 'Side Plank', description: 'Lateral core stabilization', category: 'bodyweight', muscleGroup: 'core' },
        { name: 'Cable Woodchopper', description: 'Rotational power exercise', category: 'functional', muscleGroup: 'core' },
        { name: 'Hollow Hold', description: 'Gymnastics-based core exercise', category: 'bodyweight', muscleGroup: 'core' },
        
        // CARDIO & FUNCTIONAL EXERCISES
        { name: 'Running', description: 'Outdoor or treadmill running', category: 'cardio', muscleGroup: 'fullbody' },
        { name: 'Cycling', description: 'Outdoor or stationary cycling', category: 'cardio', muscleGroup: 'legs' },
        { name: 'Rowing', description: 'Rowing machine workout', category: 'cardio', muscleGroup: 'fullbody' },
        { name: 'Jump Rope', description: 'Cardiovascular and coordination exercise', category: 'cardio', muscleGroup: 'fullbody' },
        { name: 'Burpees', description: 'Full-body conditioning exercise', category: 'functional', muscleGroup: 'fullbody' },
        { name: 'Kettlebell Swing', description: 'Explosive kettlebell movement', category: 'functional', muscleGroup: 'fullbody' },
        { name: 'Battle Ropes', description: 'High-intensity rope training', category: 'functional', muscleGroup: 'fullbody' },
        { name: 'Elliptical', description: 'Low-impact cardio machine', category: 'cardio', muscleGroup: 'fullbody' },
        { name: 'Stair Climber', description: 'Cardio machine for lower body endurance', category: 'cardio', muscleGroup: 'legs' },
        { name: 'HIIT', description: 'High-Intensity Interval Training', category: 'cardio', muscleGroup: 'fullbody' },
        { name: 'Medicine Ball Slam', description: 'Explosive full-body exercise', category: 'functional', muscleGroup: 'fullbody' },
        { name: 'Sled Push/Pull', description: 'High-resistance functional exercise', category: 'functional', muscleGroup: 'fullbody' }
      ];

      for (const exercise of defaultExercises) {
        await db.insert(exercises).values(exercise);
      }

      // Fetch again after inserting defaults
      result = await db.select().from(exercises).orderBy(asc(exercises.name));
    }

    console.log('Successfully fetched exercises:', result);

    return NextResponse.json({ 
      exercises: result,
      success: true 
    });
  } catch (error: any) {
    console.error('Failed to fetch exercises:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch exercises',
        details: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}