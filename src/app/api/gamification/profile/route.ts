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

    // Get user's gamification profile
    const profile = await GamificationService.getUserProfile(session.user.id);

    // Get leaderboard data
    const [pointsLeaderboard, courseCompletionLeaderboard, testScoresLeaderboard, studyTimeLeaderboard, streakLeaderboard] = await Promise.all([
      GamificationService.getLeaderboard('POINTS', 'ALL_TIME', 50),
      GamificationService.getLeaderboard('COURSE_COMPLETION', 'ALL_TIME', 50),
      GamificationService.getLeaderboard('TEST_SCORES', 'ALL_TIME', 50),
      GamificationService.getLeaderboard('STUDY_TIME', 'ALL_TIME', 50),
      GamificationService.getLeaderboard('STREAK', 'ALL_TIME', 50)
    ]);

    return NextResponse.json({
      ...profile,
      leaderboards: {
        points: pointsLeaderboard,
        courseCompletion: courseCompletionLeaderboard,
        testScores: testScoresLeaderboard,
        studyTime: studyTimeLeaderboard,
        streak: streakLeaderboard
      }
    });

  } catch (error) {
    console.error('Error fetching gamification profile:', error);
    return NextResponse.json(
      { error: 'Failed to fetch gamification profile' },
      { status: 500 }
    );
  }
}
