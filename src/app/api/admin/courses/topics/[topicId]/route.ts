import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function PUT(
  request: NextRequest,
  { params }: { params: { topicId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

    const { topicId } = params;
    const body = await request.json();
    const { courseId, title, description, order } = body;

    if (!courseId || !title || !description || order === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Verify course exists
    const course = await prisma.course.findUnique({
      where: { id: courseId }
    });

    if (!course) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      );
    }

    const topic = await prisma.topic.update({
      where: { id: topicId },
      data: {
        courseId,
        title,
        description,
        order: parseInt(order)
      },
      include: {
        course: true
      }
    });

    return NextResponse.json({
      success: true,
      topic
    });

  } catch (error: any) {
    console.error('Error updating topic:', error);
    return NextResponse.json(
      { 
        error: 'Failed to update topic',
        details: error.message || 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { topicId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

    const { topicId } = params;

    // Delete the topic
    await prisma.topic.delete({
      where: { id: topicId }
    });

    return NextResponse.json({
      success: true,
      message: 'Topic deleted successfully'
    });

  } catch (error: any) {
    console.error('Error deleting topic:', error);
    return NextResponse.json(
      { 
        error: 'Failed to delete topic',
        details: error.message || 'Unknown error'
      },
      { status: 500 }
    );
  }
}
