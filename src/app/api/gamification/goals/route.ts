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

    // Sample learning goals data
    const goals = [
      {
        id: '1',
        title: 'Complete 5 courses this month',
        description: 'Finish 5 courses to improve your knowledge base',
        target: 5,
        current: 2,
        unit: 'courses',
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        category: 'COURSES_COMPLETED',
        isCompleted: false
      },
      {
        id: '2',
        title: 'Study for 20 hours this week',
        description: 'Dedicate 20 hours to focused study time',
        target: 20,
        current: 12,
        unit: 'hours',
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        category: 'STUDY_TIME',
        isCompleted: false
      },
      {
        id: '3',
        title: 'Take 10 tests',
        description: 'Complete 10 practice tests to assess your progress',
        target: 10,
        current: 6,
        unit: 'tests',
        deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        category: 'TESTS_TAKEN',
        isCompleted: false
      },
      {
        id: '4',
        title: 'Read 50 materials',
        description: 'Go through 50 study materials to expand knowledge',
        target: 50,
        current: 50,
        unit: 'materials',
        deadline: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        category: 'MATERIALS_READ',
        isCompleted: true
      }
    ];

    return NextResponse.json({
      success: true,
      goals: goals
    });

  } catch (error: any) {
    console.error('Error fetching learning goals:', error);
    return NextResponse.json(
      { error: 'Failed to fetch learning goals' },
      { status: 500 }
    );
  }
}