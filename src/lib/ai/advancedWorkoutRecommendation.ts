import { Exercise, UserProfile, WorkoutLog, ProgressionHistory } from '@/lib/db';
import { WorkoutPlan, AIRecommendation, generateBackupWeeklyPlan } from '@/lib/ai/workoutRecommendation';
import { eq, desc, and } from 'drizzle-orm';
import { db } from '@/lib/db';
import { workoutLogs, progressionHistory } from '@/lib/db/schema';

// Llama API integration for AI workout recommendations
const LLAMA_API_KEY = process.env.LLAMA_API_KEY;
const LLAMA_API_ENDPOINT = 'https://api.perplexity.ai/chat/completions';

interface UserStats {
  strengthScore: number;
  recoveryScore: number;
  consistencyScore: number;
  progressRate: number;
  stagnationRisk: number;
}

interface WorkoutParameters {
  volumeMultiplier: number; // Adjusts overall training volume
  intensityFactor: number;  // Adjusts weight recommendations
  frequencyAdjustment: number; // Adjusts recommended training frequency
  exerciseVariety: number;  // Controls exercise selection diversity
  progressionRate: number;  // Controls how aggressive progression should be
}

/**
 * Generate user statistics from workout history and progression data
 */
export async function generateUserStats(
  userId: string,
  workoutHistory: WorkoutLog[],
  progressionHistory: ProgressionHistory[]
): Promise<UserStats> {
  // Calculate strength score based on personal records and progression
  const strengthScore = calculateStrengthScore(workoutHistory, progressionHistory);
  
  // Calculate recovery score based on workout frequency and performance metrics
  const recoveryScore = calculateRecoveryScore(workoutHistory);
  
  // Calculate consistency score based on workout adherence
  const consistencyScore = calculateConsistencyScore(workoutHistory);
  
  // Calculate progression rate
  const progressRate = calculateProgressionRate(progressionHistory);
  
  // Calculate stagnation risk based on recent progression
  const stagnationRisk = calculateStagnationRisk(progressionHistory);
  
  return {
    strengthScore,
    recoveryScore,
    consistencyScore,
    progressRate,
    stagnationRisk
  };
}

/**
 * Calculate workout parameters based on user profile, stats, and history
 */
export function calculateWorkoutParameters(
  userProfile: UserProfile,
  userStats: UserStats,
  workoutHistory: WorkoutLog[]
): WorkoutParameters {
  // Base parameters adjusted by fitness level
  let volumeMultiplier = 1.0;
  let intensityFactor = 1.0;
  let frequencyAdjustment = 0;
  let exerciseVariety = 1.0;
  let progressionRate = 1.0;

  // Adjust based on fitness level
  switch (userProfile.fitnessLevel) {
    case 'beginner':
      volumeMultiplier = 0.8;
      intensityFactor = 0.7;
      exerciseVariety = 0.7; // Less variety for beginners
      progressionRate = 1.2; // Faster progression for beginners
      break;
    case 'intermediate':
      volumeMultiplier = 1.0;
      intensityFactor = 1.0;
      exerciseVariety = 1.0;
      progressionRate = 1.0;
      break;
    case 'advanced':
      volumeMultiplier = 1.2;
      intensityFactor = 1.1;
      exerciseVariety = 1.3; // More variety for advanced
      progressionRate = 0.8; // Slower progression for advanced
      break;
  }

  // Adjust based on fitness goals
  const fitnessGoalsObj = userProfile.fitnessGoals as any || {};
  const primaryGoal = fitnessGoalsObj.primary || 'general';
  
  if (primaryGoal === 'strength') {
    volumeMultiplier *= 0.9; // Lower volume
    intensityFactor *= 1.2; // Higher intensity
    exerciseVariety *= 0.8; // Less variety
  } else if (primaryGoal === 'muscle_building' || primaryGoal === 'hypertrophy') {
    volumeMultiplier *= 1.2; // Higher volume
    intensityFactor *= 0.9; // Moderate intensity
    exerciseVariety *= 1.0; // Moderate variety
  } else if (primaryGoal === 'endurance') {
    volumeMultiplier *= 1.3; // Higher volume
    intensityFactor *= 0.7; // Lower intensity
    exerciseVariety *= 1.1; // More variety
  }

  // Adjust based on recovery metrics
  if (userStats.recoveryScore < 60) {
    volumeMultiplier *= 0.8; // Reduce volume for poor recovery
    frequencyAdjustment -= 1; // Reduce frequency
  } else if (userStats.recoveryScore > 80) {
    volumeMultiplier *= 1.1; // Increase volume for good recovery
  }

  // Adjust for consistency
  if (userStats.consistencyScore < 60) {
    exerciseVariety *= 0.9; // Less variety for inconsistent training
    progressionRate *= 0.9; // Slower progression
  } else if (userStats.consistencyScore > 80) {
    progressionRate *= 1.1; // Faster progression for consistent training
  }

  // Adjust for stagnation risk
  if (userStats.stagnationRisk > 70) {
    exerciseVariety *= 1.3; // More variety to break plateaus
    intensityFactor *= 1.1; // Increase intensity
  }

  return {
    volumeMultiplier,
    intensityFactor,
    frequencyAdjustment,
    exerciseVariety,
    progressionRate
  };
}

