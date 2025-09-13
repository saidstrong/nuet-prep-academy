import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'all'; // 'week', 'month', 'all'
    const limit = parseInt(searchParams.get('limit') || '50');

    // Get all students with their streak data
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const students = await prisma.user.findMany({
      where: {
        role: 'STUDENT'
      },
      select: {
        id: true,
        name: true,
        email: true,
        profile: {
          select: {
            avatar: true
          }
        }
      }
    });

    // Calculate streak data for each student
    const leaderboardData = await Promise.all(
      students.map(async (student) => {
        // Get material progress activities
        const materialActivities = await prisma.materialProgress.findMany({
          where: {
            studentId: student.id,
            lastAccessed: {
              gte: thirtyDaysAgo
            }
          },
          select: {
            lastAccessed: true,
            status: true
          }
        });

        // Get test submission activities
        const testActivities = await prisma.testSubmission.findMany({
          where: {
            studentId: student.id,
            submittedAt: {
              gte: thirtyDaysAgo
            }
          },
          select: {
            submittedAt: true
          }
        });

        // Combine and process activities
        const allActivities = [
          ...materialActivities.map(activity => ({
            date: new Date(activity.lastAccessed).toDateString(),
            type: 'material'
          })),
          ...testActivities.map(activity => ({
            date: new Date(activity.submittedAt).toDateString(),
            type: 'test'
          }))
        ];

        // Get unique study days
        const studyDays = [...new Set(allActivities.map(activity => activity.date))];
        
        // Calculate current streak
        const today = new Date().toDateString();
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toDateString();

        let currentStreak = 0;
        let longestStreak = 0;
        let tempStreak = 0;

        // Sort study days in descending order
        const sortedStudyDays = studyDays.sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

        // Calculate streaks
        for (let i = 0; i < sortedStudyDays.length; i++) {
          const studyDate = new Date(sortedStudyDays[i]);
          const prevDate = i > 0 ? new Date(sortedStudyDays[i - 1]) : null;
          
          if (i === 0) {
            // First day (most recent)
            if (sortedStudyDays[i] === today || sortedStudyDays[i] === yesterdayStr) {
              currentStreak = 1;
              tempStreak = 1;
            }
          } else if (prevDate) {
            const dayDiff = (studyDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24);
            
            if (dayDiff === 1) {
              // Consecutive day
              if (i === 1 && (sortedStudyDays[0] === today || sortedStudyDays[0] === yesterdayStr)) {
                currentStreak++;
              }
              tempStreak++;
            } else {
              // Streak broken
              longestStreak = Math.max(longestStreak, tempStreak);
              tempStreak = 1;
              if (i === 1 && (sortedStudyDays[0] === today || sortedStudyDays[0] === yesterdayStr)) {
                currentStreak = 1;
              } else {
                currentStreak = 0;
              }
            }
          }
        }

        longestStreak = Math.max(longestStreak, tempStreak);

        // Calculate period-specific stats
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        const weekStudyDays = studyDays.filter(day => new Date(day) >= weekAgo).length;

        const monthAgo = new Date();
        monthAgo.setDate(monthAgo.getDate() - 30);
        const monthStudyDays = studyDays.filter(day => new Date(day) >= monthAgo).length;

        // Determine ranking score based on period
        let rankingScore = 0;
        switch (period) {
          case 'week':
            rankingScore = weekStudyDays;
            break;
          case 'month':
            rankingScore = monthStudyDays;
            break;
          default:
            rankingScore = currentStreak;
            break;
        }

        return {
          id: student.id,
          name: student.name,
          email: student.email,
          avatar: student.profile?.avatar || null,
          currentStreak,
          longestStreak,
          weeklyStudyDays: weekStudyDays,
          monthlyStudyDays: monthStudyDays,
          totalStudyDays: studyDays.length,
          rankingScore,
          isCurrentUser: student.id === session.user.id
        };
      })
    );

    // Filter out students with no activity and sort by ranking score
    const activeStudents = leaderboardData
      .filter(student => student.rankingScore > 0)
      .sort((a, b) => b.rankingScore - a.rankingScore)
      .slice(0, limit);

    // Add rank to each student
    const rankedStudents = activeStudents.map((student, index) => ({
      ...student,
      rank: index + 1
    }));

    // Get current user's position if not in top results
    const currentUserRank = leaderboardData.find(student => student.isCurrentUser);
    const currentUserPosition = currentUserRank ? 
      leaderboardData
        .filter(student => student.rankingScore > 0)
        .sort((a, b) => b.rankingScore - a.rankingScore)
        .findIndex(student => student.id === currentUserRank.id) + 1 : null;

    return NextResponse.json({
      success: true,
      leaderboard: {
        period,
        students: rankedStudents,
        currentUserPosition,
        totalStudents: leaderboardData.filter(student => student.rankingScore > 0).length,
        currentUser: currentUserRank
      }
    });

  } catch (error: any) {
    console.error('Streak leaderboard error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch leaderboard data',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
