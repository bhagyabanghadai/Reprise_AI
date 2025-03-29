import { NextResponse } from 'next/server';
import { db, userProfiles } from '@/lib/db';
import { eq } from 'drizzle-orm';

// Simple nutrition recommendations based on user goals
const getNutritionRecommendations = (fitnessGoal: string) => {
  const baseRecommendations = {
    dailyWater: "3-4 liters",
    mealFrequency: "4-6 meals per day",
    generalAdvice: [
      "Focus on whole, unprocessed foods",
      "Include a variety of colorful fruits and vegetables",
      "Stay hydrated throughout the day",
      "Time your nutrient intake around workouts",
      "Consider tracking your food intake for better awareness",
    ]
  };

  let specificRecommendations;

  switch (fitnessGoal) {
    case 'strength':
    case 'muscle gain':
      specificRecommendations = {
        protein: "1.6-2.2g per kg of bodyweight",
        carbs: "4-7g per kg of bodyweight",
        fats: "0.5-1.5g per kg of bodyweight",
        calorieSurplus: "300-500 calories above maintenance",
        keyNutrients: ["Protein", "Creatine", "Leucine", "Zinc", "Magnesium"],
        mealTiming: "Ensure post-workout protein intake within 30 minutes",
        sampleMeals: [
          "Breakfast: Protein oatmeal with banana and berries",
          "Post-Workout: Protein shake with banana and peanut butter",
          "Lunch: Grilled chicken with sweet potatoes and vegetables",
          "Dinner: Salmon with brown rice and broccoli",
        ]
      };
      break;
    
    case 'weight loss':
      specificRecommendations = {
        protein: "1.8-2.2g per kg of bodyweight",
        carbs: "2-4g per kg of bodyweight",
        fats: "0.8-1.2g per kg of bodyweight",
        calorieDeficit: "300-500 calories below maintenance",
        keyNutrients: ["Fiber", "Protein", "Water", "Calcium", "Vitamin D"],
        mealTiming: "Consider intermittent fasting protocols like 16:8",
        sampleMeals: [
          "Breakfast: Greek yogurt with berries and almonds",
          "Lunch: Large salad with grilled chicken and olive oil dressing",
          "Dinner: Lean ground turkey with vegetables and small portion of quinoa",
          "Snack: Protein shake with cinnamon and ice",
        ]
      };
      break;
    
    case 'endurance':
      specificRecommendations = {
        protein: "1.4-1.6g per kg of bodyweight",
        carbs: "5-10g per kg of bodyweight",
        fats: "1-1.5g per kg of bodyweight",
        calories: "Match or slightly exceed maintenance",
        keyNutrients: ["Complex Carbs", "Electrolytes", "Iron", "B Vitamins", "Antioxidants"],
        mealTiming: "Carb-loading before endurance activities",
        sampleMeals: [
          "Breakfast: Whole grain toast with eggs and avocado",
          "Pre-Workout: Banana with honey",
          "Post-Workout: Recovery smoothie with carbs and protein",
          "Dinner: Lean protein with plenty of vegetables and whole grains",
        ]
      };
      break;
      
    case 'overall fitness':
    default:
      specificRecommendations = {
        protein: "1.2-1.6g per kg of bodyweight",
        carbs: "3-5g per kg of bodyweight",
        fats: "0.8-1.2g per kg of bodyweight",
        calories: "Around maintenance level",
        keyNutrients: ["Complete Proteins", "Complex Carbs", "Healthy Fats", "Vitamin C", "Calcium"],
        mealTiming: "Regular meal timing, 3-4 hours apart",
        sampleMeals: [
          "Breakfast: Smoothie with protein, banana, spinach, and berries",
          "Lunch: Quinoa bowl with roasted vegetables and chicken",
          "Dinner: Baked fish with sweet potato and green beans",
          "Snack: Greek yogurt with nuts and fruit",
        ]
      };
      break;
  }

  return {
    ...baseRecommendations,
    ...specificRecommendations,
    fitnessGoal
  };
};

export async function GET(request: Request) {
  try {
    // In a real app, get the user ID from the session
    // For now, we'll use a mock user ID for testing
    const userId = "user-123";

    // Get the user's fitness goal from their profile
    const userProfile = await db
      .select()
      .from(userProfiles)
      .where(eq(userProfiles.userId, userId));

    let fitnessGoal = 'overall fitness'; // Default

    if (userProfile.length > 0 && userProfile[0].fitnessGoals) {
      try {
        // Parse fitnessGoals if it's a JSON string
        let goals = userProfile[0].fitnessGoals;
        if (typeof goals === 'string') {
          goals = JSON.parse(goals);
        }

        // Check if we have an array of goals
        if (Array.isArray(goals) && goals.length > 0) {
          // Map our UI goal names to the API goal names
          const goalMapping: { [key: string]: string } = {
            'Build Muscle': 'muscle gain',
            'Lose Fat': 'weight loss',
            'Increase Strength': 'strength',
            'Improve Endurance': 'endurance',
            'General Fitness': 'overall fitness'
          };

          // Use the first goal as primary
          const primaryGoal = goals[0];
          fitnessGoal = goalMapping[primaryGoal] || 'overall fitness';
        }
      } catch (error) {
        console.error('Error parsing fitness goals:', error);
        // Fallback to default
        fitnessGoal = 'overall fitness';
      }
    }
    
    console.log('Using fitness goal for nutrition plan:', fitnessGoal);

    // Get nutrition recommendations based on the user's goal
    const nutritionPlan = getNutritionRecommendations(fitnessGoal);

    return NextResponse.json({
      nutritionPlan,
      success: true
    });
  } catch (error: any) {
    console.error('Error generating nutrition plan:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate nutrition plan',
        details: error.message
      },
      { status: 500 }
    );
  }
}