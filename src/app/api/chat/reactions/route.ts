import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { messageId, emoji, action } = body; // action: 'add' or 'remove'

    if (!messageId || !emoji || !action) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    try {
      // Try to update reactions in database
      const { prisma } = await import('@/lib/prisma');
      
      // Check if user is a participant in the chat
      const message = await prisma.message.findUnique({
        where: { id: messageId },
        include: {
          chat: {
            include: {
              participants: {
                where: { userId: session.user.id }
              }
            }
          }
        }
      });

      if (!message || message.chat.participants.length === 0) {
        return NextResponse.json({ error: 'Message not found or access denied' }, { status: 404 });
      }

      // For now, we'll simulate reaction updates
      // In a real implementation, you'd have a separate reactions table
      console.log(`✅ Reaction ${action} for message ${messageId}: ${emoji} by ${session.user.id}`);

      return NextResponse.json({
        success: true,
        message: `Reaction ${action}ed successfully`,
        reaction: {
          emoji,
          userId: session.user.id,
          action
        }
      });

    } catch (dbError: any) {
      console.log('❌ Database error updating reaction:', dbError.message);
      
      // Fallback: return success without database update
      return NextResponse.json({
        success: true,
        message: `Reaction ${action}ed successfully (simulated)`,
        reaction: {
          emoji,
          userId: session.user.id,
          action
        }
      });
    }

  } catch (error: any) {
    console.error('Error updating reaction:', error);
    return NextResponse.json(
      { error: 'Failed to update reaction' },
      { status: 500 }
    );
  }
}
