import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in' },
        { status: 401 }
      );
    }

    // Create a test chat with the current user
    const testChat = await prisma.chat.create({
      data: {
        name: 'Test Chat',
        type: 'DIRECT',
        participants: {
          create: [
            {
              userId: session.user.id,
              isAdmin: true,
            },
          ],
        },
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true,
              },
            },
          },
        },
      },
    });

    // Add a welcome message
    await prisma.message.create({
      data: {
        chatId: testChat.id,
        senderId: session.user.id,
        content: 'Welcome to the test chat! This is a system message.',
        type: 'SYSTEM',
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Test chat created successfully',
      chat: testChat,
    });

  } catch (error: any) {
    console.error('Test chat creation error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to create test chat',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in' },
        { status: 401 }
      );
    }

    // Create a test chat with the current user
    const testChat = await prisma.chat.create({
      data: {
        name: 'Test Chat',
        type: 'DIRECT',
        participants: {
          create: [
            {
              userId: session.user.id,
              isAdmin: true,
            },
          ],
        },
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true,
              },
            },
          },
        },
      },
    });

    // Add a welcome message
    await prisma.message.create({
      data: {
        chatId: testChat.id,
        senderId: session.user.id,
        content: 'Welcome to the test chat! This is a system message.',
        type: 'SYSTEM',
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Test chat created successfully',
      chat: testChat,
    });

  } catch (error: any) {
    console.error('Test chat creation error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to create test chat',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
