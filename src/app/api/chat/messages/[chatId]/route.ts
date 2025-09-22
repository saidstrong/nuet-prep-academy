import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: { chatId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { chatId } = params;

    console.log('🔍 Fetching messages for chatId:', chatId, 'userId:', session.user.id);

    try {
      // Try to fetch from database first
      const { prisma } = await import('@/lib/prisma');
      
      // Check if user is a participant in this chat
      let chatParticipant = await prisma.chatParticipant.findFirst({
        where: {
          chatId: chatId,
          userId: session.user.id,
        },
      });

      // If not found, create the participant (this handles the case where chat exists but user isn't added yet)
      if (!chatParticipant) {
        console.log('🔧 Creating chat participant for user in messages API');
        
        // First, ensure the user exists in the database
        let user = await prisma.user.findUnique({
          where: { email: session.user.email }
        });
        
        if (!user) {
          console.log('🔧 User not found in database, creating user:', session.user);
          user = await prisma.user.create({
            data: {
              id: session.user.id,
              name: session.user.name,
              email: session.user.email,
              password: 'mock-password', // This is a mock user
              role: session.user.role,
            },
          });
        } else {
          console.log('✅ User found in database:', user);
        }
        
        // Use the actual user ID from the database
        const actualUserId = user.id;
        console.log('🔧 Using user ID from database:', actualUserId);
        
        chatParticipant = await prisma.chatParticipant.create({
          data: {
            chatId: chatId,
            userId: actualUserId,
            isAdmin: false,
          },
        });
        console.log('✅ Chat participant created:', chatParticipant);
      } else {
        console.log('✅ Chat participant found:', chatParticipant);
      }

      const dbMessages = await prisma.message.findMany({
        where: {
          chatId: chatId,
        },
        include: {
          sender: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        },
        orderBy: {
          createdAt: 'asc'
        }
      });

      const messages = dbMessages.map(message => ({
        id: message.id,
        content: message.content,
        senderId: message.sender.id,
        senderName: message.sender.name,
        senderAvatar: undefined,
        timestamp: message.createdAt.toISOString(),
        type: message.type.toLowerCase(),
        reactions: {}, // TODO: Implement reactions
        isEdited: false,
        isDeleted: false,
        attachments: []
      }));

      console.log(`✅ Found ${messages.length} messages from database`);
      return NextResponse.json({ messages });

    } catch (dbError: any) {
      console.log('❌ Database error, using mock messages:', dbError.message);
      
      // Fallback to mock data
      const messages = [
      {
        id: '1',
        content: 'Hey, how are you doing?',
        senderId: '2',
        senderName: 'John Doe',
        senderAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
        type: 'text',
        reactions: {
          '👍': ['1', '3'],
          '❤️': ['2']
        },
        isEdited: false,
        isDeleted: false,
        attachments: []
      },
      {
        id: '2',
        content: 'I\'m doing great! Just finished the math practice test.',
        senderId: session.user.id,
        senderName: session.user.name,
        senderAvatar: (session.user as any).image,
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 1.5).toISOString(),
        type: 'text',
        reactions: {
          '🎉': ['2', '3', '4']
        },
        isEdited: false,
        isDeleted: false,
        attachments: []
      },
      {
        id: '3',
        content: 'That\'s awesome! How did you do?',
        senderId: '2',
        senderName: 'John Doe',
        senderAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 1).toISOString(),
        type: 'text',
        reactions: {},
        isEdited: false,
        isDeleted: false,
        attachments: []
      },
      {
        id: '4',
        content: 'I got 85%! Much better than last time.',
        senderId: session.user.id,
        senderName: session.user.name,
        senderAvatar: (session.user as any).image,
        timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
        type: 'text',
        reactions: {
          '👏': ['2', '3'],
          '🔥': ['2']
        },
        isEdited: false,
        isDeleted: false,
        attachments: []
      },
      {
        id: '5',
        content: 'Check out this practice problem I found',
        senderId: '2',
        senderName: 'John Doe',
        senderAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face',
        timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        type: 'text',
        reactions: {},
        isEdited: false,
        isDeleted: false,
        attachments: [
          {
            id: '1',
            name: 'math_problem.pdf',
            type: 'application/pdf',
            size: 1024000,
            url: '/uploads/math_problem.pdf'
          }
        ]
      },
      {
        id: '6',
        content: 'Thanks for sharing! This looks challenging.',
        senderId: session.user.id,
        senderName: session.user.name,
        senderAvatar: (session.user as any).image,
        timestamp: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
        type: 'text',
        reactions: {
          '👍': ['2']
        },
        isEdited: false,
        isDeleted: false,
        attachments: []
      },
      {
        id: '7',
        content: 'No problem! Let me know if you need help with it.',
        senderId: '2',
        senderName: 'John Doe',
        senderAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face',
        timestamp: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
        type: 'text',
        reactions: {},
        isEdited: false,
        isDeleted: false,
        attachments: []
      },
      {
        id: '8',
        content: 'Will do! Thanks again.',
        senderId: session.user.id,
        senderName: session.user.name,
        senderAvatar: (session.user as any).image,
        timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
        type: 'text',
        reactions: {},
        isEdited: false,
        isDeleted: false,
        attachments: []
      }
      ];

      return NextResponse.json({ messages });
    }
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { chatId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { chatId } = params;
    const body = await request.json();
    const { content, type = 'text', replyTo, attachments } = body;

    // Validate required fields
    if (!content && !attachments) {
      return NextResponse.json({ error: 'Message content is required' }, { status: 400 });
    }

    // Mock message creation - replace with actual database operations
    const newMessage = {
      id: Date.now().toString(),
      content,
      senderId: session.user.id,
      senderName: session.user.name,
      senderAvatar: (session.user as any).image,
      timestamp: new Date().toISOString(),
      type,
      replyTo,
      reactions: {},
      isEdited: false,
      isDeleted: false,
      attachments: attachments || []
    };

    // Here you would typically:
    // 1. Save the message to the database
    // 2. Update the chat's lastMessage and updatedAt
    // 3. Send real-time updates to connected clients
    // 4. Handle file uploads if attachments are present

    return NextResponse.json({ message: newMessage }, { status: 201 });
  } catch (error) {
    console.error('Error creating message:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}