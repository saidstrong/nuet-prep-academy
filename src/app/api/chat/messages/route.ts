import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { chatId, content, type } = body;

    if (!chatId || !content || !type) {
      return NextResponse.json({
        success: false,
        message: 'Missing required fields',
      }, { status: 400 });
    }

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

    // Create message
    const message = await prisma.message.create({
      data: {
        chatId,
        senderId: session.user.id,
        content,
        type,
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
    });

    // Update chat's updatedAt timestamp
    await prisma.chat.update({
      where: { id: chatId },
      data: { updatedAt: new Date() },
    });

    return NextResponse.json({
      success: true,
      message: 'Message sent successfully',
      data: message,
    }, { status: 201 });

  } catch (error) {
    console.error('Error sending message:', error);
    return NextResponse.json({
      success: false,
      message: 'An error occurred while sending the message',
    }, { status: 500 });
  }
}
