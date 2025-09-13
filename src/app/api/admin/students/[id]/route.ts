import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if user is authenticated and is admin
    const session = await getServerSession(authOptions);
    
    if (!session || !['ADMIN'].includes(session.user.role)) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

    const studentId = params.id;

    if (!studentId) {
      return NextResponse.json(
        { error: 'Student ID is required' },
        { status: 400 }
      );
    }

    // Lazy import to prevent build-time issues
    const { prisma } = await import('@/lib/prisma');
    
    // Check if student exists and has STUDENT role
    const student = await prisma.user.findUnique({
      where: { id: studentId },
      select: { id: true, role: true, name: true }
    });

    if (!student) {
      return NextResponse.json(
        { error: 'Student not found' },
        { status: 404 }
      );
    }

    if (student.role !== 'STUDENT') {
      return NextResponse.json(
        { error: 'Selected user is not a student' },
        { status: 400 }
      );
    }

    // Delete student's profile if exists
    await prisma.profile.deleteMany({
      where: { userId: studentId }
    });

    // Note: Skipping enrollment and payment deletion for now to avoid relation errors
    // These can be added back when the enrollment system is fully implemented

    // Delete the student user
    await prisma.user.delete({
      where: { id: studentId }
    });

    return NextResponse.json({
      success: true,
      message: `Student ${student.name} has been deleted successfully`
    });

  } catch (error) {
    console.error('Error deleting student:', error);
    return NextResponse.json(
      { 
        error: 'Failed to delete student',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
