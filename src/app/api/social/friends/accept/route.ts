import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { GamificationService } from '@/lib/gamification';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { connectionId } = await request.json();
    
    if (!connectionId) {
      return NextResponse.json({ error: 'Connection ID is required' }, { status: 400 });
    }

    const result = await GamificationService.acceptFriendRequest(
      connectionId,
      session.user.id
    );
    
    return NextResponse.json({ success: true, result });
  } catch (error: any) {
    console.error('Error accepting friend request:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to accept friend request' },
      { status: 400 }
    );
  }
}
