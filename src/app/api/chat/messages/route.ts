import { NextRequest, NextResponse } from 'next/server';
import { db, chatMessages } from '@/lib/db';
import { and, eq, desc } from 'drizzle-orm';

// GET /api/chat/messages?userId={userId}
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    // Check if database is available
    if (!process.env.DATABASE_URL) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 503 }
      );
    }

    // Get messages for this user, ordered by timestamp
    const messages = await db.query.chatMessages.findMany({
      where: eq(chatMessages.userId, userId),
      orderBy: [desc(chatMessages.timestamp)]
    });

    return NextResponse.json({ messages });
  } catch (error) {
    console.error('Error fetching chat messages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch chat messages' },
      { status: 500 }
    );
  }
}

// POST /api/chat/messages
export async function POST(request: NextRequest) {
  try {
    const { userId, content, role, metadata } = await request.json();

    if (!userId || !content || !role) {
      return NextResponse.json(
        { error: 'userId, content, and role are required' },
        { status: 400 }
      );
    }

    const newMessage = await db
      .insert(chatMessages)
      .values({
        userId,
        content,
        role,
        metadata: metadata || null
      })
      .returning();

    return NextResponse.json({ message: newMessage[0] });
  } catch (error) {
    console.error('Error creating chat message:', error);
    return NextResponse.json(
      { error: 'Failed to create chat message' },
      { status: 500 }
    );
  }
}

// DELETE /api/chat/messages?userId={userId}
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const messageId = searchParams.get('messageId');

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    if (messageId) {
      // Delete specific message
      await db
        .delete(chatMessages)
        .where(
          and(
            eq(chatMessages.userId, userId),
            eq(chatMessages.id, parseInt(messageId))
          )
        );
      return NextResponse.json({ success: true, message: 'Message deleted' });
    } else {
      // Delete all messages for this user
      await db.delete(chatMessages).where(eq(chatMessages.userId, userId));
      return NextResponse.json({ success: true, message: 'All messages deleted for user' });
    }
  } catch (error) {
    console.error('Error deleting chat messages:', error);
    return NextResponse.json(
      { error: 'Failed to delete chat messages' },
      { status: 500 }
    );
  }
}