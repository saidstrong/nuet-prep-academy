import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

    const subtopics = await prisma.subtopic.findMany({
      include: {
        topic: {
          include: {
            course: true
          }
        },
        materials: true,
        tests: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({
      success: true,
      subtopics
    });

  } catch (error: any) {
    console.error('Error fetching subtopics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch subtopics' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { topicId, title, description, order } = body;

    if (!topicId || !title) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Verify the topic exists
    const topic = await prisma.topic.findUnique({
      where: { id: topicId }
    });

    if (!topic) {
      return NextResponse.json(
        { error: 'Topic not found' },
        { status: 404 }
      );
    }

    const subtopic = await prisma.subtopic.create({
      data: {
        topicId,
        title,
        description: description || '',
        order: parseInt(order) || 0
      },
      include: {
        topic: {
          include: {
            course: true
          }
        },
        materials: true,
        tests: true
      }
    });

    return NextResponse.json({
      success: true,
      subtopic
    });

  } catch (error: any) {
    console.error('Error creating subtopic:', error);
    return NextResponse.json(
      { error: 'Failed to create subtopic' },
      { status: 500 }
    );
  }
}
