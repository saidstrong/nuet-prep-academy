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

    // Test database connection first
    try {
      await prisma.$connect();
    } catch (dbError: any) {
      console.error('❌ Database connection failed, using mock topics:', dbError);
      return NextResponse.json({
        success: true,
        topics: [],
        source: 'mock',
        message: 'No topics found (using mock data due to database issues)'
      });
    }

    const topics = await prisma.topic.findMany({
      include: {
        course: true
      },
      orderBy: [
        { courseId: 'asc' },
        { order: 'asc' }
      ]
    });

    return NextResponse.json({
      success: true,
      topics
    });

  } catch (error: any) {
    console.error('Error fetching topics:', error);
    
    // Fallback to mock data if database fails
    const session = await getServerSession(authOptions);
    if (session && session.user && session.user.role === 'ADMIN') {
      return NextResponse.json({
        success: true,
        topics: [],
        source: 'mock',
        message: 'No topics found (using mock data due to database issues)'
      });
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch topics',
        details: error.message || 'Unknown error'
      },
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

    const topic = await prisma.topic.create({
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
    console.error('Error creating topic:', error);
    return NextResponse.json(
      { error: 'Failed to create topic' },
      { status: 500 }
    );
  }
}
