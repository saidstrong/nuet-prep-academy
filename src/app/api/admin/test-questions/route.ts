import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET() {
  try {
    // Check if user is authenticated and is admin/owner
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin/Owner access required' },
        { status: 401 }
      );
    }

    const { prisma } = await import('@/lib/prisma');
    
    // Fetch all test questions with topic and course information
    const questions = await prisma.question.findMany({
      include: {
        topic: {
          include: {
            course: {
              select: {
                id: true,
                title: true
              }
            }
          }
        },
        options: true
      },
      orderBy: { createdAt: 'desc' }
    });

    // Transform the data to include course and topic titles
    const transformedQuestions = questions.map(question => ({
      id: question.id,
      text: question.text,
      type: question.type,
      difficulty: question.difficulty,
      topicId: question.topicId,
      topicTitle: question.topic.title,
      courseId: question.topic.course.id,
      courseTitle: question.topic.course.title,
      points: question.points,
      options: question.options.map(opt => opt.text),
      correctAnswer: question.correctAnswer,
      explanation: question.explanation,
      createdAt: question.createdAt.toISOString(),
      updatedAt: question.updatedAt.toISOString()
    }));

    return NextResponse.json({
      success: true,
      questions: transformedQuestions,
      total: transformedQuestions.length
    });

  } catch (error) {
    console.error('Error fetching test questions:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch test questions',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    // Check if user is authenticated and is admin/owner
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin/Owner access required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { text, type, difficulty, topicId, points, options, correctAnswer, explanation } = body;

    // Validate required fields
    if (!text || !type || !difficulty || !topicId || !points) {
      return NextResponse.json(
        { error: 'Missing required fields: text, type, difficulty, topicId, points' },
        { status: 400 }
      );
    }

    // Validate question type specific requirements
    if (type === 'MULTIPLE_CHOICE') {
      if (!options || options.length < 2) {
        return NextResponse.json(
          { error: 'Multiple choice questions must have at least 2 options' },
          { status: 400 }
        );
      }
      if (!correctAnswer) {
        return NextResponse.json(
          { error: 'Multiple choice questions must have a correct answer' },
          { status: 400 }
        );
      }
    }

    if (type === 'TRUE_FALSE' && !correctAnswer) {
      return NextResponse.json(
        { error: 'True/False questions must have a correct answer' },
        { status: 400 }
      );
    }

    const { prisma } = await import('@/lib/prisma');
    
    // Verify the topic exists
    const topic = await prisma.topic.findUnique({
      where: { id: topicId },
      include: {
        course: {
          select: { id: true, title: true }
        }
      }
    });

    if (!topic) {
      return NextResponse.json(
        { error: 'Topic not found' },
        { status: 404 }
      );
    }

    // Create the question
    const question = await prisma.question.create({
      data: {
        text,
        type,
        difficulty,
        topicId,
        points,
        correctAnswer: type === 'MULTIPLE_CHOICE' || type === 'TRUE_FALSE' ? correctAnswer : undefined,
        explanation,
        options: type === 'MULTIPLE_CHOICE' ? {
          create: options.map((option: string, index: number) => ({
            text: option,
            isCorrect: option === correctAnswer,
            order: index
          }))
        } : undefined
      },
      include: {
        topic: {
          include: {
            course: {
              select: {
                id: true,
                title: true
              }
            }
          }
        },
        options: true
      }
    });

    // Transform the response
    const transformedQuestion = {
      id: question.id,
      text: question.text,
      type: question.type,
      difficulty: question.difficulty,
      topicId: question.topicId,
      topicTitle: question.topic.title,
      courseId: question.topic.course.id,
      courseTitle: question.topic.course.title,
      points: question.points,
      options: question.options.map(opt => opt.text),
      correctAnswer: question.correctAnswer,
      explanation: question.explanation,
      createdAt: question.createdAt.toISOString(),
      updatedAt: question.updatedAt.toISOString()
    };

    return NextResponse.json({
      success: true,
      question: transformedQuestion,
      message: 'Question created successfully'
    });

  } catch (error) {
    console.error('Error creating question:', error);
    return NextResponse.json(
      { 
        error: 'Failed to create question',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
