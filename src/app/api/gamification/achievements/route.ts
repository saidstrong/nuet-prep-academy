import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in' },
        { status: 401 }
      );
    }

    // Sample achievements data
    const achievements = [
      {
        id: '1',
        name: 'First Steps',
        description: 'Complete your first course',
        icon: '🎯',
        points: 50,
        unlockedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        category: 'MILESTONE'
      },
      {
        id: '2',
        name: 'Test Master',
        description: 'Score 90% or higher on 5 tests',
        icon: '🧠',
        points: 100,
        unlockedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        category: 'ACADEMIC'
      },
      {
        id: '3',
        name: 'Streak Keeper',
        description: 'Study for 7 consecutive days',
        icon: '🔥',
        points: 75,
        unlockedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        category: 'CONSISTENCY'
      },
      {
        id: '4',
        name: 'Speed Reader',
        description: 'Complete 20 materials in one day',
        icon: '⚡',
        points: 60,
        unlockedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        category: 'EFFICIENCY'
      },
      {
        id: '5',
        name: 'Knowledge Seeker',
        description: 'Complete 10 courses',
        icon: '🎓',
        points: 200,
        unlockedAt: null,
        category: 'MILESTONE'
      }
    ];

    return NextResponse.json({
      success: true,
      achievements: achievements
    });

  } catch (error: any) {
    console.error('Error fetching achievements:', error);
    return NextResponse.json(
      { error: 'Failed to fetch achievements' },
      { status: 500 }
    );
  }
}