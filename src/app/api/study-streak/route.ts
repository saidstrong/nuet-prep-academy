import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in' },
        { status: 401 }
      );
    }

    // Get user's study activities from the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Get material progress activities
    const materialActivities = await prisma.materialProgress.findMany({
      where: {
        studentId: session.user.id,
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
        studentId: session.user.id,
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

    // Calculate weekly and monthly stats
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weekStudyDays = studyDays.filter(day => new Date(day) >= weekAgo).length;

    const monthAgo = new Date();
    monthAgo.setDate(monthAgo.getDate() - 30);
    const monthStudyDays = studyDays.filter(day => new Date(day) >= monthAgo).length;

    // Get streak milestones and rewards
    const getStreakMilestones = (streak: number) => {
      const milestones = [];
      
      if (streak >= 3) milestones.push({ name: 'Getting Started', icon: '🔥', days: 3 });
      if (streak >= 7) milestones.push({ name: 'Week Warrior', icon: '⚡', days: 7 });
      if (streak >= 14) milestones.push({ name: 'Two Week Champion', icon: '🏆', days: 14 });
      if (streak >= 30) milestones.push({ name: 'Monthly Master', icon: '👑', days: 30 });
      if (streak >= 60) milestones.push({ name: 'Dedication Legend', icon: '🌟', days: 60 });
      if (streak >= 100) milestones.push({ name: 'Century Scholar', icon: '💎', days: 100 });
      
      return milestones;
    };

    const currentMilestones = getStreakMilestones(currentStreak);
    const longestMilestones = getStreakMilestones(longestStreak);

    // Calculate next milestone
    const nextMilestone = [3, 7, 14, 30, 60, 100].find(milestone => milestone > currentStreak);
    const daysToNextMilestone = nextMilestone ? nextMilestone - currentStreak : 0;

    // Get recent activity (last 7 days)
    const recentActivity = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toDateString();
      const hasActivity = studyDays.includes(dateStr);
      
      recentActivity.push({
        date: dateStr,
        day: date.toLocaleDateString('en-US', { weekday: 'short' }),
        hasActivity,
        isToday: i === 0
      });
    }

    return NextResponse.json({
      success: true,
      streak: {
        current: currentStreak,
        longest: longestStreak,
        weekly: weekStudyDays,
        monthly: monthStudyDays,
        totalStudyDays: studyDays.length,
        milestones: {
          current: currentMilestones,
          longest: longestMilestones
        },
        nextMilestone: nextMilestone ? {
          days: nextMilestone,
          daysRemaining: daysToNextMilestone,
          name: nextMilestone === 3 ? 'Getting Started' :
                nextMilestone === 7 ? 'Week Warrior' :
                nextMilestone === 14 ? 'Two Week Champion' :
                nextMilestone === 30 ? 'Monthly Master' :
                nextMilestone === 60 ? 'Dedication Legend' : 'Century Scholar'
        } : null,
        recentActivity
      }
    });

  } catch (error: any) {
    console.error('Study streak error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch study streak data',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
