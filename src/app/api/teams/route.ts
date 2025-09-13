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

    const { name, description, logo, maxMembers } = await request.json();
    
    if (!name) {
      return NextResponse.json({ error: 'Team name is required' }, { status: 400 });
    }

    const team = await GamificationService.createTeam(
      session.user.id,
      name,
      description,
      logo,
      maxMembers || 10
    );
    
    return NextResponse.json({ success: true, team });
  } catch (error: any) {
    console.error('Error creating team:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create team' },
      { status: 400 }
    );
  }
}
