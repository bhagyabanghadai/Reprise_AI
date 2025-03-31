import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';

const LLAMA_API_KEY = process.env.LLAMA_API_KEY;
// Switch to using Nvidia's Llama model endpoint
const NVIDIA_API_ENDPOINT = 'https://integrate.api.nvidia.com/v1/chat/completions';
// Use a fallback model if we're having API issues or for testing
// Setting to false to use the actual Llama API
const USE_FALLBACK = false;

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export async function POST(request: NextRequest) {
  try {
    const { userId, message, chatHistory = [], intent = 'general' } = await request.json();

    if (!userId || !message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Prepare the conversation history - create a new array to avoid mutating the input
    const systemPrompt: Message = {
      role: 'system' as const,
      content: `You are an expert AI fitness coach named FitAI. Your goal is to help users achieve their fitness goals by providing personalized advice, workout plans, and nutritional guidance.

Your core abilities include:
1. Creating personalized workout plans based on user's goals, fitness level, available equipment, and time constraints
2. Analyzing workout progress and suggesting improvements
3. Providing nutrition advice tailored to fitness goals (muscle gain, fat loss, etc.)
4. Answering fitness-related questions with scientifically accurate information
5. Motivating users with encouraging feedback

INTERACTION GUIDELINES - VERY IMPORTANT:
- Ask ONE question at a time - do not overwhelm the user with multiple questions in a single message
- For each step of information gathering, provide clear selectable options the user can choose from
- Wait for the user's response to each individual question before proceeding to the next one
- Follow a logical conversation flow: first goal, then fitness level, then equipment, then time available, then any limitations
- Be conversational and friendly, as if having a natural dialogue
- If collecting multiple related pieces of information, present them as separate questions in separate messages

For example, instead of asking for multiple pieces of information at once, break it down:
1. First message: "What's your primary fitness goal? (Strength, Weight Loss, Muscle Gain, etc.)"
2. After user responds: "Great! What's your current fitness level? (Beginner, Intermediate, Advanced)"
3. And so on...

OUTPUT FORMAT GUIDELINES:
- Use markdown formatting to structure your responses
- Use bullet points for lists of exercises or tips
- Use headers (##) for section titles
- Bold important information
- When providing workout plans, format each exercise with sets, reps, and notes
- Keep responses concise and focused on the user's questions
- For selectable options, present them as a numbered or bulleted list for easy selection`
    };

    // Check if we have a valid chat history and construct messages array
    let messages: Message[] = [];
    
    // Always start with the system prompt
    messages.push(systemPrompt as Message);
    
    // Add conversation history if provided and valid
    if (Array.isArray(chatHistory) && chatHistory.length > 0) {
      // Filter out any invalid messages and only include user/assistant roles
      const validMessages = chatHistory.filter(
        msg => msg && (msg.role === 'user' || msg.role === 'assistant') && typeof msg.content === 'string'
      ) as Message[];
      
      // Add valid messages to our conversation
      messages = [...messages, ...validMessages];
    }

    // Add the new user message
    messages.push({ role: 'user' as const, content: message });

    // Check if we can extract intent from the message
    let extractedData = null;
    let actionRequired = false;
    let actionType = null;
    
    // Determine if we should analyze for profile data
    if (
      message.toLowerCase().includes('goal') ||
      message.toLowerCase().includes('experience') ||
      message.toLowerCase().includes('equipment') ||
      message.toLowerCase().includes('weight') ||
      message.toLowerCase().includes('height') ||
      message.toLowerCase().includes('fitness level')
    ) {
      // Add an additional instruction for the AI to extract profile data
      messages.push({
        role: 'system' as const,
        content: `The user appears to be providing profile information. After responding conversationally with just ONE follow-up question, please extract structured data for their fitness profile from what you know so far. 

VERY IMPORTANT:
1. Only ask ONE question in each response - focus on getting specific information
2. Present options in a simple, selectable format (1, 2, 3 or bullet points)
3. Do not overwhelm the user with multiple questions
4. Continue this step-by-step approach with each user response

Add a JSON block at the end of your message with whatever information you've collected so far:
        
        \`\`\`json
        {
          "profileData": {
            "fitnessGoals": {
              "primary": "strength|muscle_building|weight_loss|endurance|general",
              "secondary": ["list", "of", "secondary", "goals"],
              "targetWeight": 123
            },
            "fitnessLevel": "beginner|intermediate|advanced",
            "workoutsPerWeek": 3,
            "equipment": ["list", "of", "available", "equipment"],
            "height": 175,
            "weight": 80,
            "medicalConditions": ["list", "of", "conditions"]
          }
        }
        \`\`\`
        
        Only include fields that you can confidently extract from the conversation so far. It's fine if many fields are missing in the early conversations - they will be filled in as you continue the dialogue one question at a time.`
      });
      
      actionRequired = true;
      actionType = 'profile_update';
    }
    
    // Determine if we should create a workout plan
    else if (
      message.toLowerCase().includes('workout plan') ||
      message.toLowerCase().includes('exercise plan') ||
      message.toLowerCase().includes('training plan') ||
      message.toLowerCase().includes('routine') ||
      message.toLowerCase().includes('program')
    ) {
      // Add an additional instruction for the AI to create a workout plan
      messages.push({
        role: 'system' as const,
        content: `The user appears to be requesting a workout plan. 

VERY IMPORTANT APPROACH:
1. Before creating a full workout plan, confirm if you have all the necessary information:
   - Their primary fitness goal
   - Their fitness level
   - Available equipment
   - Time available per workout and days per week
   - Any limitations or injuries

2. If ANY of this information is missing, ask just ONE specific question to gather the most important missing piece first
   - Provide 3-5 simple, selectable options for them to choose from
   - Wait for their response before asking about the next piece of information
   - Do not overwhelm them with multiple questions at once

3. Only after you have sufficient information, create a structured workout plan
   - Make it personalized to their specific situation
   - Keep it easy to follow and not overwhelming
   - Include proper warm-up and cool-down guidance

After responding conversationally, please create a structured workout plan. 
Add a JSON block at the end of your message in this format:
        
        \`\`\`json
        {
          "workoutPlan": {
            "weeklyPlan": [
              {
                "day": "Monday",
                "focus": "Upper Body",
                "exercises": [
                  {
                    "name": "Bench Press",
                    "sets": 3,
                    "reps": "8-10",
                    "notes": "Focus on form"
                  },
                  {
                    "name": "Pull-ups",
                    "sets": 3,
                    "reps": "max",
                    "notes": "Use assistance if needed"
                  }
                ]
              }
            ],
            "notes": "Additional instructions or tips"
          }
        }
        \`\`\`
        
        Ensure the plan is appropriate for the user's fitness level, goals, and available equipment.`
      });
      
      actionRequired = true;
      actionType = 'workout_plan';
    }

    // We'll provide a realistic response if we're in fallback mode
    let aiResponse = '';
    let data = null;

    if (USE_FALLBACK) {
      console.log('Using fallback AI response mode');
      // Create a realistic fallback response based on the user's message
      let responseText = '';
      
      // Handle bench press specific request
      if (message.toLowerCase().includes('bench press')) {
        responseText = `## Bench Press Progression Plan

I understand you want to increase your bench press from 120 lbs to 250 lbs. That's an ambitious but achievable goal with the right approach!

### Current Assessment
- Current max: 120 lbs
- Target max: 250 lbs
- This represents a 108% increase in strength

### Realistic Timeline
This type of progression typically takes 12-18 months of consistent training for most lifters, depending on:
- Your training experience
- Your body weight and frame
- Your recovery capacity
- Your consistency

### Key Principles for Bench Press Progress
- **Progressive Overload**: Gradually increase weight over time
- **Proper Form**: Technical efficiency is crucial for heavy pressing
- **Frequency**: Bench 2-3 times per week with different intensities
- **Volume Management**: Balance enough volume for growth without overtraining
- **Accessory Work**: Strengthen supporting muscles (triceps, shoulders, upper back)
- **Recovery**: Adequate sleep, nutrition and rest between sessions

### 4-Phase Program

**Phase 1: Foundation (Weeks 1-6)**
- Bench Press: 3 sets of 8-10 reps at 60-65% of max (70-80 lbs)
- Close-Grip Bench: 3 sets of 8-10 reps
- Dumbbell Incline Press: 3 sets of 10-12 reps
- Push-ups: 3 sets to near failure
- Train bench 2x per week with 72 hours between sessions
- Focus: Perfect form, build muscle, establish base

**Phase 2: Hypertrophy (Weeks 7-12)**
- Bench Press: 4 sets of 6-8 reps at 70-75% of max (85-95 lbs)
- Incline Bench: 3 sets of 8-10 reps
- Dumbbell Bench Variations: 3 sets of 8-10 reps
- Tricep Extensions: 3 sets of 10-12 reps
- Train bench 2-3x per week with varied intensity
- Focus: Build muscle mass in chest, shoulders, triceps

**Phase 3: Strength Development (Weeks 13-20)**
- Bench Press: 5 sets of 3-5 reps at 80-85% of current max
- Heavy Close-Grip Bench: 3 sets of 5 reps
- Weighted Dips: 3 sets of 6-8 reps
- Bench Press variation (pause bench, board press): 3 sets of 5 reps
- Train bench 2x per week with one heavy, one moderate day
- Focus: Neural adaptations, force production

**Phase 4: Peak Strength (Weeks 21-24)**
- Bench Press: Work up to heavy singles/doubles at 90%+ of max
- Supplemental Bench: 3 sets of 3 reps at 85%
- Assistance exercises: 2-3 sets of 6-8 reps
- Focus: Maximal strength expression, technique under heavy load

### Nutrition Requirements
- **Protein**: 1.8-2.2g per kg of bodyweight daily
- **Caloric surplus**: 300-500 calories above maintenance if muscle gain is needed
- **Carbohydrates**: Prioritize around training sessions
- **Hydration**: 3-4 liters of water daily minimum

### Recovery Strategies
- 7-9 hours of quality sleep nightly
- Active recovery between sessions
- Strategic deload weeks every 4-6 weeks

Would you like me to elaborate on any specific part of this plan? Or would you like more details about the exercise programming?`;
      } 
      // Handle workout plan request
      else if (message.toLowerCase().includes('workout') || message.toLowerCase().includes('plan') || message.toLowerCase().includes('routine')) {
        responseText = `## Personalized Workout Plan

Based on your goals, here's a balanced workout plan to help you get started:

### 3-Day Full Body Split

**Day 1: Push Focus**
- Barbell Bench Press: 4 sets of 8-10 reps
- Shoulder Press: 3 sets of 10-12 reps
- Incline Dumbbell Press: 3 sets of 10-12 reps
- Tricep Pushdowns: 3 sets of 12-15 reps
- Lateral Raises: 3 sets of 12-15 reps
- Plank: 3 sets of 30-45 seconds

**Day 2: Pull Focus**
- Pullups or Lat Pulldowns: 4 sets of 8-10 reps
- Barbell Rows: 3 sets of 10-12 reps
- Face Pulls: 3 sets of 12-15 reps
- Bicep Curls: 3 sets of 10-12 reps
- Hammer Curls: 3 sets of 10-12 reps
- Russian Twists: 3 sets of 15-20 reps per side

**Day 3: Legs & Core**
- Squats: 4 sets of 8-10 reps
- Romanian Deadlifts: 3 sets of 10-12 reps
- Leg Press: 3 sets of 10-12 reps
- Leg Curls: 3 sets of 12-15 reps
- Calf Raises: 4 sets of 15-20 reps
- Hanging Leg Raises: 3 sets of 10-15 reps

### Guidelines
- Rest 1-2 minutes between sets
- Train 3-4 days per week with at least one rest day between sessions
- Increase weight when you can complete all reps with good form
- Include 5-10 minutes of dynamic stretching before workouts
- Consider adding 20-30 minutes of moderate cardio 2-3 times per week

Would you like me to adjust this plan based on any specific equipment or time constraints you might have?`;
      }
      // General fitness advice
      else {
        responseText = `## Personalized Fitness Guidance

Thank you for reaching out! I'd be happy to help you on your fitness journey.

To provide you with the most personalized advice, I'd like to learn more about:

1. **Your current fitness level** (beginner, intermediate, advanced)
2. **Your primary fitness goals** (strength, muscle gain, weight loss, endurance, etc.)
3. **Available equipment** (gym access, home equipment, etc.)
4. **Time available** for training each week
5. **Any limitations or injuries** I should be aware of

This information will help me create tailored recommendations that align with your specific situation.

In the meantime, here are some general fitness principles that apply to most goals:

### Fundamental Fitness Principles
- **Consistency** is more important than intensity
- **Progressive overload** (gradually increasing difficulty) drives improvement
- **Balanced nutrition** should support your activity level
- **Recovery** is when your body actually adapts and improves
- **Proper form** prevents injury and maximizes results

Would you mind sharing more details about your current situation and goals so I can provide more specific guidance?`;
      }
      
      aiResponse = responseText;
      
      // Provide a simulated API response structure
      data = {
        choices: [
          {
            message: {
              content: aiResponse
            }
          }
        ]
      };
    } 
    else {
      // Make the actual API call to Nvidia's Llama model
      console.log('Making API call to Nvidia Llama AI');
      const response = await fetch(NVIDIA_API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${LLAMA_API_KEY}`
        },
        body: JSON.stringify({
          model: 'nvidia/llama-3.1-nemotron-70b-instruct',
          messages,
          temperature: 0.5,
          top_p: 1,
          max_tokens: 1024
        })
      });

      if (!response.ok) {
        console.error(`AI API error: ${response.status}`);
        throw new Error(`AI API error: ${response.status}`);
      }

      data = await response.json();
      aiResponse = data.choices[0].message.content;
    }
    
    // Extract JSON data if present in the response
    if (actionRequired && actionType) {
      const jsonMatch = aiResponse.match(/```json\n([\s\S]*?)\n```/);
      
      if (jsonMatch && jsonMatch[1]) {
        try {
          extractedData = JSON.parse(jsonMatch[1]);
          
          // Clean the visible response by removing the JSON block
          aiResponse = aiResponse.replace(/```json\n[\s\S]*?\n```/, '');
        } catch (error) {
          console.error('Error parsing JSON from AI response:', error);
        }
      }
    }

    return NextResponse.json({
      message: aiResponse,
      metadata: {
        intent: actionType === 'profile_update' ? 'gather_profile_data' : 
                 actionType === 'workout_plan' ? 'create_workout_plan' : 'general_conversation',
        actionRequired,
        actionType,
        extractedData: extractedData
      }
    });
  } catch (error) {
    console.error('Error processing AI chat request:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}