import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

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
    const { studentId, courseId, tutorId, paymentMethod } = body;

    // Validate required fields
    if (!studentId || !courseId || !tutorId || !paymentMethod) {
      return NextResponse.json(
        { error: 'Missing required fields: studentId, courseId, tutorId, paymentMethod' },
        { status: 400 }
      );
    }

    // Lazy import to prevent build-time issues
    const { prisma } = await import('@/lib/prisma');
    
    // Verify the student exists and has STUDENT role
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

    // Verify the course exists and is active
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: { id: true, title: true, status: true, price: true }
    });

    if (!course) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      );
    }

    if (course.status !== 'ACTIVE') {
      return NextResponse.json(
        { error: 'Course is not active' },
        { status: 400 }
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

    // Check if student is already enrolled in this course
    const existingEnrollment = await prisma.courseEnrollment.findFirst({
      where: {
        courseId,
        studentId,
        status: 'ACTIVE'
      }
    });

    if (existingEnrollment) {
      return NextResponse.json(
        { error: 'Student is already enrolled in this course' },
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

    // Create the enrollment
    const enrollment = await prisma.courseEnrollment.create({
      data: {
        courseId,
        studentId,
        tutorId,
        status: 'ACTIVE',
        paymentStatus: 'PAID',
        enrolledAt: new Date()
      }
    });

    // Create payment record
    const payment = await prisma.payment.create({
      data: {
        enrollmentId: enrollment.id,
        studentId,
        courseId,
        amount: course.price,
        method: paymentMethod,
        status: 'PAID'
      }
    });

    return NextResponse.json({
      success: true,
      enrollment,
      payment,
      message: `Student ${student.name} successfully enrolled in course ${course.title} with tutor ${tutor.name}`,
      studentName: student.name,
      courseTitle: course.title,
      tutorName: tutor.name,
      amount: course.price
    });

  } catch (error) {
    console.error('Error enrolling student:', error);
    return NextResponse.json(
      { 
        error: 'Failed to enroll student',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
