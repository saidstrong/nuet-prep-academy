import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { GamificationService } from '@/lib/gamification';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !['OWNER', 'ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const challenges = await prisma.challenge.findMany({
      include: {
        event: {
          select: {
            id: true,
            name: true,
            type: true,
            status: true
          }
        },
        _count: {
          select: {
            submissions: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({ 
      success: true, 
      challenges 
    });
  } catch (error: any) {
    console.error('Error fetching challenges:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch challenges' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !['OWNER', 'ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { 
      name, 
      description, 
      type, 
      startDate, 
      endDate, 
      rules, 
      rewards, 
      eventId, 
      maxParticipants,
      hasQuiz,
      quiz
    } = await request.json();
    
    if (!name || !description || !type || !startDate || !endDate) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const challenge = await GamificationService.createChallenge(
      name,
      description,
      type,
      new Date(startDate),
      new Date(endDate),
      rules,
      rewards,
      eventId && eventId.trim() !== '' ? eventId : null,
      maxParticipants,
      hasQuiz,
      quiz
    );
    
    return NextResponse.json({ success: true, challenge });
  } catch (error: any) {
    console.error('Error creating challenge:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    return NextResponse.json(
      { error: error.message || 'Failed to create challenge' },
      { status: 500 }
    );
  }
}
