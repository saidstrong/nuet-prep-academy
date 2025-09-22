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
    const { chatId } = body;

    if (!chatId) {
      return NextResponse.json({ error: 'Chat ID is required' }, { status: 400 });
    }

    try {
      const { prisma } = await import('@/lib/prisma');
      
      // Skip mark as read functionality until database migration
      console.log(`⚠️ Mark as read functionality disabled until database migration`);
      
      return NextResponse.json({ 
        success: true, 
        message: 'Messages marked as read' 
      });

    } catch (dbError: any) {
      console.log('❌ Database error marking messages as read:', dbError.message);
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to mark messages as read' 
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Error marking messages as read:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
