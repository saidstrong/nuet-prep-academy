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

    const { eventId, teamId } = await request.json();
    
    if (!eventId) {
      return NextResponse.json({ error: 'Event ID is required' }, { status: 400 });
    }

    const participation = await GamificationService.joinEvent(
      eventId,
      session.user.id,
      teamId
    );
    
    return NextResponse.json({ success: true, participation });
  } catch (error: any) {
    console.error('Error joining event:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to join event' },
      { status: 400 }
    );
  }
}
