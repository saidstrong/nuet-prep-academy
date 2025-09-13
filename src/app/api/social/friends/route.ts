import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { GamificationService } from '@/lib/gamification';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const friends = await GamificationService.getFriendsList(session.user.id);
    
    return NextResponse.json({ friends });
  } catch (error) {
    console.error('Error fetching friends:', error);
    return NextResponse.json(
      { error: 'Failed to fetch friends' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { friendEmail, message } = await request.json();
    
    if (!friendEmail) {
      return NextResponse.json({ error: 'Friend email is required' }, { status: 400 });
    }

    const connection = await GamificationService.sendFriendRequest(
      session.user.id,
      friendEmail,
      message
    );
    
    return NextResponse.json({ connection });
  } catch (error: any) {
    console.error('Error sending friend request:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to send friend request' },
      { status: 400 }
    );
  }
}
