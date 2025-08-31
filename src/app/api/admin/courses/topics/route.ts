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
    const { title, description, order, courseId } = body;

    // Validate required fields
    if (!title || !courseId || order === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: title, courseId, order' },
        { status: 400 }
      );
    }

    // Lazy import to prevent build-time issues
    const { prisma } = await import('@/lib/prisma');
    
    // Verify the course exists and user has permission
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: { id: true, creatorId: true }
    });

    if (!course) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      );
    }

    if (course.creatorId !== session.user.id) {
      return NextResponse.json(
        { error: 'You can only add topics to courses you created' },
        { status: 403 }
      );
    }

    // Create the topic
    const topic = await prisma.topic.create({
      data: {
        title,
        description: description || '',
        order,
        courseId
      },
      include: {
        course: {
          select: {
            id: true,
            title: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      topic,
      message: 'Topic created successfully'
    });

  } catch (error) {
    console.error('Error creating topic:', error);
    return NextResponse.json(
      { 
        error: 'Failed to create topic',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
