import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function PUT(request: NextRequest, { params }: { params: { subtopicId: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized - Admin access required' }, { status: 401 });
    }

    const { subtopicId } = params;
    const body = await request.json();
    const { topicId, title, description, order } = body;

    if (!topicId || !title) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const topic = await prisma.topic.findUnique({
      where: { id: topicId }
    });

    if (!topic) {
      return NextResponse.json({ error: 'Topic not found' }, { status: 404 });
    }

    const subtopic = await prisma.subtopic.update({
      where: { id: subtopicId },
      data: {
        topicId,
        title,
        description: description || '',
        order: parseInt(order) || 0
      },
      include: {
        topic: {
          include: { course: true }
        },
        materials: true,
        tests: true
      }
    });

    return NextResponse.json({ success: true, subtopic });
  } catch (error: any) {
    console.error('Error updating subtopic:', error);
    return NextResponse.json({ error: 'Failed to update subtopic', details: error.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { subtopicId: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized - Admin access required' }, { status: 401 });
    }

    const { subtopicId } = params;

    // Delete related materials and tests first
    await prisma.material.deleteMany({
      where: { subtopicId: subtopicId }
    });
    await prisma.test.deleteMany({
      where: { subtopicId: subtopicId }
    });

    await prisma.subtopic.delete({
      where: { id: subtopicId }
    });

    return NextResponse.json({ success: true, message: 'Subtopic deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting subtopic:', error);
    return NextResponse.json({ error: 'Failed to delete subtopic', details: error.message }, { status: 500 });
  }
}