/**
 * Generate a personalized workout plan using advanced AI and analytics
 */
export async function generateAdvancedWorkoutPlan(
  userId: string,
  userProfile: UserProfile,
  availableExercises: Exercise[],
  includeAIInsights: boolean = true
): Promise<AIRecommendation> {
  try {
    // Fetch recent workout history
    const workoutHistory = await fetchWorkoutHistory(userId);
    
    // Fetch progression history
    const progressionHistory = await fetchProgressionHistory(userId);
    
    // Generate user stats
    const stats = await generateUserStats(userId, workoutHistory, progressionHistory);
    
    // Calculate workout parameters
    const parameters = calculateWorkoutParameters(userProfile, stats, workoutHistory);
    
    // Create a tailored workout plan based on parameters
    const baseWorkoutPlan = createTailoredWorkoutPlan(
      userProfile, 
      availableExercises, 
      parameters,
      workoutHistory,
      progressionHistory
    );
    
    // If AI insights are requested and API key is available, enhance with AI
    if (includeAIInsights && LLAMA_API_KEY) {
      return await enhanceWorkoutPlanWithAI(
        userId, 
        userProfile, 
        baseWorkoutPlan,
        stats,
        parameters,
        workoutHistory,
        availableExercises
      );
    }
    
    // Otherwise return the base plan with generic insights
    return {
      weeklyPlan: baseWorkoutPlan,
      insights: generateGenericInsights(stats),
      suggestions: generateGenericSuggestions(parameters, stats)
    };
  } catch (error) {
    console.error('Error generating advanced workout plan:', error);
    
    // Return a basic backup plan in case of failure
    return {
      weeklyPlan: generateBackupWeeklyPlan(availableExercises),
      insights: ['Unable to generate personalized insights due to an error.'],
      suggestions: ['Consider consulting with a fitness professional for personalized advice.']
    };
  }
}

/**
 * Fetch recent workout history for a user
 */
async function fetchWorkoutHistory(userId: string): Promise<WorkoutLog[]> {
  try {
    // Fetch the last 30 days of workouts
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    // Get workoutLogs directly from raw query
    const workouts = await db.select().from(workoutLogs)
      .where(eq(workoutLogs.userId, userId))
      .orderBy(desc(workoutLogs.date))
      .limit(50);
    
    return workouts;
  } catch (error) {
    console.error('Error fetching workout history:', error);
    return [];
  }
}

/**
 * Fetch progression history for a user
 */
async function fetchProgressionHistory(userId: string): Promise<ProgressionHistory[]> {
  try {
    // Get progression history directly from raw query
    const history = await db.select().from(progressionHistory)
      .where(eq(progressionHistory.userId, userId))
      .orderBy(desc(progressionHistory.progressionDate))
      .limit(20);
    
    return history;
  } catch (error) {
    console.error('Error fetching progression history:', error);
    return [];
  }
}

/**
 * Calculate strength score based on workout and progression data
 */
