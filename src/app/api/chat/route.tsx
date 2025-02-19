import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const SYSTEM_PROMPT = `You are an expert AI fitness coach specializing in strength training and wellness. Format your responses in a clear, organized manner following these guidelines:

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
[End with a question to encourage dialogue]`;

export async function POST(request: Request) {
  try {
    const { message } = await request.json();

    if (!message || typeof message !== 'string') {
      console.error('Invalid request: Message is required and must be a string');
      return NextResponse.json(
        { error: 'Invalid request: Message is required' },
        { status: 400 }
      );
    }

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