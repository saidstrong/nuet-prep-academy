import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function PUT(request: NextRequest, { params }: { params: { materialId: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized - Admin access required' }, { status: 401 });
    }

    const { materialId } = params;
    const body = await request.json();
    const { topicId, subtopicId, title, type, url, description, order } = body;

    if ((!topicId && !subtopicId) || !title || !type) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Verify the parent exists
    if (topicId) {
      const topic = await prisma.topic.findUnique({
        where: { id: topicId }
      });
      if (!topic) {
        return NextResponse.json({ error: 'Topic not found' }, { status: 404 });
      }
    }

    if (subtopicId) {
      const subtopic = await prisma.subtopic.findUnique({
        where: { id: subtopicId }
      });
      if (!subtopic) {
        return NextResponse.json({ error: 'Subtopic not found' }, { status: 404 });
      }
    }

    const material = await prisma.material.update({
      where: { id: materialId },
      data: {
        topicId: topicId || null,
        subtopicId: subtopicId || null,
        title,
        description: description || '',
        type: type as any,
        url: url || '',
        order: parseInt(order) || 0
      },
      include: {
        topic: {
          include: { course: true }
        },
        subtopic: {
          include: {
            topic: {
              include: { course: true }
            }
          }
        }
      }
    });

    return NextResponse.json({ success: true, material });
  } catch (error: any) {
    console.error('Error updating material:', error);
    return NextResponse.json({ error: 'Failed to update material', details: error.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { materialId: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized - Admin access required' }, { status: 401 });
    }

    const { materialId } = params;

    await prisma.material.delete({
      where: { id: materialId }
    });

    return NextResponse.json({ success: true, message: 'Material deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting material:', error);
    return NextResponse.json({ error: 'Failed to delete material', details: error.message }, { status: 500 });
  }
}