function calculateStrengthScore(
  workoutHistory: WorkoutLog[],
  progressionHistory: ProgressionHistory[]
): number {
  // If no data is available, return a default score
  if (workoutHistory.length === 0) {
    return 50; // Default middle value
  }
  
  // Calculate average weight lifted normalized by exercise
  const exerciseWeights: Record<number, number[]> = {};
  
  workoutHistory.forEach(workout => {
    if (workout.exerciseId === null || workout.exerciseId === undefined) {
      return; // Skip records with null exerciseId
    }
    
    const exerciseId = workout.exerciseId as number;
    
    if (!exerciseWeights[exerciseId]) {
      exerciseWeights[exerciseId] = [];
    }
    
    // Convert weight to number if it's a string
    const weight = typeof workout.weight === 'string' 
      ? parseFloat(workout.weight) 
      : workout.weight || 0; // Use 0 as fallback if weight is null/undefined
      
    exerciseWeights[exerciseId].push(weight);
  });
  
  // Calculate average weight for each exercise
  const avgWeights = Object.values(exerciseWeights).map(weights => {
    return weights.reduce((sum, weight) => sum + weight, 0) / weights.length;
  });
  
  // Calculate overall average
  const overallAvg = avgWeights.length > 0
    ? avgWeights.reduce((sum, avg) => sum + avg, 0) / avgWeights.length
    : 0;
    
  // Factor in progression rate
  const progressionRate = progressionHistory.length > 0
    ? progressionHistory.reduce((sum, prog) => {
        const previousWeight = typeof prog.previousWeight === 'string'
          ? parseFloat(prog.previousWeight)
          : prog.previousWeight;
          
        const newWeight = typeof prog.newWeight === 'string'
          ? parseFloat(prog.newWeight)
          : prog.newWeight;
          
        return sum + ((newWeight - previousWeight) / previousWeight);
      }, 0) / progressionHistory.length
    : 0;
    
  // Combine factors to create strength score (0-100)
  let strengthScore = 50; // Base score
  
  // Adjust based on workout history volume
  strengthScore += Math.min(workoutHistory.length / 2, 25); // Up to 25 points for volume
  
  // Adjust based on progression rate (up to 25 points)
  strengthScore += Math.min(progressionRate * 100, 25);
  
  return Math.min(Math.max(strengthScore, 1), 100); // Ensure within 1-100 range
}

/**
 * Calculate recovery score based on workout frequency and performance
 */
function calculateRecoveryScore(workoutHistory: WorkoutLog[]): number {
  if (workoutHistory.length === 0) {
    return 70; // Default value
  }
  
  // Map workouts by date to find frequency
  const workoutsByDate: Record<string, WorkoutLog[]> = {};
  
  workoutHistory.forEach(workout => {
    // Ensure workout.date exists, otherwise use current date
    const workoutDate = workout.date ? new Date(workout.date) : new Date();
    const dateStr = workoutDate.toISOString().split('T')[0];
    
    if (!workoutsByDate[dateStr]) {
      workoutsByDate[dateStr] = [];
    }
    
    workoutsByDate[dateStr].push(workout);
  });
  
  // Calculate average days between workouts
  const dates = Object.keys(workoutsByDate).sort();
  let totalGaps = 0;
  
  for (let i = 1; i < dates.length; i++) {
    const prevDate = new Date(dates[i-1]);
    const currDate = new Date(dates[i]);
    const gap = (currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24);
    totalGaps += gap;
  }
  
  const avgGap = dates.length > 1 ? totalGaps / (dates.length - 1) : 1;
  
  // Calculate volume per workout day
  const avgVolume = Object.values(workoutsByDate).reduce((sum, dayWorkouts) => {
    const dayVolume = dayWorkouts.reduce((daySum, workout) => {
      return daySum + (workout.sets * workout.reps);
    }, 0);
    return sum + dayVolume;
  }, 0) / Object.keys(workoutsByDate).length;
  
  // Calculate recovery score
  let recoveryScore = 70; // Base score
  
  // Adjust for workout frequency
  if (avgGap < 1) {
    recoveryScore -= 20; // Very frequent workouts suggest poor recovery
  } else if (avgGap < 2) {
    recoveryScore -= 5; // Fairly frequent but generally ok
  } else if (avgGap > 4) {
    recoveryScore += 10; // Longer gaps suggest good recovery
  }
  
  // Adjust for workout volume
  if (avgVolume > 200) {
    recoveryScore -= 10; // High volume suggests needed recovery
  } else if (avgVolume < 100) {
    recoveryScore += 5; // Lower volume suggests adequate recovery
  }
  
  return Math.min(Math.max(recoveryScore, 1), 100); // Ensure within 1-100 range
}

/**
 * Calculate consistency score based on workout adherence
 */
