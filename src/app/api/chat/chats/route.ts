import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { prisma } = await import('@/lib/prisma');

    // Get all chats where the user is a participant
    const userChats = await prisma.chat.findMany({
      where: {
        participants: {
          some: {
            userId: session.user.id,
          },
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
        course: {
          select: {
            id: true,
            title: true,
          },
        },
        messages: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 1,
          include: {
            sender: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    // Transform the data to include lastMessage
    const chatsWithLastMessage = userChats.map(chat => ({
      ...chat,
      lastMessage: chat.messages[0] || null,
      messages: undefined, // Remove messages array to avoid confusion
    }));

    return NextResponse.json({
      success: true,
      chats: chatsWithLastMessage,
    });

  } catch (error) {
    console.error('Error fetching chats:', error);
    return NextResponse.json({
      success: false,
      message: 'An error occurred while fetching chats',
    }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { type, name, courseId, participantIds } = body;

    if (!type || !participantIds || !Array.isArray(participantIds)) {
      return NextResponse.json({
        success: false,
        message: 'Missing required fields',
      }, { status: 400 });
    }

    const { prisma } = await import('@/lib/prisma');

    // Create chat
    const chat = await prisma.chat.create({
      data: {
        name: name || null,
        type,
        courseId: courseId || null,
        participants: {
          create: [
            // Add current user as participant
            {
              userId: session.user.id,
              isAdmin: true,
            },
            // Add other participants
            ...participantIds.map((userId: string) => ({
              userId,
              isAdmin: false,
            })),
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
        course: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Chat created successfully',
      chat,
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating chat:', error);
    return NextResponse.json({
      success: false,
      message: 'An error occurred while creating the chat',
    }, { status: 500 });
  }
}
