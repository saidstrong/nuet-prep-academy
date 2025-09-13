import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
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

    const tests = await prisma.test.findMany({
      include: {
        topic: {
          include: {
            course: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({
      success: true,
      tests
    });

  } catch (error: any) {
    console.error('Error fetching tests:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tests' },
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
    const { topicId, title, description, duration, totalPoints } = body;

    if (!topicId || !title || !description || !duration || !totalPoints) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Verify topic exists
    const topic = await prisma.topic.findUnique({
      where: { id: topicId },
      include: {
        course: true
      }
    });

    if (!topic) {
      return NextResponse.json(
        { error: 'Topic not found' },
        { status: 404 }
      );
    }

    const test = await prisma.test.create({
      data: {
        topicId,
        title,
        description,
        duration: parseInt(duration),
        totalPoints: parseInt(totalPoints),
        isActive: true
      },
      include: {
        topic: {
          include: {
            course: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      test
    });

  } catch (error: any) {
    console.error('Error creating test:', error);
    return NextResponse.json(
      { error: 'Failed to create test' },
      { status: 500 }
    );
  }
}