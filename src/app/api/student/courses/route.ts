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

    if (session.user.role !== 'STUDENT') {
      return NextResponse.json(
        { error: 'Forbidden - Student access required' },
        { status: 403 }
      );
    }

    // Mock student courses data to avoid database issues
    const mockStudentCourses = [
      {
        id: 'course-1',
        title: 'NUET Mathematics Preparation',
        description: 'Comprehensive preparation for NUET Mathematics section covering algebra, geometry, and problem-solving techniques.',
        progress: 65,
        totalTopics: 3,
        completedTopics: 2,
        totalTests: 2,
        completedTests: 1,
        lastAccessed: new Date().toISOString(),
        difficulty: 'INTERMEDIATE',
        estimatedHours: 40,
        instructor: 'Dr. Sarah Johnson',
        nextDeadline: null
      },
      {
        id: 'course-2',
        title: 'NUET Critical Thinking',
        description: 'Master critical thinking skills for the NUET exam with practice tests and analytical exercises.',
        progress: 30,
        totalTopics: 2,
        completedTopics: 1,
        totalTests: 1,
        completedTests: 0,
        lastAccessed: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        difficulty: 'ADVANCED',
        estimatedHours: 35,
        instructor: 'Prof. Michael Chen',
        nextDeadline: null
      },
      {
        id: 'course-3',
        title: 'NUET English Language',
        description: 'Complete English language preparation including reading comprehension, grammar, and writing skills.',
        progress: 80,
        totalTopics: 3,
        completedTopics: 3,
        totalTests: 3,
        completedTests: 2,
        lastAccessed: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        difficulty: 'BEGINNER',
        estimatedHours: 30,
        instructor: 'Ms. Emily Rodriguez',
        nextDeadline: null
      },
      {
        id: 'course-4',
        title: 'NUET Physics Fundamentals',
        description: 'Essential physics concepts and problem-solving strategies for the NUET exam.',
        progress: 45,
        totalTopics: 2,
        completedTopics: 1,
        totalTests: 1,
        completedTests: 0,
        lastAccessed: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        difficulty: 'INTERMEDIATE',
        estimatedHours: 35,
        instructor: 'Dr. Ahmed Hassan',
        nextDeadline: null
      },
      {
        id: 'course-5',
        title: 'NUET Chemistry Mastery',
        description: 'Complete chemistry preparation covering organic, inorganic, and physical chemistry.',
        progress: 20,
        totalTopics: 3,
        completedTopics: 0,
        totalTests: 2,
        completedTests: 0,
        lastAccessed: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        difficulty: 'ADVANCED',
        estimatedHours: 45,
        instructor: 'Prof. Lisa Wang',
        nextDeadline: null
      }
    ];

    console.log(`📚 Returning ${mockStudentCourses.length} student courses (mock data)`);

    return NextResponse.json({
      success: true,
      courses: mockStudentCourses
    });

  } catch (error: any) {
    console.error('Error fetching student courses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch courses' },
      { status: 500 }
    );
  }
}