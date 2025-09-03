import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { userProfiles, workoutLogs } from '@/lib/db/schema';
import { eq, desc, count, avg } from 'drizzle-orm';

// Enhanced nutrition recommendations based on user goals and profile
const getNutritionRecommendations = (
  fitnessGoal: string, 
  userProfile: any,
  workoutStats: any
) => {
  const baseRecommendations = {
    dailyWater: "3-4 liters",
    mealFrequency: "4-6 meals per day",
    generalAdvice: [
      "Focus on whole, unprocessed foods",
      "Include a variety of colorful fruits and vegetables",
      "Stay hydrated throughout the day",
      "Time your nutrient intake around workouts",
      "Consider tracking your food intake for better awareness",
      "Aim for a balanced micronutrient profile with plenty of vitamins and minerals",
      "Consider periodic nutrition adjustments as your goals and performance evolve"
    ]
  };

  let specificRecommendations: any = {};
  
  // Calculate personalized values based on user profile if available
  let userWeight = userProfile?.weight ? parseFloat(userProfile.weight) : 70; // Default if not available
  let workoutFrequency = workoutStats?.workoutsPerWeek || 3; // Default if not available
  let activityLevel = 'moderate'; // Default
  
  // Determine activity level based on workout frequency
  if (workoutFrequency <= 2) activityLevel = 'light';
  else if (workoutFrequency >= 5) activityLevel = 'high';
  
  // Calculate personalized recommendations
  const calculateProtein = (multiplier: number) => `${(userWeight * multiplier).toFixed(1)}-${(userWeight * (multiplier + 0.4)).toFixed(1)}g`;
  const calculateCarbs = (multiplier: number) => `${(userWeight * multiplier).toFixed(1)}-${(userWeight * (multiplier + 2)).toFixed(1)}g`;
  const calculateFats = (multiplier: number) => `${(userWeight * multiplier).toFixed(1)}-${(userWeight * (multiplier + 0.4)).toFixed(1)}g`;

  // Recovery focus based on recent workout intensity
  const highIntensityRecovery = workoutStats?.avgRpe > 7.5;
  
  switch (fitnessGoal) {
    case 'strength':
    case 'muscle gain':
      specificRecommendations = {
        protein: calculateProtein(1.8),
        carbs: calculateCarbs(4.5),
        fats: calculateFats(0.8),
        calorieRecommendation: "300-500 calories above maintenance",
        keyNutrients: ["Protein", "Creatine", "Leucine", "Zinc", "Magnesium"],
        mealTiming: "Critical eating windows: immediate post-workout (30min) and before bed",
        supplementConsiderations: [
          "Whey or plant protein to meet daily protein goals",
          "Creatine monohydrate (3-5g daily)",
          "ZMA for recovery if training intensely",
          "Essential Amino Acids (EAAs) around workouts"
        ],
        sampleMeals: [
          "Breakfast: Protein oatmeal with banana and berries",
          "Post-Workout: Protein shake with banana and peanut butter",
          "Lunch: Grilled chicken with sweet potatoes and vegetables",
          "Dinner: Salmon with brown rice and broccoli",
          "Evening Snack: Cottage cheese with nuts and honey"
        ],
        recoveryFocus: highIntensityRecovery ? [
          "Prioritize post-workout carb replenishment",
          "Consider tart cherry juice for inflammation",
          "Increase magnesium intake for muscle relaxation"
        ] : [
          "Standard recovery protocols are sufficient",
          "Focus on consistent protein timing throughout the day"
        ]
      };
      break;
    
    case 'weight loss':
      specificRecommendations = {
        protein: calculateProtein(2.0),
        carbs: calculateCarbs(2.0),
        fats: calculateFats(0.8),
        calorieRecommendation: "300-500 calories below maintenance",
        keyNutrients: ["Fiber", "Protein", "Water", "Calcium", "Vitamin D"],
        mealTiming: "Consider intermittent fasting protocols like 16:8 or occasional carb cycling",
        supplementConsiderations: [
          "Protein supplements to maintain muscle mass",
          "Fiber supplements if struggling to meet fiber goals",
          "Green tea extract (if tolerated) for mild metabolic support",
          "Ensure adequate vitamin D and calcium" 
        ],
        sampleMeals: [
          "Breakfast: Greek yogurt with berries and almonds",
          "Lunch: Large salad with grilled chicken and olive oil dressing",
          "Dinner: Lean ground turkey with vegetables and small portion of quinoa",
          "Snack: Protein shake with cinnamon and ice",
          "Hunger Management: Cucumber slices with apple cider vinegar"
        ],
        satietyStrategies: [
          "Start meals with a protein source and vegetables",
          "Include 25-35g of fiber daily for satiety",
          "Stay well hydrated between meals",
          "Use volume eating strategies with low-calorie vegetables"
        ]
      };
      break;
    
    case 'endurance':
      specificRecommendations = {
        protein: calculateProtein(1.4),
        carbs: calculateCarbs(6.0),
        fats: calculateFats(1.0),
        calorieRecommendation: "Match or slightly exceed maintenance depending on training volume",
        keyNutrients: ["Complex Carbs", "Electrolytes", "Iron", "B Vitamins", "Antioxidants"],
        mealTiming: "Carb timing is critical - focus on pre, during, and post-exercise windows",
        supplementConsiderations: [
          "Electrolyte supplements for longer sessions",
          "Beta-alanine for buffering capacity",
          "Beetroot juice/nitrates for improved efficiency",
          "Iron supplements if blood work indicates need"
        ],
        sampleMeals: [
          "Breakfast: Whole grain toast with eggs and avocado",
          "Pre-Workout: Banana with honey or dates",
          "During Workout: Sports drink with electrolytes for sessions over 60 minutes",
          "Post-Workout: Recovery smoothie with 3:1 carbs:protein ratio",
          "Dinner: Lean protein with plenty of vegetables and whole grains"
        ],
        periodicNutrition: {
          preRace: "Carb load 24-48 hours before major events (7-10g/kg bodyweight)",
          recovery: "Focus on rapid glycogen replenishment within 30 minutes of finishing"
        }
      };
      break;
      
    case 'overall fitness':
    default:
      specificRecommendations = {
        protein: calculateProtein(1.2),
        carbs: calculateCarbs(3.0),
        fats: calculateFats(0.8),
        calorieRecommendation: "Around maintenance level with adjustments based on specific goals",
        keyNutrients: ["Complete Proteins", "Complex Carbs", "Healthy Fats", "Vitamin C", "Calcium"],
        mealTiming: "Regular meal timing, 3-4 hours apart for energy balance",
        supplementConsiderations: [
          "Multivitamin for nutritional insurance",
          "Protein supplement if struggling to meet protein goals",
          "Omega-3 fatty acids for overall health"
        ],
        sampleMeals: [
          "Breakfast: Smoothie with protein, banana, spinach, and berries",
          "Lunch: Quinoa bowl with roasted vegetables and chicken",
          "Dinner: Baked fish with sweet potato and green beans",
          "Snack: Greek yogurt with nuts and fruit",
          "Flexible option: Balanced meal prep containers with protein, vegetables, and whole grains"
        ],
        flexibility: "Focus on the 80/20 principle - 80% nutrient-dense foods, 20% flexibility"
      };
      break;
  }

  // Add activity level adjustment to recommendations
  specificRecommendations.activityAdjustments = {
    level: activityLevel,
    calorieAdjustment: activityLevel === 'light' ? "Reduce daily calories by ~10%" :
                      activityLevel === 'high' ? "Increase daily calories by ~10-15%" :
                      "Standard calorie recommendations apply",
    hydrationAdjustment: activityLevel === 'high' ? "Increase water intake to 4-5 liters and consider electrolyte supplementation" :
                        "Standard hydration recommendations apply"
  };

  return {
    ...baseRecommendations,
    ...specificRecommendations,
    fitnessGoal,
    personalized: {
      forWeightKg: userWeight,
      workoutFrequency: workoutFrequency,
      activityLevel: activityLevel,
      lastUpdated: new Date().toISOString()
    }
  };
};

