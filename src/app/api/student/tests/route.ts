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

    if (session.user.role !== 'STUDENT') {
      return NextResponse.json(
        { error: 'Forbidden - Student access required' },
        { status: 403 }
      );
    }

    // Sample test data
    const tests = [
      {
        id: '1',
        title: 'Calculus Integration Test',
        courseTitle: 'Advanced Mathematics',
        score: 85,
        maxScore: 100,
        status: 'EXCELLENT',
        submittedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        duration: 90,
        difficulty: 'HARD',
        retakeAvailable: true
      },
      {
        id: '2',
        title: 'Mechanics Quiz',
        courseTitle: 'Physics Fundamentals',
        score: 72,
        maxScore: 100,
        status: 'GOOD',
        submittedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        duration: 60,
        difficulty: 'MEDIUM',
        retakeAvailable: true
      },
      {
        id: '3',
        title: 'Algebra Assessment',
        courseTitle: 'Advanced Mathematics',
        score: 95,
        maxScore: 100,
        status: 'EXCELLENT',
        submittedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        duration: 45,
        difficulty: 'EASY',
        retakeAvailable: false
      },
      {
        id: '4',
        title: 'Thermodynamics Test',
        courseTitle: 'Physics Fundamentals',
        score: 68,
        maxScore: 100,
        status: 'SATISFACTORY',
        submittedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        duration: 75,
        difficulty: 'HARD',
        retakeAvailable: true
      },
      {
        id: '5',
        title: 'Basic Chemistry Quiz',
        courseTitle: 'Chemistry Basics',
        score: 78,
        maxScore: 100,
        status: 'GOOD',
        submittedAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
        duration: 30,
        difficulty: 'EASY',
        retakeAvailable: true
      }
    ];

    return NextResponse.json({
      success: true,
      tests: tests
    });

  } catch (error: any) {
    console.error('Error fetching student tests:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tests' },
      { status: 500 }
    );
  }
}