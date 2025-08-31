import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(
  request: Request,
  { params }: { params: { testId: string } }
) {
  try {
    // Check if user is authenticated and is a student
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'STUDENT') {
      return NextResponse.json(
        { error: 'Unauthorized - Student access required' },
        { status: 401 }
      );
    }

    const { testId } = params;

    if (!testId) {
      return NextResponse.json(
        { error: 'Test ID is required' },
        { status: 400 }
      );
    }

    const { prisma } = await import('@/lib/prisma');

    // Fetch the test submission with detailed results
    const submission = await prisma.testSubmission.findFirst({
      where: {
        testId,
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
                },
                questions: {
                  include: {
                    options: true
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!submission) {
      return NextResponse.json(
        { error: 'Test submission not found' },
        { status: 404 }
      );
    }

    // Transform the data for the frontend
    const result = {
      id: submission.id,
      test: {
        id: submission.test.id,
        title: submission.test.title,
        description: submission.test.description,
        duration: submission.test.duration,
        totalPoints: submission.test.totalPoints,
        topic: {
          title: submission.test.topic.title,
          course: {
            title: submission.test.topic.course.title
          }
        },
        questions: submission.test.topic.questions.map(question => ({
          id: question.id,
          text: question.text,
          type: question.type,
          difficulty: question.difficulty,
          points: question.points,
          options: question.options.map(opt => opt.text),
          correctAnswer: question.correctAnswer,
          explanation: question.explanation
        }))
      },
      score: submission.score,
      maxScore: submission.test.totalPoints,
      submittedAt: submission.submittedAt.toISOString(),
      timeSpent: submission.timeSpent,
      answers: (submission.answers as any[]).map(answer => ({
        questionId: answer.questionId,
        answer: answer.answer,
        isCorrect: answer.isCorrect,
        pointsEarned: answer.pointsEarned
      }))
    };

    return NextResponse.json({
      success: true,
      result
    });

  } catch (error) {
    console.error('Error fetching test results:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch test results',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