function calculateConsistencyScore(workoutHistory: WorkoutLog[]): number {
  if (workoutHistory.length === 0) {
    return 50; // Default middle value
  }
  
  // Get workout dates
  const workoutDates = workoutHistory.map(workout => 
    new Date(workout.date || new Date()).toISOString().split('T')[0]
  );
  
  // Remove duplicates to get unique workout days
  const uniqueWorkoutDates = [...new Set(workoutDates)];
  
  // Determine date range (days between first and last workout)
  const sortedDates = uniqueWorkoutDates.sort();
  const firstDate = new Date(sortedDates[0]);
  const lastDate = new Date(sortedDates[sortedDates.length - 1]);
  
  const daysBetween = Math.max(
    1, // Ensure at least 1 day to avoid division by zero
    (lastDate.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24)
  );
  
  // Calculate workout frequency (workouts per week)
  const workoutsPerWeek = (uniqueWorkoutDates.length / daysBetween) * 7;
  
  // Calculate consistency score
  let consistencyScore = 50; // Base score
  
  // Adjust based on number of workouts
  consistencyScore += Math.min(uniqueWorkoutDates.length / 2, 25); // Up to 25 points for volume
  
  // Adjust based on workouts per week (ideally 3-5 per week)
  if (workoutsPerWeek < 2) {
    consistencyScore -= 20; // Low frequency
  } else if (workoutsPerWeek < 3) {
    consistencyScore -= 10; // Below average frequency
  } else if (workoutsPerWeek >= 3 && workoutsPerWeek <= 5) {
    consistencyScore += 20; // Ideal frequency
  } else if (workoutsPerWeek > 5) {
    consistencyScore += 10; // High frequency
  }
  
  return Math.min(Math.max(consistencyScore, 1), 100); // Ensure within 1-100 range
}

/**
 * Calculate progression rate based on progression history
 */
function calculateProgressionRate(progressionHistory: ProgressionHistory[]): number {
  if (progressionHistory.length === 0) {
    return 50; // Default middle value
  }
  
  // Calculate weighted average progression rate
  let totalWeightedRate = 0;
  let totalWeight = 0;
  
  for (let i = 0; i < progressionHistory.length; i++) {
    const prog = progressionHistory[i];
    
    const previousWeight = typeof prog.previousWeight === 'string'
      ? parseFloat(prog.previousWeight)
      : prog.previousWeight;
      
    const newWeight = typeof prog.newWeight === 'string'
      ? parseFloat(prog.newWeight)
      : prog.newWeight;
    
    const percentChange = ((newWeight - previousWeight) / previousWeight) * 100;
    
    // More recent progressions have higher weight
    const weight = progressionHistory.length - i;
    totalWeightedRate += percentChange * weight;
    totalWeight += weight;
  }
  
  const avgProgressionRate = totalWeight > 0 ? totalWeightedRate / totalWeight : 0;
  
  // Map progression rate to 1-100 scale
  // Consider 1% per workout as average (50 points)
  let progressRate = 50 + (avgProgressionRate * 10);
  
  return Math.min(Math.max(progressRate, 1), 100); // Ensure within 1-100 range
}

/**
 * Calculate stagnation risk based on recent progression
 */
function calculateStagnationRisk(progressionHistory: ProgressionHistory[]): number {
  if (progressionHistory.length < 3) {
    return 50; // Not enough data, default middle value
  }
  
  // Focus on the most recent 5 progression points (or fewer if not available)
  const recentHistory = progressionHistory.slice(0, 5);
  
  // Calculate recent progression rate
  let recentProgressions = 0;
  
  for (const prog of recentHistory) {
    const previousWeight = typeof prog.previousWeight === 'string'
      ? parseFloat(prog.previousWeight)
      : prog.previousWeight;
      
    const newWeight = typeof prog.newWeight === 'string'
      ? parseFloat(prog.newWeight)
      : prog.newWeight;
    
    // Count as progression if weight increased by at least 2%
    if ((newWeight - previousWeight) / previousWeight >= 0.02) {
      recentProgressions++;
    }
  }
  
  // Calculate stagnation risk (100 = high risk, 1 = low risk)
  const progressionRatio = recentProgressions / recentHistory.length;
  let stagnationRisk = 100 - (progressionRatio * 100);
  
  return Math.min(Math.max(stagnationRisk, 1), 100); // Ensure within 1-100 range
}

/**
 * Create a tailored workout plan based on user parameters
 */
