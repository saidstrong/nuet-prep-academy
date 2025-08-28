import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(
  request: Request,
  { params }: { params: { chatId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { chatId } = params;

    const { prisma } = await import('@/lib/prisma');

    // Check if user is a participant in this chat
    const chatParticipant = await prisma.chatParticipant.findFirst({
      where: {
        chatId,
        userId: session.user.id,
      },
    });

    if (!chatParticipant) {
      return NextResponse.json({
        success: false,
        message: 'You are not a participant in this chat',
      }, { status: 403 });
    }

    // Get messages for this chat
    const messages = await prisma.message.findMany({
      where: {
        chatId,
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            role: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    return NextResponse.json({
      success: true,
      messages,
    });

  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json({
      success: false,
      message: 'An error occurred while fetching messages',
    }, { status: 500 });
  }
}
