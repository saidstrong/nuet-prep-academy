import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Check if user is authenticated and is admin/owner
    const session = await getServerSession(authOptions);
    
    if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'OWNER')) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin/Owner access required' },
        { status: 401 }
      );
    }

    const { prisma } = await import('@/lib/prisma');
    
    // Fetch the specific question with topic and course information
    const question = await prisma.question.findUnique({
      where: { id: params.id },
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
        }
      }
    });

    if (!question) {
      return NextResponse.json(
        { error: 'Question not found' },
        { status: 404 }
      );
    }

    // Transform the data
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
      options: question.options,
      correctAnswer: question.correctAnswer,
      explanation: question.explanation,
      createdAt: question.createdAt.toISOString(),
      updatedAt: question.updatedAt.toISOString()
    };

    return NextResponse.json({
      success: true,
      question: transformedQuestion
    });

  } catch (error) {
    console.error('Error fetching question:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch question',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Check if user is authenticated and is admin/owner
    const session = await getServerSession(authOptions);
    
    if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'OWNER')) {
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

    // Update the question
    const updatedQuestion = await prisma.question.update({
      where: { id: params.id },
      data: {
        text,
        type,
        difficulty,
        topicId,
        points,
        options: type === 'MULTIPLE_CHOICE' ? options : undefined,
        correctAnswer: type === 'MULTIPLE_CHOICE' || type === 'TRUE_FALSE' ? correctAnswer : undefined,
        explanation,
        updatedAt: new Date()
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
        }
      }
    });

    // Transform the response
    const transformedQuestion = {
      id: updatedQuestion.id,
      text: updatedQuestion.text,
      type: updatedQuestion.type,
      difficulty: updatedQuestion.difficulty,
      topicId: updatedQuestion.topicId,
      topicTitle: updatedQuestion.topic.title,
      courseId: updatedQuestion.topic.course.id,
      courseTitle: updatedQuestion.topic.course.title,
      points: updatedQuestion.points,
      options: updatedQuestion.options,
      correctAnswer: updatedQuestion.correctAnswer,
      explanation: updatedQuestion.explanation,
      createdAt: updatedQuestion.createdAt.toISOString(),
      updatedAt: updatedQuestion.updatedAt.toISOString()
    };

    return NextResponse.json({
      success: true,
      question: transformedQuestion,
      message: 'Question updated successfully'
    });

  } catch (error) {
    console.error('Error updating question:', error);
    return NextResponse.json(
      { 
        error: 'Failed to update question',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Check if user is authenticated and is admin/owner
    const session = await getServerSession(authOptions);
    
    if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'OWNER')) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin/Owner access required' },
        { status: 401 }
      );
    }

    const { prisma } = await import('@/lib/prisma');
    
    // Check if the question exists
    const question = await prisma.question.findUnique({
      where: { id: params.id }
    });

    if (!question) {
      return NextResponse.json(
        { error: 'Question not found' },
        { status: 404 }
      );
    }

    // Delete the question
    await prisma.question.delete({
      where: { id: params.id }
    });

    return NextResponse.json({
      success: true,
      message: 'Question deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting question:', error);
    return NextResponse.json(
      { 
        error: 'Failed to delete question',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
