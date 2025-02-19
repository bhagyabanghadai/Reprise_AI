import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { message } = await request.json();
    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    const apiKey = process.env.PERPLEXITY_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key not configured' },
        { status: 500 }
      );
    }

    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: "llama-3.1-sonar-small-128k-online",
        messages: [
          {
            role: "system",
            content: "You are an AI fitness coach specializing in powerlifting, bodybuilding, and strength training. Provide precise, actionable advice while prioritizing safety and proper form. Keep responses concise and focused on practical implementation."
          },
          {
            role: "user",
            content: message
          }
        ],
        temperature: 0.2,
        top_p: 0.9,
        max_tokens: 150,
        frequency_penalty: 1
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch response from Perplexity API');
    }

    const data = await response.json();
    const reply = data.choices[0].message.content;

    return NextResponse.json({ message: reply });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Failed to process message' },
      { status: 500 }
    );
  }
}