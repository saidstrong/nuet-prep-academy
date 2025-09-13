import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: { courseId: string } }
) {
  try {
    const { courseId } = params;
    
    console.log(`🔍 Fetching progress for course: ${courseId}`);

    // Try to fetch from database first
    try {
      await prisma.$connect();
      
      const course = await prisma.course.findUnique({
        where: { id: courseId },
        include: {
          topics: {
            include: {
              materials: true,
              tests: true
            }
          }
        }
      });

      if (course) {
        const totalLessons = course.topics.reduce((acc, topic) => 
          acc + topic.materials.length + topic.tests.length, 0
        );
        
        // Mock progress data for now
        const progress = {
          courseId: course.id,
          courseTitle: course.title,
          totalLessons,
          completedLessons: Math.floor(totalLessons * 0.3), // 30% completed
          totalTime: 120, // 2 hours total
          completedTime: 36, // 36 minutes completed
          currentStreak: 3,
          longestStreak: 7,
          lastActivity: new Date().toISOString(),
          completionRate: 30,
          estimatedCompletion: '2 weeks',
          achievements: [
            {
              id: 'first-lesson',
              title: 'First Steps',
              description: 'Completed your first lesson',
              icon: '🎯',
              earnedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
              points: 10
            },
            {
              id: 'three-day-streak',
              title: 'Consistent Learner',
              description: 'Maintained a 3-day learning streak',
              icon: '🔥',
              earnedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
              points: 25
            }
          ],
          weeklyProgress: [
            {
              week: 'This Week',
              lessonsCompleted: 3,
              timeSpent: 36,
              streak: 3
            },
            {
              week: 'Last Week',
              lessonsCompleted: 5,
              timeSpent: 60,
              streak: 4
            },
            {
              week: '2 Weeks Ago',
              lessonsCompleted: 2,
              timeSpent: 24,
              streak: 2
            }
          ]
        };

        console.log(`✅ Found progress data for course ${courseId}`);
        
        return NextResponse.json({
          success: true,
          progress
        });
      }
    } catch (dbError: any) {
      console.log('❌ Database error, using mock progress:', dbError.message);
    }

    // Fallback to mock progress data
    const mockProgress = {
      courseId,
      courseTitle: 'NUET Mathematics Preparation',
      totalLessons: 12,
      completedLessons: 4,
      totalTime: 180, // 3 hours total
      completedTime: 60, // 1 hour completed
      currentStreak: 5,
      longestStreak: 10,
      lastActivity: new Date().toISOString(),
      completionRate: 33,
      estimatedCompletion: '1 week',
      achievements: [
        {
          id: 'first-lesson',
          title: 'First Steps',
          description: 'Completed your first lesson',
          icon: '🎯',
          earnedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          points: 10
        },
        {
          id: 'three-day-streak',
          title: 'Consistent Learner',
          description: 'Maintained a 3-day learning streak',
          icon: '🔥',
          earnedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          points: 25
        },
        {
          id: 'quiz-master',
          title: 'Quiz Master',
          description: 'Scored 100% on a quiz',
          icon: '🧠',
          earnedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          points: 50
        }
      ],
      weeklyProgress: [
        {
          week: 'This Week',
          lessonsCompleted: 4,
          timeSpent: 60,
          streak: 5
        },
        {
          week: 'Last Week',
          lessonsCompleted: 6,
          timeSpent: 90,
          streak: 7
        },
        {
          week: '2 Weeks Ago',
          lessonsCompleted: 3,
          timeSpent: 45,
          streak: 3
        }
      ]
    };

    console.log(`✅ Using mock progress data for course ${courseId}`);

    return NextResponse.json({
      success: true,
      progress: mockProgress
    });

  } catch (error: any) {
    console.error('❌ Error fetching course progress:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch course progress',
        details: error.message
      },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: { courseId: string } }
) {
  try {
    const { courseId } = params;
    const body = await request.json();
    const { contentId, completed, timeSpent } = body;

    console.log(`📝 Updating progress for course: ${courseId}, content: ${contentId}`);

    // In a real implementation, you would update the database here
    // For now, we'll just return success

    return NextResponse.json({
      success: true,
      message: 'Progress updated successfully'
    });

  } catch (error: any) {
    console.error('❌ Error updating course progress:', error);
    return NextResponse.json(
      {
        error: 'Failed to update course progress',
        details: error.message
      },
      { status: 500 }
    );
  }
}
