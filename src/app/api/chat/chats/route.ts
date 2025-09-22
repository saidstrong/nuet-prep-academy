import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('🔍 Fetching chats for user:', session.user.id, session.user.name, session.user.role);

    try {
      // Try to fetch from database first
      const { prisma } = await import('@/lib/prisma');
      
      const userChats = await prisma.chat.findMany({
        where: {
          participants: {
            some: {
              userId: session.user.id
            }
          }
        },
        include: {
          participants: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  role: true
                }
              }
            }
          },
          messages: {
            orderBy: {
              createdAt: 'desc'
            },
            take: 1,
            include: {
              sender: {
                select: {
                  id: true,
                  name: true,
                  email: true
                }
              }
            }
          }
        },
        orderBy: {
          updatedAt: 'desc'
        }
      });

      const chats = userChats.map(chat => ({
        id: chat.id,
        name: chat.name,
        type: chat.type.toLowerCase(),
        participants: chat.participants.map(p => ({
          id: p.user.id,
          name: p.user.name,
          avatar: undefined,
          role: p.user.role, // Keep original case
          status: 'online', // Mock status
          lastSeen: new Date().toISOString()
        })),
        lastMessage: chat.messages[0] ? {
          id: chat.messages[0].id,
          content: chat.messages[0].content,
          senderId: chat.messages[0].sender.id,
          senderName: chat.messages[0].sender.name,
          senderAvatar: undefined,
          timestamp: chat.messages[0].createdAt.toISOString(),
          type: chat.messages[0].type.toLowerCase(),
          reactions: {},
          isEdited: false,
          isDeleted: false,
          attachments: []
        } : null,
          unreadCount: Math.floor(Math.random() * 5), // Mock unread count for testing
        isPinned: false,
        isMuted: false,
        isArchived: false,
        createdAt: chat.createdAt.toISOString(),
        updatedAt: chat.updatedAt.toISOString()
      }));

      console.log(`✅ Found ${chats.length} chats from database`);
      
      // If no chats exist, create a default one
      if (chats.length === 0) {
        console.log('🔧 No chats found, creating default chat...');
        
        // Create a default chat
        const defaultChat = await prisma.chat.create({
          data: {
            id: '1',
            name: 'General Discussion',
            type: 'GROUP',
          },
        });
        
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
        
        // Add current user as participant
        await prisma.chatParticipant.create({
          data: {
            chatId: defaultChat.id,
            userId: actualUserId,
            isAdmin: true,
          },
        });
        
        // Create a welcome message
        await prisma.message.create({
          data: {
            chatId: defaultChat.id,
            senderId: actualUserId,
            content: 'Welcome to the NUET Prep Academy chat!',
            type: 'TEXT',
            // Note: reactions, isEdited, isDeleted fields will be added when database is migrated
          },
        });
        
        console.log('✅ Default chat created successfully');
        
        // Return the newly created chat
        return NextResponse.json({ 
          chats: [{
            id: defaultChat.id,
            name: defaultChat.name,
            type: defaultChat.type.toLowerCase(),
            participants: [{
              id: session.user.id,
              name: session.user.name,
              avatar: undefined,
              role: session.user.role,
              status: 'online',
              lastSeen: new Date().toISOString()
            }],
            lastMessage: {
              id: 'welcome-1',
              content: 'Welcome to the NUET Prep Academy chat!',
              senderId: session.user.id,
              senderName: session.user.name,
              senderAvatar: undefined,
              timestamp: new Date().toISOString(),
              type: 'text',
              reactions: {},
              isEdited: false,
              isDeleted: false,
              attachments: []
            },
            unreadCount: 0,
            isPinned: true,
            isMuted: false,
            isArchived: false,
            createdAt: defaultChat.createdAt.toISOString(),
            updatedAt: defaultChat.updatedAt.toISOString()
          }]
        });
      }
      
      return NextResponse.json({ chats });

    } catch (dbError: any) {
      console.log('❌ Database error, using mock chats:', dbError.message);
      console.log('❌ Full database error:', dbError);
      
      // Fallback to mock data
      const chats = [
        {
          id: '1',
          name: 'General Discussion',
          type: 'group',
          participants: [
            {
              id: session.user.id,
              name: session.user.name,
              avatar: undefined,
              role: session.user.role, // Use actual user role
              status: 'online',
              lastSeen: new Date().toISOString()
            },
            {
              id: '2',
              name: 'Jane Smith',
              avatar: undefined,
              role: 'STUDENT',
              status: 'offline',
              lastSeen: new Date(Date.now() - 300000).toISOString()
            }
          ],
          lastMessage: {
            id: '1',
            content: 'Hello everyone! How is everyone doing?',
            senderId: session.user.id,
            senderName: session.user.name,
            senderAvatar: undefined,
            timestamp: new Date(Date.now() - 60000).toISOString(),
            type: 'text',
            reactions: { '👍': ['2'] },
            isEdited: false,
            isDeleted: false,
            attachments: []
          },
          unreadCount: 0,
          isPinned: true,
          isMuted: false,
          isArchived: false,
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          updatedAt: new Date(Date.now() - 60000).toISOString()
        }
      ];

      console.log(`✅ Using ${chats.length} mock chats`);
      console.log('📋 Mock chats data:', chats);
      return NextResponse.json({ chats });
    }
  } catch (error) {
    console.error('Error fetching chats:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, type, participants, description } = body;

    // Validate required fields
    if (!name || !type || !participants) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Mock chat creation - replace with actual database operations
    const newChat = {
      id: Date.now().toString(),
      name,
      type,
      description,
      participants: [
        {
          id: session.user.id,
          name: session.user.name,
          avatar: (session.user as any).image,
          role: 'admin',
          status: 'online',
          lastSeen: new Date().toISOString()
        },
        ...participants.map((p: any) => ({
          ...p,
          role: 'member',
          status: 'offline',
          lastSeen: new Date().toISOString()
        }))
      ],
      lastMessage: null,
      unreadCount: 0,
      isPinned: false,
      isMuted: false,
      isArchived: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    return NextResponse.json({ chat: newChat }, { status: 201 });
  } catch (error) {
    console.error('Error creating chat:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
