import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function PUT(
  request: NextRequest,
  { params }: { params: { testId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

    const { testId } = params;
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
      include: { course: true }
    });

    if (!topic) {
      return NextResponse.json(
        { error: 'Topic not found' },
        { status: 404 }
      );
    }

    const test = await prisma.test.update({
      where: { id: testId },
      data: {
        topicId,
        title,
        description,
        duration: parseInt(duration),
        totalPoints: parseInt(totalPoints)
      },
      include: {
        topic: {
          include: { course: true }
        }
      }
    });

    return NextResponse.json({
      success: true,
      test
    });

  } catch (error: any) {
    console.error('Error updating test:', error);
    return NextResponse.json(
      { 
        error: 'Failed to update test',
        details: error.message || 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { testId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

    const { testId } = params;

    // Delete the test
    await prisma.test.delete({
      where: { id: testId }
    });

    return NextResponse.json({
      success: true,
      message: 'Test deleted successfully'
    });

  } catch (error: any) {
    console.error('Error deleting test:', error);
    return NextResponse.json(
      { 
        error: 'Failed to delete test',
        details: error.message || 'Unknown error'
      },
      { status: 500 }
    );
  }
}
