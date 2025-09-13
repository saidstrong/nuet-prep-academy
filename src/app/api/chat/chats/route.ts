import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Mock data - replace with actual database queries
    const chats = [
      {
        id: '1',
        name: 'John Doe',
        type: 'direct',
        participants: [
          {
            id: session.user.id,
            name: session.user.name,
            avatar: (session.user as any).image,
            role: 'user',
            status: 'online',
            lastSeen: new Date().toISOString()
          },
          {
            id: '2',
            name: 'John Doe',
            avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face',
            role: 'user',
            status: 'online',
            lastSeen: new Date().toISOString()
          }
        ],
        lastMessage: {
          id: '1',
          content: 'Hey, how are you doing?',
          senderId: '2',
          senderName: 'John Doe',
          timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
          type: 'text'
        },
        unreadCount: 2,
        isPinned: false,
        isMuted: false,
        isArchived: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
        updatedAt: new Date(Date.now() - 1000 * 60 * 5).toISOString()
      },
      {
        id: '2',
        name: 'NUET Prep Study Group',
        type: 'group',
        participants: [
          {
            id: session.user.id,
            name: session.user.name,
            avatar: (session.user as any).image,
            role: 'admin',
            status: 'online',
            lastSeen: new Date().toISOString()
          },
          {
            id: '3',
            name: 'Alice Smith',
            avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=32&h=32&fit=crop&crop=face',
            role: 'member',
            status: 'online',
            lastSeen: new Date().toISOString()
          },
          {
            id: '4',
            name: 'Bob Johnson',
            avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=32&h=32&fit=crop&crop=face',
            role: 'member',
            status: 'away',
            lastSeen: new Date(Date.now() - 1000 * 60 * 30).toISOString()
          }
        ],
        lastMessage: {
          id: '2',
          content: 'Great job on the practice test!',
          senderId: '3',
          senderName: 'Alice Smith',
          timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
          type: 'text'
        },
        unreadCount: 0,
        isPinned: true,
        isMuted: false,
        isArchived: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
        updatedAt: new Date(Date.now() - 1000 * 60 * 15).toISOString()
      },
      {
        id: '3',
        name: 'Course Support',
        type: 'support',
        participants: [
          {
            id: session.user.id,
            name: session.user.name,
            avatar: (session.user as any).image,
            role: 'user',
            status: 'online',
            lastSeen: new Date().toISOString()
          },
          {
            id: '5',
            name: 'Support Team',
            avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=32&h=32&fit=crop&crop=face',
            role: 'support',
            status: 'online',
            lastSeen: new Date().toISOString()
          }
        ],
        lastMessage: {
          id: '3',
          content: 'Your issue has been resolved. Please check your account.',
          senderId: '5',
          senderName: 'Support Team',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
          type: 'text'
        },
        unreadCount: 0,
        isPinned: false,
        isMuted: false,
        isArchived: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
        updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString()
      }
    ];

    return NextResponse.json({ chats });
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