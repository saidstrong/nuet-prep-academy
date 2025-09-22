import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

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
    const { courseId, tutorId, maxStudents } = body;

    // Validate required fields
    if (!courseId || !tutorId || maxStudents === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: courseId, tutorId, maxStudents' },
        { status: 400 }
      );
    }

    // Validate maxStudents range
    if (maxStudents < 1 || maxStudents > 100) {
      return NextResponse.json(
        { error: 'maxStudents must be between 1 and 100' },
        { status: 400 }
      );
    }

    // Lazy import to prevent build-time issues
    const { prisma } = await import('@/lib/prisma');
    
    // Verify the course exists and user has permission
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: { id: true, creatorId: true, title: true }
    });

    if (!course) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      );
    }

    if (course.creatorId !== session.user.id) {
      return NextResponse.json(
        { error: 'You can only assign tutors to courses you created' },
        { status: 403 }
      );
    }

    // Verify the tutor exists and has TUTOR role
    const tutor = await prisma.user.findUnique({
      where: { id: tutorId },
      select: { id: true, role: true, name: true }
    });

    if (!tutor) {
      return NextResponse.json(
        { error: 'Tutor not found' },
        { status: 404 }
      );
    }

    if (tutor.role !== 'TUTOR') {
      return NextResponse.json(
        { error: 'Selected user is not a tutor' },
        { status: 400 }
      );
    }

    // Check if tutor is already assigned to this course
    const existingAssignment = await prisma.courseEnrollment.findFirst({
      where: {
        courseId,
        tutorId,
        status: 'ACTIVE'
      }
    });

    if (existingAssignment) {
      return NextResponse.json(
        { error: 'Tutor is already assigned to this course' },
        { status: 400 }
      );
    }

    // Check tutor's current student load
    const currentLoad = await prisma.courseEnrollment.count({
      where: {
        tutorId,
        status: 'ACTIVE'
      }
    });

    if (currentLoad >= 40) {
      return NextResponse.json(
        { error: 'Tutor has reached maximum student capacity (40 students)' },
        { status: 400 }
      );
    }

    // Create the tutor assignment (this will be used when students enroll)
    // For now, we'll create a placeholder enrollment to track the assignment
    const assignment = await prisma.courseEnrollment.create({
      data: {
        courseId,
        tutorId,
        studentId: 'placeholder', // This will be updated when actual students enroll
        status: 'ACTIVE',
        paymentStatus: 'PAID'
      }
    });

    return NextResponse.json({
      success: true,
      assignment,
      message: `Tutor ${tutor.name} successfully assigned to course ${course.title}`,
      tutorName: tutor.name,
      courseTitle: course.title,
      maxStudents
    });

  } catch (error) {
    console.error('Error assigning tutor to course:', error);
    return NextResponse.json(
      { 
        error: 'Failed to assign tutor to course',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
