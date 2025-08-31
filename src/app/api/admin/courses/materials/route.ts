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
    const { title, description, type, url, content, order, topicId } = body;

    // Validate required fields
    if (!title || !type || !topicId || order === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: title, type, topicId, order' },
        { status: 400 }
      );
    }

    // Validate material type specific fields
    if (type !== 'TEXT' && !url) {
      return NextResponse.json(
        { error: 'URL is required for non-text materials' },
        { status: 400 }
      );
    }

    if (type === 'TEXT' && !content) {
      return NextResponse.json(
        { error: 'Content is required for text materials' },
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
        { error: 'You can only add materials to topics in courses you created' },
        { status: 403 }
      );
    }

    // Create the material
    const material = await prisma.material.create({
      data: {
        title,
        description: description || '',
        type,
        url: type !== 'TEXT' ? url : null,
        content: type === 'TEXT' ? content : null,
        order,
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
      material,
      message: 'Material created successfully'
    });

  } catch (error) {
    console.error('Error creating material:', error);
    return NextResponse.json(
      { 
        error: 'Failed to create material',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
