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

    const { challengeId, content } = await request.json();
    
    if (!challengeId || !content) {
      return NextResponse.json({ error: 'Challenge ID and content are required' }, { status: 400 });
    }

    const submission = await GamificationService.submitChallenge(
      challengeId,
      session.user.id,
      content
    );
    
    return NextResponse.json({ success: true, submission });
  } catch (error: any) {
    console.error('Error submitting challenge:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to submit challenge' },
      { status: 400 }
    );
  }
}
