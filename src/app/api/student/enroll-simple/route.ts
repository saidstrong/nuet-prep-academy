import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { EnrollmentStatus } from '@prisma/client';

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 Simple Enrollment API called');

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

    console.log('Enrollment request:', { courseId, userEmail });

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: userEmail },
      select: { id: true, role: true, email: true }
    });
    
    if (!user) {
      console.log('User not found:', userEmail);
      return NextResponse.json(
        { error: 'User not found. Please make sure you are signed in.' },
        { status: 404 }
      );
    }

    if (user.role !== 'STUDENT') {
      console.log('User is not a student:', user.role);
      return NextResponse.json(
        { error: 'Only students can enroll in courses' },
        { status: 403 }
      );
    }

    console.log('Found user:', { id: user.id, email: user.email, role: user.role });

    // Check if course exists
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: { id: true, title: true, creatorId: true, isActive: true }
    });

    if (!course) {
      console.log('Course not found:', courseId);
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

    console.log('Found course:', { id: course.id, title: course.title });

    // Check if already enrolled
    const existingEnrollment = await prisma.courseEnrollment.findFirst({
      where: {
        studentId: user.id,
        courseId: courseId,
      },
    });

    if (existingEnrollment) {
      console.log('Already enrolled');
      return NextResponse.json(
        { error: 'You are already enrolled in this course' },
        { status: 400 }
      );
    }

    // Create enrollment
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

    console.log('Creating enrollment:', enrollmentData);

    const enrollment = await prisma.courseEnrollment.create({
      data: enrollmentData,
    });

    console.log('Enrollment created successfully:', enrollment.id);

    return NextResponse.json({ 
      success: true, 
      message: 'Successfully enrolled in course!', 
      enrollment: {
        id: enrollment.id,
        courseTitle: course.title,
        enrolledAt: enrollment.enrolledAt
      }
    });
  } catch (error: any) {
    console.error('Simple Enrollment API Error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to enroll in course', 
        details: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}
