import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'STUDENT') {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { testId, answers, timeSpent } = body;

    if (!testId || !answers || !Array.isArray(answers)) {
      return NextResponse.json({
        success: false,
        message: 'Missing required fields',
      }, { status: 400 });
    }

    const { prisma } = await import('@/lib/prisma');

    // Get test details
    const test = await prisma.test.findUnique({
      where: { id: testId },
      include: {
        topic: {
          include: {
            course: {
              include: {
                enrollments: {
                  where: {
                    studentId: session.user.id,
                    status: 'ACTIVE',
                  },
                },
              },
            },
            questions: {
              include: {
                options: true,
              },
            },
          },
        },
      },
    });

    if (!test) {
      return NextResponse.json({
        success: false,
        message: 'Test not found',
      }, { status: 404 });
    }

    // Check if student is enrolled in the course
    if (test.topic.course.enrollments.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'You must be enrolled in this course to take the test',
      }, { status: 403 });
    }

    // Check if test is active
    if (!test.isActive) {
      return NextResponse.json({
        success: false,
        message: 'This test is not currently active',
      }, { status: 400 });
    }

    // Check if student has already taken this test
    const existingSubmission = await prisma.testSubmission.findFirst({
      where: {
        testId,
        studentId: session.user.id,
      },
    });

    if (existingSubmission) {
      return NextResponse.json({
        success: false,
        message: 'You have already taken this test',
      }, { status: 400 });
    }

    // Calculate score
    let correctAnswers = 0;
    const totalQuestions = test.topic.questions.length;

    for (const answer of answers) {
      const question = test.topic.questions.find(q => q.id === answer.questionId);
      if (question) {
        const correctOption = question.options.find(option => option.isCorrect);
        if (correctOption && answer.selectedOptionId === correctOption.id) {
          correctAnswers++;
        }
      }
    }

    const score = Math.round((correctAnswers / totalQuestions) * test.totalPoints);
    const percentage = Math.round((correctAnswers / totalQuestions) * 100);

    // Determine status based on score
    let status = 'FAILED';
    if (percentage >= 80) status = 'EXCELLENT';
    else if (percentage >= 70) status = 'GOOD';
    else if (percentage >= 60) status = 'SATISFACTORY';
    else if (percentage >= 50) status = 'PASSED';

    // Create test submission
    const submission = await prisma.testSubmission.create({
      data: {
        testId,
        studentId: session.user.id,
        answers: answers,
        score,
        maxScore: test.totalPoints,
        timeSpent: timeSpent || 0,
        status,
        submittedAt: new Date(),
      },
      include: {
        test: {
          select: {
            title: true,
            totalPoints: true,
          },
        },
        student: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Test submitted successfully',
      submission: {
        id: submission.id,
        score: submission.score,
        maxScore: submission.maxScore,
        percentage,
        status: submission.status,
        timeSpent: submission.timeSpent,
      },
    }, { status: 201 });

  } catch (error) {
    console.error('Error submitting test:', error);
    return NextResponse.json({
      success: false,
      message: 'An error occurred while submitting the test',
    }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'STUDENT') {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const testId = searchParams.get('testId');

    if (!testId) {
      return NextResponse.json({
        success: false,
        message: 'Test ID is required',
      }, { status: 400 });
    }

    const { prisma } = await import('@/lib/prisma');

    // Get test with questions
    const test = await prisma.test.findUnique({
      where: { id: testId },
      include: {
        topic: {
          include: {
            course: {
              include: {
                enrollments: {
                  where: {
                    studentId: session.user.id,
                    status: 'ACTIVE',
                  },
                },
              },
            },
            questions: {
              include: {
                options: {
                  select: {
                    id: true,
                    text: true,
                    order: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!test) {
      return NextResponse.json({
        success: false,
        message: 'Test not found',
      }, { status: 404 });
    }

    // Check if student is enrolled
    if (test.topic.course.enrollments.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'You must be enrolled in this course to take the test',
      }, { status: 403 });
    }

    // Check if test is active
    if (!test.isActive) {
      return NextResponse.json({
        success: false,
        message: 'This test is not currently active',
      }, { status: 400 });
    }

    // Check if already taken
    const existingSubmission = await prisma.testSubmission.findFirst({
      where: {
        testId,
        studentId: session.user.id,
      },
    });

    if (existingSubmission) {
      return NextResponse.json({
        success: false,
        message: 'You have already taken this test',
        submission: existingSubmission,
      }, { status: 400 });
    }

    // Return test without correct answers
    const testForStudent = {
      id: test.id,
      title: test.title,
      description: test.description,
      duration: test.duration,
      totalPoints: test.totalPoints,
      questions: test.topic.questions.map(q => ({
        id: q.id,
        text: q.text,
        type: q.type,
        options: q.options,
      })),
    };

    return NextResponse.json({
      success: true,
      test: testForStudent,
    });

  } catch (error) {
    console.error('Error fetching test:', error);
    return NextResponse.json({
      success: false,
      message: 'An error occurred while fetching the test',
    }, { status: 500 });
  }
}