function createTailoredWorkoutPlan(
  userProfile: UserProfile,
  availableExercises: Exercise[],
  parameters: WorkoutParameters,
  workoutHistory: WorkoutLog[],
  progressionHistory: ProgressionHistory[]
): WorkoutPlan[] {
  // Determine number of workout days per week based on profile and parameters
  // Get daysPerWeek from trainingHistory if it exists, otherwise use default
  const trainingHistoryObj = userProfile.trainingHistory as any || {};
  const daysPerWeek = typeof trainingHistoryObj.daysPerWeek === 'number'
    ? Math.min(Math.max(trainingHistoryObj.daysPerWeek + parameters.frequencyAdjustment, 2), 6)
    : 4; // Default to 4 days if not specified
  
  // Create exercise pool by muscle group
  const exercisesByMuscleGroup: Record<string, Exercise[]> = {};
  availableExercises.forEach(exercise => {
    if (!exercisesByMuscleGroup[exercise.muscleGroup]) {
      exercisesByMuscleGroup[exercise.muscleGroup] = [];
    }
    exercisesByMuscleGroup[exercise.muscleGroup].push(exercise);
  });
  
  // Determine split type based on days per week and preferences
  const splitType = determineSplitType(daysPerWeek, userProfile, parameters);
  
  // Generate training split
  const trainingSplit = generateTrainingSplit(splitType, daysPerWeek);
  
  // Create daily workout plans
  const weeklyPlan: WorkoutPlan[] = [];
  
  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  
  for (let i = 0; i < 7; i++) {
    const day = daysOfWeek[i];
    const muscleGroups = trainingSplit[i % trainingSplit.length];
    
    // If this is a rest day (no muscle groups)
    if (muscleGroups.length === 0) {
      weeklyPlan.push({
        day,
        focus: 'Rest Day',
        exercises: [],
        completed: false
      });
      continue;
    }
    
    // Select exercises for each muscle group
    const exercises = [];
    
    for (const muscleGroup of muscleGroups) {
      const groupExercises = exercisesByMuscleGroup[muscleGroup] || [];
      
      // Skip if no exercises for this muscle group
      if (groupExercises.length === 0) continue;
      
      // Determine how many exercises to include based on variety parameter
      const numExercises = Math.max(
        1,
        Math.round(2 * parameters.exerciseVariety * (muscleGroup === muscleGroups[0] ? 1.5 : 1))
      );
      
      // Select exercises, prioritizing ones not recently used
      const selectedExercises = selectExercisesForMuscleGroup(
        groupExercises,
        workoutHistory,
        numExercises
      );
      
      for (const exercise of selectedExercises) {
        // Determine sets, reps, and weight
        const { sets, reps, weight } = calculateSetsRepsWeight(
          exercise,
          userProfile,
          parameters,
          workoutHistory,
          progressionHistory
        );
        
        exercises.push({
          name: exercise.name,
          exerciseId: exercise.id,
          sets,
          reps,
          weight,
          notes: generateExerciseNote(exercise, userProfile, parameters)
        });
      }
    }
    
    // Add the day's workout to the weekly plan
    weeklyPlan.push({
      day,
      focus: generateWorkoutFocus(muscleGroups),
      exercises,
      completed: false
    });
  }
  
  return weeklyPlan;
}

/**
 * Determine the type of training split based on user profile and parameters
 */
function determineSplitType(
  daysPerWeek: number,
  userProfile: UserProfile,
  parameters: WorkoutParameters
): 'full_body' | 'upper_lower' | 'push_pull_legs' | 'body_part_split' {
  // For beginners and fewer days, favor full body or upper/lower
  if (userProfile.fitnessLevel === 'beginner' || daysPerWeek <= 3) {
    return daysPerWeek <= 2 ? 'full_body' : 'upper_lower';
  }
  
  // For intermediate with moderate days
  if (userProfile.fitnessLevel === 'intermediate' && daysPerWeek <= 4) {
    return 'upper_lower';
  }
  
  // For advanced with more days or high exercise variety
  if (userProfile.fitnessLevel === 'advanced' || parameters.exerciseVariety > 1.2 || daysPerWeek >= 5) {
    return 'push_pull_legs';
  }
  
  // Default to upper/lower for most cases
  return 'upper_lower';
}

/**
 * Generate a training split based on split type and days per week
 */
