import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET challenge by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const challenge = await prisma.challenge.findUnique({
      where: { id: params.id },
      include: {
        event: true,
        _count: {
          select: {
            submissions: true
          }
        }
      }
    });

    if (!challenge) {
      return NextResponse.json({ error: 'Challenge not found' }, { status: 404 });
    }

    return NextResponse.json({ challenge });
  } catch (error: any) {
    console.error('Error fetching challenge:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch challenge' },
      { status: 500 }
    );
  }
}

// PUT update challenge
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !['OWNER', 'ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const {
      name,
      description,
      type,
      startDate,
      endDate,
      rules,
      rewards,
      eventId,
      maxParticipants,
      hasQuiz,
      quiz
    } = await request.json();

    if (!name || !description || !type || !startDate || !endDate) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const challenge = await prisma.challenge.update({
      where: { id: params.id },
      data: {
        name,
        description,
        type,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        rules,
        rewards,
        eventId: eventId && eventId.trim() !== '' ? eventId : null,
        maxParticipants,
        hasQuiz: hasQuiz || false,
        quiz: quiz || null,
        updatedAt: new Date()
      }
    });

    return NextResponse.json({ success: true, challenge });
  } catch (error: any) {
    console.error('Error updating challenge:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update challenge' },
      { status: 400 }
    );
  }
}

// DELETE challenge
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !['OWNER', 'ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await prisma.challenge.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ success: true, message: 'Challenge deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting challenge:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete challenge' },
      { status: 400 }
    );
  }
}
