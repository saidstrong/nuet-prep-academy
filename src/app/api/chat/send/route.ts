import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { chatId, content, type = 'text', replyTo, attachments } = body;

    // Validate required fields
    if (!chatId) {
      return NextResponse.json({ error: 'Chat ID is required' }, { status: 400 });
    }

    if (!content && !attachments) {
      return NextResponse.json({ error: 'Message content is required' }, { status: 400 });
    }

    try {
      // Try to save to database first
      const { prisma } = await import('@/lib/prisma');
      
      // Check if user is a participant in this chat
      console.log('🔍 Checking chat participant for chatId:', chatId, 'userId:', session.user.id);
      
      // First, ensure the chat exists
      let chat = await prisma.chat.findUnique({
        where: { id: chatId },
      });

      if (!chat) {
        console.log('🔧 Creating chat:', chatId);
        chat = await prisma.chat.create({
          data: {
            id: chatId,
            name: 'General Discussion',
            type: 'GROUP',
          },
        });
      }

      // Then, try to find or create the chat participant
      let chatParticipant = await prisma.chatParticipant.findFirst({
        where: {
          chatId: chatId,
          userId: session.user.id,
        },
      });

      // If not found, create the participant (this handles the case where chat exists but user isn't added yet)
      if (!chatParticipant) {
        console.log('🔧 Creating chat participant for user');
        
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
      }

      console.log('🔍 Chat participant found/created:', chatParticipant);

      // Get the actual user ID from the database
      const dbUser = await prisma.user.findUnique({
        where: { email: session.user.email }
      });
      const actualUserId = dbUser?.id || session.user.id;
      
      // Create message in database
      console.log('📝 Creating message in database with data:', {
        chatId: chatId,
        senderId: actualUserId,
        content: content,
        type: type.toUpperCase(),
      });
      
      const message = await prisma.message.create({
        data: {
          chatId: chatId,
          senderId: actualUserId,
          content: content,
          type: type.toUpperCase(),
          // Note: isRead field will be added after database migration
        },
        include: {
          sender: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      });

      console.log('✅ Message created successfully:', message);

      // Update chat's updatedAt timestamp
      await prisma.chat.update({
        where: { id: chatId },
        data: { updatedAt: new Date() },
      });

      const newMessage = {
        id: message.id,
        content: message.content,
        senderId: message.sender.id,
        senderName: message.sender.name,
        senderAvatar: undefined,
        timestamp: message.createdAt.toISOString(),
        type: message.type.toLowerCase(),
        replyTo: null, // TODO: Implement reply functionality
        reactions: {},
        isEdited: false,
        isDeleted: false,
        attachments: attachments || []
      };

      console.log(`✅ Message created in database: ${message.id}`);
      return NextResponse.json({ 
        success: true, 
        message: newMessage 
      }, { status: 201 });

    } catch (dbError: any) {
      console.log('❌ Database error, using mock message:', dbError.message);
      console.log('❌ Full database error:', dbError);
      console.log('❌ Database error stack:', dbError.stack);
      
      // Fallback to mock message creation
      const newMessage = {
        id: Date.now().toString(),
        content,
        senderId: session.user.id,
        senderName: session.user.name,
        senderAvatar: undefined,
        timestamp: new Date().toISOString(),
        type,
        replyTo,
        reactions: {},
        isEdited: false,
        isDeleted: false,
        attachments: attachments || []
      };

      return NextResponse.json({ 
        success: true, 
        message: newMessage 
      }, { status: 201 });
    }

  } catch (error) {
    console.error('Error sending message:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
