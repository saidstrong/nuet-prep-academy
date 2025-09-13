import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

    const tutorId = params.id;
    const body = await request.json();
    const { name, email, phone, specialization, experience, bio } = body;

    if (!name || !email) {
      return NextResponse.json(
        { error: 'Name and email are required' },
        { status: 400 }
      );
    }

    // Check if tutor exists
    const existingTutor = await prisma.user.findUnique({
      where: { id: tutorId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true
      }
    });

    if (!existingTutor) {
      return NextResponse.json(
        { error: 'Tutor not found' },
        { status: 404 }
      );
    }

    // Update user (profile update will be handled separately if needed)
    const updatedTutor = await prisma.user.update({
      where: { id: tutorId },
      data: {
        name,
        email
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        assignedCourses: {
          select: {
            id: true,
            title: true,
            status: true
          }
        }
      }
    });

    return NextResponse.json({ 
      tutor: updatedTutor,
      message: 'Tutor updated successfully' 
    });
  } catch (error) {
    console.error('Error updating tutor:', error);
    return NextResponse.json(
      { error: 'Failed to update tutor' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

    const tutorId = params.id;

    // Check if tutor exists
    const existingTutor = await prisma.user.findUnique({
      where: { id: tutorId }
    });

    if (!existingTutor) {
      return NextResponse.json(
        { error: 'Tutor not found' },
        { status: 404 }
      );
    }

    // Check if tutor has assigned courses
    const assignedCourses = await prisma.course.findMany({
      where: {
        assignedTutors: {
          some: { id: tutorId }
        }
      }
    });

    if (assignedCourses.length > 0) {
      return NextResponse.json(
        { 
          error: 'Cannot delete tutor with assigned courses. Please reassign courses first.',
          assignedCourses: assignedCourses.map(c => c.title)
        },
        { status: 400 }
      );
    }

    // Delete tutor (profile will be deleted automatically due to cascade)
    await prisma.user.delete({
      where: { id: tutorId }
    });

    return NextResponse.json({ 
      message: 'Tutor deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting tutor:', error);
    return NextResponse.json(
      { error: 'Failed to delete tutor' },
      { status: 500 }
    );
  }
}
