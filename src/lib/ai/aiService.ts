import OpenAI from 'openai';
import { UserProfile, Exercise } from '@/lib/db';

// AI API configuration
const LLAMA_API_KEY = process.env.LLAMA_API_KEY;
const LLAMA_API_ENDPOINT = 'https://integrate.api.nvidia.com/v1';

/**
 * Centralized AI service for all AI-powered features
 */
export class AIService {
  private client: OpenAI;
  
  constructor() {
    if (!LLAMA_API_KEY) {
      throw new Error('LLAMA_API_KEY is required for AI functionality');
    }
    
    this.client = new OpenAI({
      baseURL: LLAMA_API_ENDPOINT,
      apiKey: LLAMA_API_KEY
    });
  }
  
  /**
   * Generate a personalized fitness assessment based on user profile and workout history
   */
  async generateFitnessAssessment(
    userId: string,
    userProfile: UserProfile,
    workoutHistory: any[]
  ): Promise<{
    strengthScore: number;
    recoveryScore: number;
    suggestions: string[];
    strengths: string[];
    weaknesses: string[];
    nextSteps: string[];
  }> {
    try {
      const userProfileStr = JSON.stringify(userProfile);
      const workoutHistoryStr = JSON.stringify(workoutHistory);
      
      const prompt = `
        As an expert AI fitness coach, provide a comprehensive fitness assessment for this user.
        
        USER PROFILE:
        ${userProfileStr}
        
        WORKOUT HISTORY:
        ${workoutHistoryStr}
        
        Provide the following in your assessment:
        1. Strength Score (0-100)
        2. Recovery Score (0-100)
        3. 2-3 key strengths
        4. 2-3 areas for improvement
        5. 3-5 specific suggestions for reaching their fitness goals
        6. Clear next steps for training
        
        Format your response as a valid JSON object with the following structure:
        {
          "strengthScore": 85,
          "recoveryScore": 90,
          "strengths": ["Good upper body development", "Consistent training frequency"],
          "weaknesses": ["Limited lower body training", "Inadequate recovery protocols"],
          "suggestions": ["Increase squat frequency", "Add mobility work", "Implement proper warm-up"],
          "nextSteps": ["Focus on legs for the next 4 weeks", "Reduce training volume by 10%"]
        }
      `;
      
      const completion = await this.client.chat.completions.create({
        model: "nvidia/llama-3.1-nemotron-70b-instruct",
        messages: [
          {
            role: "system",
            content: "You are an expert fitness coach who provides detailed assessments. You always respond with valid JSON objects only."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        top_p: 1,
        max_tokens: 1024,
        response_format: { type: "json_object" }
      });
      
      const messageContent = completion.choices[0].message.content || '{}';
      const content = JSON.parse(messageContent);
      return content;
    } catch (error) {
      console.error('Error generating fitness assessment:', error);
      
      // Return default assessment in case of API failure
      return {
        strengthScore: 70,
        recoveryScore: 80,
        suggestions: ['Continue with your current training plan', 'Focus on proper form and technique'],
        strengths: ['Regular workout consistency', 'Balanced training approach'],
        weaknesses: ['Potential for more structured progression', 'Consider more recovery strategies'],
        nextSteps: ['Log workouts consistently', 'Review progress every 4 weeks']
      };
    }
  }
  
  /**
   * Generate a recovery recommendation based on recent workouts and user profile
   */
  async generateRecoveryRecommendation(
    userId: string,
    userProfile: UserProfile,
    recentWorkouts: any[]
  ): Promise<{
    recoveryScore: number;
    status: string;
    recommendations: string[];
    warningSigns: string[];
  }> {
    try {
      const userProfileStr = JSON.stringify(userProfile);
      const recentWorkoutsStr = JSON.stringify(recentWorkouts);
      
      const prompt = `
        As an expert AI fitness coach, analyze this user's recent workouts and provide recovery recommendations.
        
        USER PROFILE:
        ${userProfileStr}
        
        RECENT WORKOUTS:
        ${recentWorkoutsStr}
        
        Provide the following in your assessment:
        1. Recovery Score (0-100)
        2. Current recovery status (e.g., "Optimal", "Moderate fatigue", "Overtraining risk")
        3. 3-4 specific recovery recommendations
        4. Any warning signs to watch for
        
        Format your response as a valid JSON object with the following structure:
        {
          "recoveryScore": 75,
          "status": "Moderate fatigue detected",
          "recommendations": ["Increase sleep by 1 hour", "Add light mobility work", "Consider a deload week"],
          "warningSigns": ["Joint pain during warm-up", "Decreased performance for 3+ sessions"]
        }
      `;
      
      const completion = await this.client.chat.completions.create({
        model: "nvidia/llama-3.1-nemotron-70b-instruct",
        messages: [
          {
            role: "system",
            content: "You are an expert fitness coach focusing on recovery and performance optimization. You always respond with valid JSON objects only."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        top_p: 1,
        max_tokens: 1024,
        response_format: { type: "json_object" }
      });
      
      const messageContent = completion.choices[0].message.content || '{}';
      const content = JSON.parse(messageContent);
      return content;
    } catch (error) {
      console.error('Error generating recovery recommendation:', error);
      
      // Return default recovery recommendation in case of API failure
      return {
        recoveryScore: 85,
        status: "Good recovery status",
        recommendations: [
          "Maintain current recovery protocols",
          "Ensure adequate hydration and sleep",
          "Consider adding light active recovery sessions between intense workouts"
        ],
        warningSigns: [
          "Persistent muscle soreness beyond 72 hours",
          "Significant decrease in performance",
          "Unusual fatigue or lack of motivation"
        ]
      };
    }
  }
  
  /**
   * Generate a daily nutrition recommendation based on workout history and goals
   */
  async generateNutritionRecommendation(
    userId: string,
    userProfile: UserProfile,
    recentWorkouts: any[],
    workoutPlan: any
  ): Promise<{
    dailyCalories: number;
    macroSplit: { protein: number, carbs: number, fat: number };
    mealPlan: { meal: string, foods: string[], macros: { protein: number, carbs: number, fat: number, calories: number } }[];
    hydrationNeeds: number;
    supplements: { name: string, dosage: string, timing: string }[];
  }> {
    try {
      const userProfileStr = JSON.stringify(userProfile);
      const recentWorkoutsStr = JSON.stringify(recentWorkouts);
      const workoutPlanStr = JSON.stringify(workoutPlan);
      
      const prompt = `
        As an expert AI nutrition coach, create a personalized nutrition plan for this user based on their profile, recent workouts, and upcoming workout plan.
        
        USER PROFILE:
        ${userProfileStr}
        
        RECENT WORKOUTS:
        ${recentWorkoutsStr}
        
        UPCOMING WORKOUT PLAN:
        ${workoutPlanStr}
        
        Create a detailed nutrition plan that includes:
        1. Daily calorie target
        2. Macro split (protein/carbs/fat in grams)
        3. Example meal plan for one day
        4. Hydration needs in ounces or liters
        5. Supplement recommendations if appropriate
        
        Format your response as a valid JSON object with the following structure:
        {
          "dailyCalories": 2500,
          "macroSplit": { "protein": 180, "carbs": 275, "fat": 70 },
          "mealPlan": [
            { 
              "meal": "Breakfast", 
              "foods": ["Oatmeal with berries", "Egg whites", "Greek yogurt"], 
              "macros": { "protein": 35, "carbs": 45, "fat": 10, "calories": 410 }
            },
            ...
          ],
          "hydrationNeeds": 3.5,
          "supplements": [
            { "name": "Creatine Monohydrate", "dosage": "5g", "timing": "Daily with any meal" },
            ...
          ]
        }
      `;
      
      const completion = await this.client.chat.completions.create({
        model: "nvidia/llama-3.1-nemotron-70b-instruct",
        messages: [
          {
            role: "system",
            content: "You are an expert nutrition coach who specializes in fitness nutrition for active individuals. You always respond with valid JSON objects only."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        top_p: 1,
        max_tokens: 1500,
        response_format: { type: "json_object" }
      });
      
      const messageContent = completion.choices[0].message.content || '{}';
      const content = JSON.parse(messageContent);
      return content;
    } catch (error) {
      console.error('Error generating nutrition recommendation:', error);
      
      // Return a generic nutrition plan in case of API failure
      return {
        dailyCalories: 2200,
        macroSplit: { protein: 150, carbs: 220, fat: 70 },
        mealPlan: [
          { 
            meal: "Breakfast", 
            foods: ["2 eggs", "Oatmeal with berries", "1 tbsp peanut butter"], 
            macros: { protein: 20, carbs: 30, fat: 15, calories: 335 }
          },
          { 
            meal: "Lunch", 
            foods: ["6 oz chicken breast", "1 cup brown rice", "Mixed vegetables"], 
            macros: { protein: 40, carbs: 45, fat: 10, calories: 430 }
          },
          { 
            meal: "Pre-workout Snack", 
            foods: ["Protein shake", "Banana"], 
            macros: { protein: 25, carbs: 25, fat: 3, calories: 227 }
          },
          { 
            meal: "Dinner", 
            foods: ["6 oz salmon", "Sweet potato", "Asparagus"], 
            macros: { protein: 35, carbs: 30, fat: 20, calories: 440 }
          },
          { 
            meal: "Evening Snack", 
            foods: ["Greek yogurt", "Handful of nuts"], 
            macros: { protein: 20, carbs: 15, fat: 12, calories: 244 }
          }
        ],
        hydrationNeeds: 3,
        supplements: [
          { name: "Protein powder", dosage: "1-2 scoops", timing: "Post-workout or between meals" },
          { name: "Creatine Monohydrate", dosage: "5g", timing: "Daily with any meal" },
          { name: "Fish oil", dosage: "1-2g", timing: "With meals" }
        ]
      };
    }
  }
  
  /**
   * Generate personalized workout feedback
   */
  async generateWorkoutFeedback(
    userId: string,
    workout: any,
    workoutHistory: any[],
    userProfile: UserProfile
  ): Promise<string[]> {
    try {
      const workoutStr = JSON.stringify(workout);
      const workoutHistoryStr = JSON.stringify(workoutHistory);
      const userProfileStr = JSON.stringify(userProfile);
      
      const prompt = `
        As an expert AI fitness coach, provide feedback on this user's completed workout.
        
        COMPLETED WORKOUT:
        ${workoutStr}
        
        WORKOUT HISTORY:
        ${workoutHistoryStr}
        
        USER PROFILE:
        ${userProfileStr}
        
        Provide 3-5 specific pieces of feedback about:
        1. Performance relative to previous workouts
        2. Form and technique suggestions
        3. Recovery and progression recommendations
        4. Specific improvements for next session
        
        Format your response as a JSON array of feedback strings.
      `;
      
      const completion = await this.client.chat.completions.create({
        model: "nvidia/llama-3.1-nemotron-70b-instruct",
        messages: [
          {
            role: "system",
            content: "You are an expert fitness coach who provides detailed workout feedback. You always respond with valid JSON arrays of strings only."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        top_p: 1,
        max_tokens: 1024,
        response_format: { type: "json_object" }
      });
      
      const messageContent = completion.choices[0].message.content || '[]';
      return JSON.parse(messageContent);
    } catch (error) {
      console.error('Error generating workout feedback:', error);
      
      // Return default feedback in case of API failure
      return [
        "Great job completing your workout! Consistency is key to progress.",
        "Focus on maintaining proper form throughout each exercise, especially when fatigue sets in.",
        "Consider adding a progressive overload element to your next workout by increasing weight, reps, or sets.",
        "Make sure to prioritize recovery with adequate nutrition and sleep."
      ];
    }
  }
  
  /**
   * Generate AI chat response with context about user's fitness journey
   */
  async generateChatResponse(
    message: string,
    chatHistory: { role: string, content: string }[],
    userProfile?: UserProfile | null,
    recentWorkouts?: any[]
  ): Promise<string> {
    try {
      const userContext = userProfile ? 
        `\nUSER PROFILE: ${JSON.stringify(userProfile)}` : '';
      const workoutContext = recentWorkouts && recentWorkouts.length > 0 ? 
        `\nRECENT WORKOUTS: ${JSON.stringify(recentWorkouts)}` : '';
        
      const systemPrompt = `You are an expert AI fitness coach specializing in strength training and wellness. Format your responses in a clear, organized manner following these guidelines:

1. Always start with a brief, friendly acknowledgment
2. Use clear section headers with emoji icons for visual organization
3. Keep explanations concise and actionable
4. End with a clear next step or question

Structure your responses like this:

👋 **Greeting**
Brief acknowledgment of the user's question

💡 **Key Points**
• [Point 1]
• [Point 2]
• [Point 3]

🎯 **Action Steps**
1. [First step]
2. [Second step]
3. [Third step]

⚠️ **Safety Note**
[If applicable, include relevant safety information]

❓ **Follow-up**
[End with a question to encourage dialogue]

You have the following context about the user:${userContext}${workoutContext}`;
      
      // Prepare the chat history in the right format
      const formattedHistory = chatHistory.map((msg) => ({
        role: msg.role as "user" | "assistant" | "system",
        content: msg.content
      }));
      
      const completion = await this.client.chat.completions.create({
        model: "nvidia/llama-3.1-nemotron-70b-instruct",
        messages: [
          {
            role: "system",
            content: systemPrompt
          },
          ...formattedHistory,
          {
            role: "user",
            content: message
          }
        ],
        temperature: 0.7,
        top_p: 1,
        max_tokens: 1024
      });
      
      return completion.choices[0].message.content || 
        "I'm having trouble generating a response right now. Please try again in a moment.";
    } catch (error) {
      console.error('Error generating chat response:', error);
      return "I'm having trouble connecting to my AI systems right now. Please try again in a moment, or ask me a different question about your fitness journey.";
    }
  }
  
  /**
   * Generate specialized trainer response that extracts actionable fitness data
   */
  async generateTrainerResponse(
    message: string,
    chatHistory: { role: string, content: string, metadata?: any }[],
    userProfile?: UserProfile | null,
    recentWorkouts?: any[],
    availableExercises?: any[]
  ): Promise<string> {
    try {
      const userContext = userProfile ? 
        `\nUSER PROFILE: ${JSON.stringify(userProfile)}` : '';
      const workoutContext = recentWorkouts && recentWorkouts.length > 0 ? 
        `\nRECENT WORKOUTS: ${JSON.stringify(recentWorkouts)}` : '';
      const exerciseContext = availableExercises && availableExercises.length > 0 ?
        `\nAVAILABLE EXERCISES: ${JSON.stringify(availableExercises)}` : '';
        
      const systemPrompt = `You are an advanced AI fitness trainer built to have natural conversations and extract structured data for fitness planning. Your primary mission is to help users set fitness goals, create workout plans, monitor progress, and provide expert guidance - just like a human personal trainer would.

CONVERSATION GUIDELINES:
1. Be conversational but structured and professional
2. Use clear section headers with emoji icons when appropriate
3. Keep explanations practical and actionable
4. Always respond in a personable way that builds rapport
5. When appropriate, provide structured data in JSON format (instructions below)

DATA EXTRACTION RULES:
1. When a user provides information about their fitness goals, preferences, or physical details (height, weight, etc.), you should extract this data as structured JSON.
2. Include the JSON inside triple backticks with the json tag, like: \`\`\`json
   {...}
   \`\`\`
3. Do NOT mention that you're extracting data - just include the structured data quietly at the end of your response.

STRUCTURED DATA TYPES TO EXTRACT:

1. PROFILE DATA - Extract when user mentions fitness goals, level, preferences:
\`\`\`json
{
  "fitnessGoals": {
    "primary": "string, e.g. muscle_building, fat_loss, strength, endurance, etc.",
    "secondary": ["array of secondary goals"]
  },
  "fitnessLevel": "beginner|intermediate|advanced",
  "daysPerWeek": number,
  "equipment": ["gym|home|minimal|etc"],
  "height": "height in units specified, or null",
  "weight": "weight in units specified, or null",
  "limitations": "any injuries or limitations, or null",
  "age": number or null
}
\`\`\`

2. WORKOUT PLAN - Create when explicitly discussing workout creation:
\`\`\`json
{
  "weeklyPlan": [
    {
      "day": "Monday",
      "focus": "Upper Body",
      "exercises": [
        { "name": "Bench Press", "exerciseId": 1, "sets": 3, "reps": 10, "weight": 135, "notes": "Focus on form" }
      ],
      "completed": false
    }
  ],
  "insights": ["array of insights"],
  "suggestions": ["array of suggestions"]
}
\`\`\`

3. NUTRITION PLAN - Create when discussing nutrition needs:
\`\`\`json
{
  "dailyCalories": 2500,
  "macroSplit": {"protein": 180, "carbs": 250, "fat": 80},
  "mealPlan": [
    {"meal": "Breakfast", "foods": ["Oatmeal", "Eggs", "Berries"], "macros": {...}}
  ]
}
\`\`\`

IMPORTANT BEHAVIORS:
- Extract structured data only when relevant and sufficient information is provided
- Don't force extractions from vague conversations
- Your personality is supportive, knowledgeable, and motivating
- Keep conversations natural - the user shouldn't feel like they're filling out a form
- When asking questions, ask ONE QUESTION AT A TIME to keep conversations focused

You have the following context about the user:${userContext}${workoutContext}${exerciseContext}`;
      
      // Prepare the chat history in the right format
      const formattedHistory = chatHistory.map((msg) => ({
        role: msg.role as "user" | "assistant" | "system",
        content: msg.content
      }));
      
      const completion = await this.client.chat.completions.create({
        model: "nvidia/llama-3.1-nemotron-70b-instruct",
        messages: [
          {
            role: "system",
            content: systemPrompt
          },
          ...formattedHistory,
          {
            role: "user",
            content: message
          }
        ],
        temperature: 0.7,
        top_p: 1,
        max_tokens: 1500
      });
      
      return completion.choices[0].message.content || 
        "I'm having trouble generating a response right now. Please try again in a moment.";
    } catch (error) {
      console.error('Error generating trainer response:', error);
      return "I'm having some trouble right now. Let's try a different approach. Could you tell me a bit more about your fitness goals and experience level?";
    }
  }
}

// Export singleton instance
export const aiService = new AIService();