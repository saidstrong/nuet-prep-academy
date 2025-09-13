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

    const { type, id, message, receiverId } = await request.json();
    
    if (!type || !id) {
      return NextResponse.json({ error: 'Type and ID are required' }, { status: 400 });
    }

    let interaction;
    
    if (type === 'achievement') {
      interaction = await GamificationService.shareAchievement(
        session.user.id,
        id,
        message,
        receiverId
      );
    } else if (type === 'badge') {
      interaction = await GamificationService.shareBadge(
        session.user.id,
        id,
        message,
        receiverId
      );
    } else {
      return NextResponse.json({ error: 'Invalid type. Use "achievement" or "badge"' }, { status: 400 });
    }
    
    return NextResponse.json({ success: true, interaction });
  } catch (error: any) {
    console.error('Error sharing:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to share' },
      { status: 400 }
    );
  }
}
