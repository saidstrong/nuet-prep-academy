import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET() {
  try {
    // Check if user is authenticated and is a student
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'STUDENT') {
      return NextResponse.json(
        { error: 'Unauthorized - Student access required' },
        { status: 401 }
      );
    }

    const { prisma } = await import('@/lib/prisma');

    // Fetch test submissions for the student
    const submissions = await prisma.testSubmission.findMany({
      where: {
        studentId: session.user.id
      },
      include: {
        test: {
          include: {
            topic: {
              include: {
                course: {
                  select: {
                    title: true
                  }
                }
              }
            }
          }
        }
      },
      orderBy: { submittedAt: 'desc' }
    });

    // Transform the data to include test information
    const transformedTests = submissions.map(submission => {
      const test = submission.test;
      const percentage = test.totalPoints > 0 ? Math.round((submission.score / test.totalPoints) * 100) : 0;

      // Determine status based on percentage
      let status = 'FAILED';
      if (percentage >= 80) status = 'EXCELLENT';
      else if (percentage >= 70) status = 'GOOD';
      else if (percentage >= 60) status = 'SATISFACTORY';
      else if (percentage >= 50) status = 'PASSED';

      return {
        id: submission.id,
        title: test.title,
        courseTitle: test.topic.course.title,
        score: submission.score,
        maxScore: test.totalPoints,
        status,
        submittedAt: submission.submittedAt.toISOString(),
        duration: test.duration
      };
    });

    return NextResponse.json({
      success: true,
      tests: transformedTests,
      total: transformedTests.length
    });

  } catch (error) {
    console.error('Error fetching student tests:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch student tests',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
