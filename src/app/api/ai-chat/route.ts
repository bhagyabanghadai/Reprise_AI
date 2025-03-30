import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';

const LLAMA_API_KEY = process.env.LLAMA_API_KEY;
const LLAMA_API_ENDPOINT = 'https://api.perplexity.ai/chat/completions';

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export async function POST(request: NextRequest) {
  try {
    const { userId, message, history = [] } = await request.json();

    if (!userId || !message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Prepare the conversation history
    const messages: Message[] = [
      {
        role: 'system',
        content: `You are an expert AI fitness coach named FitAI. Your goal is to help users achieve their fitness goals by providing personalized advice, workout plans, and nutritional guidance.

Your core abilities include:
1. Creating personalized workout plans based on user's goals, fitness level, available equipment, and time constraints
2. Analyzing workout progress and suggesting improvements
3. Providing nutrition advice tailored to fitness goals (muscle gain, fat loss, etc.)
4. Answering fitness-related questions with scientifically accurate information
5. Motivating users with encouraging feedback

When interacting with users:
- Gather important details about their fitness goals, current fitness level, available equipment, and any limitations
- Be encouraging and positive, but also realistic about expectations
- Provide specific, actionable advice rather than general statements
- If a user has a specific goal like "lose 20 pounds" or "get bigger arms", ask clarifying questions to understand their full situation
- Extract structured data from conversations to update the user's profile or create workout plans

OUTPUT FORMAT GUIDELINES:
- Use markdown formatting to structure your responses
- Use bullet points for lists of exercises or tips
- Use headers (##) for section titles
- Bold important information
- When providing workout plans, format each exercise with sets, reps, and notes
- Keep responses concise and focused on the user's questions`
      },
      ...history
    ];

    // Add the new user message
    messages.push({ role: 'user', content: message });

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
        role: 'system',
        content: `The user appears to be providing profile information. After responding conversationally, please extract structured data for their fitness profile. 
        Add a JSON block at the end of your message in this format:
        
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
        
        Only include fields that you can confidently extract from the conversation.`
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
        role: 'system',
        content: `The user appears to be requesting a workout plan. After responding conversationally, please create a structured workout plan. 
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

    // Make the API call to Llama 3 via Perplexity
    const response = await fetch(LLAMA_API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${LLAMA_API_KEY}`
      },
      body: JSON.stringify({
        model: 'llama-3-sonar-large-32k-chat',
        messages,
        temperature: 0.7,
        max_tokens: 2000
      })
    });

    if (!response.ok) {
      console.error(`AI API error: ${response.status}`);
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    let aiResponse = data.choices[0].message.content;
    
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