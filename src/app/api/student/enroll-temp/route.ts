import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { EnrollmentStatus } from '@prisma/client';

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 Temporary Enrollment API called');

    const body = await request.json();
    const { courseId, userEmail } = body;

    if (!courseId) {
      return NextResponse.json(
        { error: 'Course ID is required' },
        { status: 400 }
      );
    }

    if (!userEmail) {
      return NextResponse.json(
        { error: 'User email is required' },
        { status: 400 }
      );
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: userEmail },
      select: { id: true, role: true }
    });
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    if (user.role !== 'STUDENT') {
      return NextResponse.json(
        { error: 'User is not a student' },
        { status: 403 }
      );
    }

    console.log('Found user:', user.id, user.role);

    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: { id: true, creatorId: true, isActive: true }
    });

    if (!course) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      );
    }

    if (!course.isActive) {
      return NextResponse.json(
        { error: 'Course is not available for enrollment' },
        { status: 400 }
      );
    }

    const existingEnrollment = await prisma.courseEnrollment.findFirst({
      where: {
        studentId: user.id,
        courseId: courseId,
      },
    });

    if (existingEnrollment) {
      return NextResponse.json(
        { error: 'Already enrolled in this course' },
        { status: 400 }
      );
    }

    const enrollmentData: any = {
      studentId: user.id,
      courseId: courseId,
      status: EnrollmentStatus.ACTIVE,
      enrolledAt: new Date(),
      updatedAt: new Date(),
    };

    if (course.creatorId) {
      enrollmentData.tutorId = course.creatorId;
    }

    const enrollment = await prisma.courseEnrollment.create({
      data: enrollmentData,
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Enrollment successful', 
      enrollment 
    });
  } catch (error: any) {
    console.error('Temporary Enrollment API Error:', error);
    return NextResponse.json(
      { error: 'Failed to enroll in course', details: error.message },
      { status: 500 }
    );
  }
}
