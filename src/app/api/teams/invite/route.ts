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

    const { teamId, invitedUserEmail, message } = await request.json();
    
    if (!teamId || !invitedUserEmail) {
      return NextResponse.json({ error: 'Team ID and invited user email are required' }, { status: 400 });
    }

    const invitation = await GamificationService.inviteToTeam(
      teamId,
      session.user.id,
      invitedUserEmail,
      message
    );
    
    return NextResponse.json({ success: true, invitation });
  } catch (error: any) {
    console.error('Error inviting to team:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to send invitation' },
      { status: 400 }
    );
  }
}
