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

    const now = new Date();

    // Get active challenges (this would be from a challenges table in a real app)
    // For now, we'll create some sample challenges
    const challenges = [
      {
        id: 'weekly-streak-challenge',
        title: 'Weekly Streak Challenge',
        description: 'Maintain a 7-day study streak to earn bonus points!',
        type: 'STREAK',
        target: 7,
        reward: 100,
        startDate: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
        endDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        isActive: true,
        participants: 45,
        icon: '🔥',
        progress: 3,
        isCompleted: false,
        progressPercentage: 43
      },
      {
        id: 'monthly-master',
        title: 'Monthly Master Challenge',
        description: 'Study for 20 days this month and become a Monthly Master!',
        type: 'STUDY_DAYS',
        target: 20,
        reward: 250,
        startDate: new Date(now.getFullYear(), now.getMonth(), 1), // Start of month
        endDate: new Date(now.getFullYear(), now.getMonth() + 1, 0), // End of month
        isActive: true,
        participants: 23,
        icon: '👑',
        progress: 8,
        isCompleted: false,
        progressPercentage: 40
      },
      {
        id: 'weekend-warrior',
        title: 'Weekend Warrior',
        description: 'Study on both Saturday and Sunday to earn the Weekend Warrior badge!',
        type: 'WEEKEND_STREAK',
        target: 2,
        reward: 75,
        startDate: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        endDate: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
        isActive: true,
        participants: 18,
        icon: '⚡',
        progress: 1,
        isCompleted: false,
        progressPercentage: 50
      }
    ];

    return NextResponse.json({
      success: true,
      challenges: challenges
    });

  } catch (error) {
    console.error('Error fetching streak challenges:', error);
    return NextResponse.json(
      { error: 'Failed to fetch challenges data' },
      { status: 500 }
    );
  }
}