// Add a POST endpoint to save nutrition plans generated by the AI chat
export async function POST(request: Request) {
  try {
    const { userId, plan } = await request.json();
    
    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
    }
    
    // For now, we'll just log the received plan
    console.log('Received nutrition plan from AI for user:', userId);
    console.log('Plan details:', plan);
    
    // Here we'd typically store the plan in the database
    // For now, we'll return success since the InteractiveAITrainer already
    // shows the plan on the frontend
    
    return NextResponse.json({
      success: true,
      message: 'Nutrition plan saved successfully'
    });
    
  } catch (error: any) {
    console.error('Error saving nutrition plan:', error);
    return NextResponse.json(
      { 
        error: 'Failed to save nutrition plan',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    // Extract user ID from query parameters
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || "user-123";

    // Check if database is available
    if (!process.env.DATABASE_URL) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 503 }
      );
    }

    // Get the user's fitness goal from their profile
    const userProfile = await db
      .select()
      .from(userProfiles)
      .where(eq(userProfiles.userId, userId));

    // Default goal if user profile doesn't exist
    let fitnessGoal = 'overall fitness';
    let profile = null;

    if (userProfile.length > 0) {
      profile = userProfile[0];
      
      try {
        // Parse fitnessGoals if it's a JSON string or object
        let goals: any = profile.fitnessGoals;
        if (typeof goals === 'string') {
          goals = JSON.parse(goals);
        }

        // Check various goal formats to extract the primary goal
        if (goals && typeof goals === 'object') {
          // Format 1: {primary: 'Goal Name', secondary: [...]}
          if (goals.primary) {
            fitnessGoal = String(goals.primary).toLowerCase();
          }
          // Format 2: ['Primary Goal', 'Secondary Goal', ...]
          else if (Array.isArray(goals) && goals.length > 0) {
            fitnessGoal = goals[0].toLowerCase();
          }
          
          // Map UI goal names to API goal names
          const goalMapping: { [key: string]: string } = {
            'build muscle': 'muscle gain',
            'gain muscle': 'muscle gain',
            'lose fat': 'weight loss',
            'lose weight': 'weight loss',
            'increase strength': 'strength',
            'get stronger': 'strength',
            'improve endurance': 'endurance',
            'improve cardio': 'endurance',
            'general fitness': 'overall fitness',
            'stay healthy': 'overall fitness'
          };

          fitnessGoal = goalMapping[fitnessGoal.toLowerCase()] || fitnessGoal;
        }
      } catch (error) {
        console.error('Error parsing fitness goals:', error);
        // Fallback to default
        fitnessGoal = 'overall fitness';
      }
    }
    
    // Get workout stats for more personalized recommendations
    const workoutStats = await getWorkoutStats(userId);
    
    console.log('Using fitness goal for nutrition plan:', fitnessGoal);
    console.log('Workout stats for personalization:', workoutStats);

    // Get personalized nutrition recommendations based on the user's goal and stats
    const nutritionPlan = getNutritionRecommendations(fitnessGoal, profile, workoutStats);

    return NextResponse.json({
      nutritionPlan,
      success: true
    });
  } catch (error: any) {
    console.error('Error generating nutrition plan:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate nutrition plan',
        details: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}

// Helper function to get workout statistics for a user
async function getWorkoutStats(userId: string) {
  try {
    // Count total workouts in the past 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentWorkouts = await db
      .select({
        count: count(),
        avgRpe: avg(workoutLogs.rpe)
      })
      .from(workoutLogs)
      .where(eq(workoutLogs.userId, userId));
    
    // Get most recent workouts to analyze frequency
    const latestWorkouts = await db
      .select()
      .from(workoutLogs)
      .where(eq(workoutLogs.userId, userId))
      .orderBy(desc(workoutLogs.date))
      .limit(20);
    
    // Calculate workout frequency (workouts per week)
    const workoutsPerWeek = latestWorkouts.length > 0 
      ? (latestWorkouts.length / 4) // Estimate based on recent workouts
      : 3; // Default if no data
      
    return {
      totalWorkouts: recentWorkouts[0]?.count || 0,
      avgRpe: recentWorkouts[0]?.avgRpe || 7,
      workoutsPerWeek,
      hasWorkoutData: latestWorkouts.length > 0
    };
  } catch (error) {
    console.error('Error getting workout stats:', error);
    return {
      totalWorkouts: 0,
      avgRpe: 7, // Default RPE
      workoutsPerWeek: 3, // Default frequency
      hasWorkoutData: false
    };
  }
}