function generateTrainingSplit(
  splitType: 'full_body' | 'upper_lower' | 'push_pull_legs' | 'body_part_split',
  daysPerWeek: number
): string[][] {
  switch (splitType) {
    case 'full_body':
      // Full body workouts with rest days in between
      if (daysPerWeek === 1) {
        return [['chest', 'back', 'legs', 'shoulders', 'arms'], [], [], [], [], [], []];
      } else if (daysPerWeek === 2) {
        return [
          ['chest', 'back', 'legs', 'shoulders', 'arms'], 
          [], 
          [], 
          ['chest', 'back', 'legs', 'shoulders', 'arms'], 
          [], 
          [], 
          []
        ];
      } else if (daysPerWeek === 3) {
        return [
          ['chest', 'back', 'legs', 'shoulders', 'arms'], 
          [], 
          ['chest', 'back', 'legs', 'shoulders', 'arms'], 
          [], 
          ['chest', 'back', 'legs', 'shoulders', 'arms'], 
          [], 
          []
        ];
      }
      break;
      
    case 'upper_lower':
      // Upper/lower split
      if (daysPerWeek === 3) {
        return [
          ['chest', 'back', 'shoulders', 'arms'], // Upper
          ['legs'], // Lower
          [], // Rest
          ['chest', 'back', 'shoulders', 'arms'], // Upper
          [], // Rest
          [], // Rest
          [] // Rest
        ];
      } else if (daysPerWeek === 4) {
        return [
          ['chest', 'back', 'shoulders', 'arms'], // Upper
          ['legs'], // Lower
          [], // Rest
          ['chest', 'back', 'shoulders', 'arms'], // Upper
          ['legs'], // Lower
          [], // Rest
          [] // Rest
        ];
      }
      break;
      
    case 'push_pull_legs':
      // Push/Pull/Legs split
      if (daysPerWeek === 3) {
        return [
          ['chest', 'shoulders', 'triceps'], // Push
          ['back', 'biceps'], // Pull
          ['legs'], // Legs
          [], // Rest
          [], // Rest
          [], // Rest
          [] // Rest
        ];
      } else if (daysPerWeek === 5) {
        return [
          ['chest', 'shoulders', 'triceps'], // Push
          ['back', 'biceps'], // Pull
          ['legs'], // Legs
          [], // Rest
          ['chest', 'shoulders', 'triceps'], // Push
          ['back', 'biceps'], // Pull
          [] // Rest
        ];
      } else if (daysPerWeek === 6) {
        return [
          ['chest', 'shoulders', 'triceps'], // Push
          ['back', 'biceps'], // Pull
          ['legs'], // Legs
          ['chest', 'shoulders', 'triceps'], // Push
          ['back', 'biceps'], // Pull
          ['legs'], // Legs
          [] // Rest
        ];
      }
      break;
      
    case 'body_part_split':
      // Body part split for 5-6 days
      if (daysPerWeek === 5) {
        return [
          ['chest'], // Chest
          ['back'], // Back
          ['legs'], // Legs
          ['shoulders'], // Shoulders
          ['arms'], // Arms
          [], // Rest
          [] // Rest
        ];
      } else if (daysPerWeek === 6) {
        return [
          ['chest'], // Chest
          ['back'], // Back
          ['legs'], // Legs
          ['shoulders'], // Shoulders
          ['arms'], // Arms
          ['core', 'cardio'], // Core/Cardio
          [] // Rest
        ];
      }
      break;
  }
  
  // Default to full body 3x per week if no match
  return [
    ['chest', 'back', 'legs', 'shoulders', 'arms'], 
    [], 
    ['chest', 'back', 'legs', 'shoulders', 'arms'], 
    [], 
    ['chest', 'back', 'legs', 'shoulders', 'arms'], 
    [], 
    []
  ];
}

/**
 * Select exercises for a muscle group, prioritizing those not recently used
 */
function selectExercisesForMuscleGroup(
  exercises: Exercise[],
  workoutHistory: WorkoutLog[],
  numExercises: number
): Exercise[] {
  if (exercises.length === 0) return [];
  
  // If we need all exercises or more, return all
  if (numExercises >= exercises.length) return exercises;
  
  // Count how recently each exercise was used
  const exerciseRecency: Record<number, number> = {};
  
  // Initialize all exercises with max recency
  exercises.forEach(ex => {
    exerciseRecency[ex.id] = 999;
  });
  
  // Update recency based on workout history
  workoutHistory.forEach((workout, index) => {
    // Skip if exerciseId is null, undefined, or not in our exercise list
    if (workout.exerciseId && typeof workout.exerciseId === 'number' && 
        exerciseRecency[workout.exerciseId] !== undefined && 
        exerciseRecency[workout.exerciseId] > index) {
      exerciseRecency[workout.exerciseId] = index;
    }
  });
  
  // Sort exercises by recency (least recent first)
  const sortedExercises = [...exercises].sort((a, b) => {
    return exerciseRecency[a.id] - exerciseRecency[b.id];
  });
  
  // Return the required number of exercises
  return sortedExercises.slice(0, numExercises);
}

/**
 * Calculate sets, reps, and weight for an exercise based on parameters
 */
