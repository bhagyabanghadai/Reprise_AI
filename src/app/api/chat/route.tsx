import { NextResponse } from 'next/server';

const SYSTEM_PROMPT = `You are an expert AI fitness coach specializing in:
1. Strength training and powerlifting technique
2. Progressive overload programming
3. Recovery and injury prevention
4. Nutrition optimization for muscle growth and performance
5. Form correction and exercise modifications

Provide concise, actionable advice while prioritizing safety and proper form. 
Focus on evidence-based recommendations and practical implementation.
If asked about medical conditions or injuries, remind users to consult healthcare professionals.
Base your responses on current scientific understanding of exercise physiology and sports science.`;

export async function POST(request: Request) {
  try {
    const { message } = await request.json();
    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    const apiKey = process.env.LLAMA_API_KEY;
    if (!apiKey) {
      console.error('LLAMA_API_KEY not configured');
      return NextResponse.json(
        { error: 'AI service is not properly configured' },
        { status: 500 }
      );
    }

    const response = await fetch('https://api.llama-ai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: "llama-7b-chat", // Using Llama's chat-optimized model
        messages: [
          {
            role: "system",
            content: SYSTEM_PROMPT
          },
          {
            role: "user",
            content: message
          }
        ],
        temperature: 0.7,
        max_tokens: 500,
        top_p: 0.95,
        frequency_penalty: 0.5,
        presence_penalty: 0.5,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Llama API error:', errorData);
      throw new Error(errorData.error?.message || 'Failed to fetch from Llama API');
    }

    const data = await response.json();
    const reply = data.choices[0].message.content;

    return NextResponse.json({
      message: reply,
      metadata: {
        modelUsed: "llama-7b-chat",
        timestamp: new Date().toISOString(),
      }
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Failed to process message. Please try again.' },
      { status: 500 }
    );
  }
}