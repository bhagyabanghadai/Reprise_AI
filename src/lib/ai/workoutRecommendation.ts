import { Exercise } from '@/lib/db';
import { UserProfile } from '@/lib/db';

// Llama API integration for AI workout recommendations
const LLAMA_API_KEY = process.env.LLAMA_API_KEY;
// Using Nvidia's API endpoint for Llama model
const LLAMA_API_ENDPOINT = 'https://integrate.api.nvidia.com/v1/chat/completions';

export interface WorkoutPlan {
  day: string;
  focus: string;
  exercises: {
    name: string;
    exerciseId: number;
    sets: number;
    reps: number;
    weight: number;
    notes?: string;
  }[];
  completed: boolean;
}

export interface AIRecommendation {
  weeklyPlan: WorkoutPlan[];
  insights: string[];
  suggestions: string[];
}

/**
 * Generates a personalized workout plan using AI based on user profile and exercise history
 */
export async function generateWorkoutPlan(
  userId: string,
  userProfile: any, // Using any to avoid type conflicts
  recentWorkouts: any[] = [],
  availableExercises: Exercise[]
): Promise<AIRecommendation> {
  try {
    const userProfileStr = JSON.stringify(userProfile);
    const recentWorkoutsStr = JSON.stringify(recentWorkouts);
    const availableExercisesStr = JSON.stringify(availableExercises);

    const prompt = `
      As an AI fitness coach, create a personalized weekly workout plan for a user based on their profile and workout history.
      
      USER PROFILE:
      ${userProfileStr}
      
      RECENT WORKOUT HISTORY:
      ${recentWorkoutsStr}
      
      AVAILABLE EXERCISES:
      ${availableExercisesStr}
      
      Create a 7-day workout plan that includes:
      1. The specific focus for each day (e.g., "Upper Body Strength", "Active Recovery", etc.)
      2. The exact exercises to perform from the available exercise list
      3. Sets, reps, and suggested weights for each exercise
      4. Brief notes or form cues for each exercise
      5. 2-3 insights about their recent performance
      6. 2-3 suggestions for improvement
      
      For days that should be rest days, include appropriate recovery activities.
      Adjust exercise difficulty based on their fitness level and goals.
      Be specific with exercise selection, only use exercises from the AVAILABLE EXERCISES list.
      
      Format your response as valid JSON with the following structure:
      {
        "weeklyPlan": [
          {
            "day": "Monday",
            "focus": "Upper Body Strength",
            "exercises": [
              { "name": "Bench Press", "exerciseId": 1, "sets": 4, "reps": 8, "weight": 135, "notes": "Focus on form" },
              ...
            ],
            "completed": false
          },
          ...
        ],
        "insights": [
          "Your bench press has improved by 10% in the last month.",
          ...
        ],
        "suggestions": [
          "Try incorporating more back exercises to balance your pushing and pulling strength.",
          ...
        ]
      }
    `;

    const response = await fetch(LLAMA_API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${LLAMA_API_KEY}`
      },
      body: JSON.stringify({
        model: 'nvidia/llama-3.1-nemotron-70b-instruct',
        messages: [
          { role: 'system', content: 'You are an expert fitness coach who creates personalized workout plans. You always respond with valid JSON objects only.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 2000,
        response_format: { type: 'json_object' }
      })
    });

    if (!response.ok) {
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = JSON.parse(data.choices[0].message.content);

    return content as AIRecommendation;
  } catch (error) {
    console.error('Error generating workout plan:', error);
    
    // Return a basic backup plan in case of API failure
    return {
      weeklyPlan: generateBackupWeeklyPlan(availableExercises),
      insights: ['Unable to generate personalized insights due to API error.'],
      suggestions: ['Please try again later for personalized recommendations.']
    };
  }
}

/**
 * Analyzes a workout log and provides feedback
 */
export async function analyzeWorkout(
  workout: any,
  userProfile: any, // Using any to avoid type conflicts
  previousWorkouts: any[] = []
): Promise<string[]> {
  try {
    const workoutStr = JSON.stringify(workout);
    const userProfileStr = JSON.stringify(userProfile);
    const previousWorkoutsStr = JSON.stringify(previousWorkouts);

    const prompt = `
      As an AI fitness coach, analyze this completed workout and provide feedback.
      
      COMPLETED WORKOUT:
      ${workoutStr}
      
      USER PROFILE:
      ${userProfileStr}
      
      PREVIOUS WORKOUTS:
      ${previousWorkoutsStr}
      
      Provide 3-5 specific pieces of feedback about:
      1. Performance compared to previous similar workouts
      2. Form suggestions based on the weight/reps used
      3. Recovery recommendations
      4. Progression recommendations for next workout
      
      Format your response as a JSON array of feedback strings.
    `;

    const response = await fetch(LLAMA_API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${LLAMA_API_KEY}`
      },
      body: JSON.stringify({
        model: 'nvidia/llama-3.1-nemotron-70b-instruct',
        messages: [
          { role: 'system', content: 'You are an expert fitness coach who analyzes workouts and provides helpful feedback. You always respond with valid JSON arrays only.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 1000,
        response_format: { type: 'json_object' }
      })
    });

    if (!response.ok) {
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    return JSON.parse(data.choices[0].message.content);
  } catch (error) {
    console.error('Error analyzing workout:', error);
    return [
      'Great job on completing your workout!',
      'Focus on maintaining proper form with each exercise.',
      'Remember to stay hydrated and get adequate rest for optimal recovery.'
    ];
  }
}

/**
 * Generate a basic backup weekly plan in case the AI API fails
 */
export function generateBackupWeeklyPlan(availableExercises: Exercise[]): WorkoutPlan[] {
  // Create a map of exercises by muscle group for easier access
  const exercisesByMuscleGroup: Record<string, Exercise[]> = {};
  
  availableExercises.forEach(exercise => {
    if (!exercisesByMuscleGroup[exercise.muscleGroup]) {
      exercisesByMuscleGroup[exercise.muscleGroup] = [];
    }
    exercisesByMuscleGroup[exercise.muscleGroup].push(exercise);
  });

  // Generate a basic 7-day plan
  return [
    {
      day: 'Monday',
      focus: 'Upper Body Strength',
      exercises: getExercisesForMuscleGroups(['chest', 'back'], exercisesByMuscleGroup),
      completed: false
    },
    {
      day: 'Tuesday',
      focus: 'Lower Body Strength',
      exercises: getExercisesForMuscleGroups(['legs'], exercisesByMuscleGroup),
      completed: false
    },
    {
      day: 'Wednesday',
      focus: 'Active Recovery',
      exercises: [],
      completed: false
    },
    {
      day: 'Thursday',
      focus: 'Full Body Strength',
      exercises: getExercisesForMuscleGroups(['chest', 'back', 'legs'], exercisesByMuscleGroup),
      completed: false
    },
    {
      day: 'Friday',
      focus: 'Upper Body Hypertrophy',
      exercises: getExercisesForMuscleGroups(['chest', 'back'], exercisesByMuscleGroup),
      completed: false
    },
    {
      day: 'Saturday',
      focus: 'Lower Body Hypertrophy',
      exercises: getExercisesForMuscleGroups(['legs'], exercisesByMuscleGroup),
      completed: false
    },
    {
      day: 'Sunday',
      focus: 'Rest Day',
      exercises: [],
      completed: false
    }
  ];
}

/**
 * Helper function to get exercises for specified muscle groups
 */
function getExercisesForMuscleGroups(
  muscleGroups: string[],
  exercisesByMuscleGroup: Record<string, Exercise[]>
): { name: string; exerciseId: number; sets: number; reps: number; weight: number; notes?: string }[] {
  const exercises: { name: string; exerciseId: number; sets: number; reps: number; weight: number; notes?: string }[] = [];
  
  muscleGroups.forEach(muscleGroup => {
    const groupExercises = exercisesByMuscleGroup[muscleGroup] || [];
    
    // Take up to 2 exercises per muscle group
    groupExercises.slice(0, 2).forEach(exercise => {
      exercises.push({
        name: exercise.name,
        exerciseId: exercise.id,
        sets: 3,
        reps: 10,
        weight: 0, // Default weight to 0, user will need to adjust
        notes: `Focus on proper form for ${exercise.name}`
      });
    });
  });
  
  return exercises;
}