function calculateSetsRepsWeight(
  exercise: Exercise,
  userProfile: UserProfile,
  parameters: WorkoutParameters,
  workoutHistory: WorkoutLog[],
  progressionHistory: ProgressionHistory[]
): { sets: number; reps: number; weight: number } {
  // Find previous workout data for this exercise
  const exerciseHistory = workoutHistory.filter(w => w.exerciseId === exercise.id);
  
  // Base values depend on fitness goals
  const fitnessGoalsObj = userProfile.fitnessGoals as any || {};
  const primaryGoal = fitnessGoalsObj.primary || 'general';
  let baseSets = 3;
  let baseReps = 10;
  let baseWeight = 0;
  
  if (primaryGoal === 'strength') {
    baseSets = 4;
    baseReps = 6;
  } else if (primaryGoal === 'muscle_building' || primaryGoal === 'hypertrophy') {
    baseSets = 3;
    baseReps = 10;
  } else if (primaryGoal === 'endurance') {
    baseSets = 3;
    baseReps = 15;
  }
  
  // Adjust sets based on volume multiplier
  const sets = Math.round(baseSets * parameters.volumeMultiplier);
  
  // Adjust reps based on volume multiplier and intensity factor
  // More intensity = fewer reps
  const reps = Math.round(baseReps * parameters.volumeMultiplier / parameters.intensityFactor);
  
  // Determine weight based on exercise history
  if (exerciseHistory.length > 0) {
    // Get the most recent weight used
    const lastWorkout = exerciseHistory[0];
    const lastWeight = typeof lastWorkout.weight === 'string'
      ? parseFloat(lastWorkout.weight)
      : lastWorkout.weight;
    
    // Check progression history for this exercise
    const exerciseProgressions = progressionHistory.filter(p => p.exerciseId === exercise.id);
    
    // Apply progression rate if applicable
    if (exerciseProgressions.length > 0) {
      // Calculate baseline weight increase (1-5% based on progression rate)
      const progressionPercent = 0.01 + (parameters.progressionRate - 1) * 0.04;
      baseWeight = lastWeight * (1 + progressionPercent);
    } else {
      baseWeight = lastWeight;
    }
  }
  
  // Apply intensity factor to weight
  const weight = Math.round(baseWeight * parameters.intensityFactor);
  
  return { sets, reps, weight };
}

/**
 * Generate a descriptive note for an exercise
 */
function generateExerciseNote(
  exercise: Exercise,
  userProfile: UserProfile,
  parameters: WorkoutParameters
): string {
  // Base notes based on fitness level
  const baseNotes = {
    beginner: `Focus on proper form for ${exercise.name}`,
    intermediate: `Maintain good form and control with each rep`,
    advanced: `Focus on maximum mind-muscle connection`
  };
  
  const fitnessLevel = userProfile.fitnessLevel || 'beginner';
  let note = baseNotes[fitnessLevel as keyof typeof baseNotes] || baseNotes.beginner;
  
  // Add additional notes based on parameters
  if (parameters.intensityFactor > 1.1) {
    note += ". Push for intensity";
  } else if (parameters.volumeMultiplier > 1.1) {
    note += ". Focus on volume";
  }
  
  return note;
}

/**
 * Generate a focus description for a workout based on muscle groups
 */
function generateWorkoutFocus(muscleGroups: string[]): string {
  if (muscleGroups.length === 0) {
    return 'Rest Day';
  }
  
  // Special cases
  if (muscleGroups.includes('chest') && muscleGroups.includes('back') && muscleGroups.includes('legs')) {
    return 'Full Body Training';
  }
  
  if (muscleGroups.includes('chest') && muscleGroups.includes('shoulders') && muscleGroups.includes('triceps')) {
    return 'Push Day - Chest & Shoulders Focus';
  }
  
  if (muscleGroups.includes('back') && muscleGroups.includes('biceps')) {
    return 'Pull Day - Back & Biceps Focus';
  }
  
  if (muscleGroups.includes('legs')) {
    return 'Leg Day - Lower Body Focus';
  }
  
  if (muscleGroups.includes('chest') && muscleGroups.includes('back')) {
    return 'Upper Body Focus';
  }
  
  // General case - list the muscle groups
  const muscleGroupNames: Record<string, string> = {
    chest: 'Chest',
    back: 'Back',
    legs: 'Legs',
    shoulders: 'Shoulders',
    arms: 'Arms',
    biceps: 'Biceps',
    triceps: 'Triceps',
    core: 'Core',
    cardio: 'Cardio'
  };
  
  const muscleGroupsList = muscleGroups
    .map(group => muscleGroupNames[group] || group)
    .join(' & ');
  
  return `${muscleGroupsList} Focus`;
}

/**
 * Generate generic insights based on user stats
 */
