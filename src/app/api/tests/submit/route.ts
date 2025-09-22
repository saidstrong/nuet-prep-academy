import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function POST(request: Request) {
  try {
    // Check if user is authenticated and is a student
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'STUDENT') {
      return NextResponse.json(
        { error: 'Unauthorized - Student access required' },
        { status: 401 }
      );
    }

    const { testId, answers, timeSpent } = await request.json();

    if (!testId || !answers || !Array.isArray(answers)) {
      return NextResponse.json(
        { error: 'Invalid request data' },
        { status: 400 }
      );
    }

    const { prisma } = await import('@/lib/prisma');

    // Fetch the test with questions and correct answers
    const test = await prisma.test.findUnique({
      where: { id: testId },
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
        },
        subtopic: {
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

    if (!test) {
      return NextResponse.json(
        { error: 'Test not found' },
        { status: 404 }
      );
    }

    // Check if student is enrolled in the course
    const enrollment = await prisma.courseEnrollment.findFirst({
      where: {
        studentId: session.user.id,
        courseId: test.topic?.courseId || test.subtopic?.topic?.courseId,
        status: 'ACTIVE'
      }
    });

    if (!enrollment) {
      return NextResponse.json(
        { error: 'You are not enrolled in this course' },
        { status: 403 }
      );
    }

    // Check if student has already submitted this test
    const existingSubmission = await prisma.testSubmission.findFirst({
      where: {
        testId,
        studentId: session.user.id
      }
    });

    if (existingSubmission) {
      return NextResponse.json(
        { error: 'You have already submitted this test' },
        { status: 400 }
      );
    }

    // Calculate score and process answers
    let totalScore = 0;
    const processedAnswers: any[] = [];

    for (const answer of answers) {
      const questions = test.topic?.questions || test.subtopic?.topic?.questions || [];
      const question = questions.find(q => q.id === answer.questionId);
      if (!question) continue;

      let isCorrect = false;
      let pointsEarned = 0;

      // Check if answer is correct
      if (question.type === 'MULTIPLE_CHOICE' || question.type === 'TRUE_FALSE') {
        isCorrect = answer.answer === question.correctAnswer;
        if (isCorrect) {
          pointsEarned = question.points;
          totalScore += question.points;
        }
      }

      processedAnswers.push({
        questionId: answer.questionId,
        answer: answer.answer,
        isCorrect,
        pointsEarned
      });
    }

    // Create test submission
    const submission = await prisma.testSubmission.create({
      data: {
        testId,
        studentId: session.user.id,
        score: totalScore,
        maxScore: test.totalPoints,
        timeSpent,
        answers: processedAnswers,
        status: 'COMPLETED'
      }
    });



    return NextResponse.json({
      success: true,
      submission: {
        id: submission.id,
        score: totalScore,
        maxScore: test.totalPoints,
        submittedAt: submission.submittedAt,
        timeSpent
      }
    });

  } catch (error) {
    console.error('Error submitting test:', error);
    return NextResponse.json(
      {
        error: 'Failed to submit test',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
