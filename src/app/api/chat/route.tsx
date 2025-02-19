import { NextResponse } from 'next/server';
import OpenAI from 'openai';

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
    // Validate request
    const body = await request.json();
    const { message } = body;

    if (!message || typeof message !== 'string') {
      console.error('Invalid request: Message is required and must be a string');
      return NextResponse.json(
        { error: 'Invalid request: Message is required' },
        { status: 400 }
      );
    }

    // Check API key
    const apiKey = process.env.LLAMA_API_KEY;
    if (!apiKey) {
      console.error('Missing LLAMA_API_KEY environment variable');
      return NextResponse.json(
        { error: 'AI service is not properly configured' },
        { status: 500 }
      );
    }

    try {
      console.log('Initializing Nvidia Llama client...');
      const client = new OpenAI({
        baseURL: "https://integrate.api.nvidia.com/v1",
        apiKey: apiKey
      });

      console.log('Sending request to Nvidia Llama API...');
      const completion = await client.chat.completions.create({
        model: "nvidia/llama-3.1-nemotron-70b-instruct",
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
        top_p: 1,
        max_tokens: 1024
      });

      console.log('Received response from Nvidia Llama API');

      if (!completion.choices || !completion.choices[0]?.message?.content) {
        throw new Error('Invalid response format from AI service');
      }

      const reply = completion.choices[0].message.content;

      return NextResponse.json({
        message: reply,
        metadata: {
          modelUsed: "nvidia/llama-3.1-nemotron-70b-instruct",
          timestamp: new Date().toISOString(),
        }
      });
    } catch (error: any) {
      console.error('Nvidia Llama API request failed:', error.message);
      return NextResponse.json(
        { error: 'Failed to get AI response. Please try again.' },
        { status: 503 }
      );
    }
  } catch (error: any) {
    console.error('Chat API error:', error.message);
    return NextResponse.json(
      { error: 'Failed to process message. Please try again.' },
      { status: 500 }
    );
  }
}