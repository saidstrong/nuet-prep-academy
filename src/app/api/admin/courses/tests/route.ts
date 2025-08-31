import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    // Check if user is authenticated and is admin
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { title, description, duration, totalPoints, isActive, topicId } = body;

    // Validate required fields
    if (!title || !topicId || duration === undefined || totalPoints === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: title, topicId, duration, totalPoints' },
        { status: 400 }
      );
    }

    // Validate ranges
    if (duration < 1 || duration > 480) {
      return NextResponse.json(
        { error: 'Duration must be between 1 and 480 minutes' },
        { status: 400 }
      );
    }

    if (totalPoints < 1 || totalPoints > 1000) {
      return NextResponse.json(
        { error: 'Total points must be between 1 and 1000' },
        { status: 400 }
      );
    }

    // Lazy import to prevent build-time issues
    const { prisma } = await import('@/lib/prisma');
    
    // Verify the topic exists and user has permission to the course
    const topic = await prisma.topic.findUnique({
      where: { id: topicId },
      include: {
        course: {
          select: { id: true, creatorId: true }
        }
      }
    });

    if (!topic) {
      return NextResponse.json(
        { error: 'Topic not found' },
        { status: 404 }
      );
    }

    if (topic.course.creatorId !== session.user.id) {
      return NextResponse.json(
        { error: 'You can only add tests to topics in courses you created' },
        { status: 403 }
      );
    }

    // Create the test
    const test = await prisma.test.create({
      data: {
        title,
        description: description || '',
        duration,
        totalPoints,
        isActive: isActive !== undefined ? isActive : true,
        topicId
      },
      include: {
        topic: {
          select: {
            id: true,
            title: true,
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

    return NextResponse.json({
      success: true,
      test,
      message: 'Test created successfully'
    });

  } catch (error) {
    console.error('Error creating test:', error);
    return NextResponse.json(
      { 
        error: 'Failed to create test',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
