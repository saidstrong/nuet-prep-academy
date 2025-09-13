import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { EnrollmentStatus } from '@prisma/client';

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 Alternative Enrollment API called');

    // Try to get session from headers
    const session = await getServerSession(authOptions);
    console.log('Session from getServerSession:', session ? {
      id: session.user.id,
      email: session.user.email,
      role: session.user.role
    } : 'No session');

    // If no session, try to get user info from request body
    const body = await request.json();
    const { courseId, userEmail } = body;

    if (!courseId) {
      return NextResponse.json(
        { error: 'Course ID is required' },
        { status: 400 }
      );
    }

    let userId: string | null = null;

    if (session && session.user && session.user.id) {
      userId = session.user.id;
      console.log('Using session user ID:', userId);
    } else if (userEmail) {
      // Try to find user by email
      const user = await prisma.user.findUnique({
        where: { email: userEmail },
        select: { id: true, role: true }
      });
      
      if (user) {
        userId = user.id;
        console.log('Found user by email:', user.id, user.role);
      }
    }

    if (!userId) {
      return NextResponse.json(
        {
          error: 'Please sign in to enroll in courses',
          details: 'Your session has expired or you are not logged in. Please refresh the page and sign in again.',
          action: 'signin_required',
          redirect: '/auth/signin'
        },
        { status: 401 }
      );
    }

    // Verify user role
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true }
    });

    if (!user || user.role !== 'STUDENT') {
      return NextResponse.json(
        { error: 'Forbidden - Student access required' },
        { status: 403 }
      );
    }

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
        studentId: userId,
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
      studentId: userId,
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
    console.error('Alternative Enrollment API Error:', error);
    return NextResponse.json(
      { error: 'Failed to enroll in course', details: error.message },
      { status: 500 }
    );
  }
}