function generateGenericInsights(stats: UserStats): string[] {
  const insights: string[] = [];
  
  if (stats.strengthScore > 80) {
    insights.push("Your strength metrics are excellent, showing consistent progress in your lifting capacity.");
  } else if (stats.strengthScore > 60) {
    insights.push("You're making good progress in strength development.");
  } else {
    insights.push("Focus on gradually increasing weights to build your strength foundation.");
  }
  
  if (stats.recoveryScore < 50) {
    insights.push("Your recovery patterns suggest you may benefit from additional rest between intense sessions.");
  } else if (stats.recoveryScore > 80) {
    insights.push("Your recovery capacity is excellent, allowing for more frequent high-intensity training.");
  }
  
  if (stats.consistencyScore < 50) {
    insights.push("Improving workout consistency would significantly accelerate your progress.");
  } else if (stats.consistencyScore > 80) {
    insights.push("Your consistent training habits are a major factor in your progress.");
  }
  
  if (stats.stagnationRisk > 70) {
    insights.push("Your training data indicates a potential plateau forming in some exercises.");
  }
  
  return insights.length > 0 ? insights : ["Continue with your current training approach to build momentum."];
}

/**
 * Generate generic suggestions based on workout parameters and stats
 */
function generateGenericSuggestions(parameters: WorkoutParameters, stats: UserStats): string[] {
  const suggestions: string[] = [];
  
  if (parameters.volumeMultiplier < 0.9) {
    suggestions.push("Gradually increase your training volume as recovery improves.");
  } else if (parameters.volumeMultiplier > 1.2) {
    suggestions.push("Your training volume is high - ensure adequate nutrition and recovery.");
  }
  
  if (parameters.intensityFactor > 1.1) {
    suggestions.push("Consider incorporating deload weeks to manage the high training intensity.");
  }
  
  if (parameters.exerciseVariety > 1.2) {
    suggestions.push("Your program includes high exercise variety to prevent plateaus and maintain engagement.");
  } else if (parameters.exerciseVariety < 0.8) {
    suggestions.push("Focus on mastering the core exercises before adding more variety.");
  }
  
  if (stats.stagnationRisk > 70) {
    suggestions.push("Consider changing rep ranges or adding techniques like drop sets to overcome plateaus.");
  }
  
  if (stats.recoveryScore < 60) {
    suggestions.push("Prioritize sleep quality and nutrition to improve recovery between sessions.");
  }
  
  return suggestions.length > 0 ? suggestions : ["Stay consistent with your current approach and track progress weekly."];
}

/**
 * Enhance a basic workout plan with AI-generated insights
 */
async function enhanceWorkoutPlanWithAI(
  userId: string,
  userProfile: UserProfile,
  baseWorkoutPlan: WorkoutPlan[],
  stats: UserStats,
  parameters: WorkoutParameters,
  workoutHistory: WorkoutLog[],
  availableExercises: Exercise[]
): Promise<AIRecommendation> {
  try {
    const baseWorkoutPlanStr = JSON.stringify(baseWorkoutPlan);
    const userProfileStr = JSON.stringify(userProfile);
    const statsStr = JSON.stringify(stats);
    const parametersStr = JSON.stringify(parameters);
    const workoutHistoryStr = JSON.stringify(workoutHistory.slice(0, 10));

    const prompt = `
      As an AI fitness coach, review and enhance this workout plan with personalized insights.
      
      USER PROFILE:
      ${userProfileStr}
      
      USER STATS:
      ${statsStr}
      
      WORKOUT PARAMETERS:
      ${parametersStr}
      
      RECENT WORKOUT HISTORY:
      ${workoutHistoryStr}
      
      BASE WORKOUT PLAN:
      ${baseWorkoutPlanStr}
      
      Based on this information, please:
      1. Provide 3-5 personalized insights about the user's training patterns, strengths, and areas for improvement
      2. Suggest 3-5 specific recommendations to optimize their training results
      3. Return the workout plan with any minor adjustments you recommend
      
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
        model: 'llama-3-sonar-large-32k-chat',
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
      console.error(`AI API error: ${response.status}`);
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = JSON.parse(data.choices[0].message.content);

    // Return enhanced plan
    return content as AIRecommendation;
  } catch (error) {
    console.error('Error enhancing workout plan with AI:', error);
    
    // Return the base plan with generic insights if AI enhancement fails
    return {
      weeklyPlan: baseWorkoutPlan,
      insights: generateGenericInsights(stats),
      suggestions: generateGenericSuggestions(parameters, stats)
    };
  }
}