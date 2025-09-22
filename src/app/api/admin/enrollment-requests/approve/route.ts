import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !['OWNER', 'ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { requestId } = await request.json();

    if (!requestId) {
      return NextResponse.json({ error: 'Request ID is required' }, { status: 400 });
    }

    // Find the enrollment request
    const enrollmentRequest = await prisma.manualEnrollmentRequest.findUnique({
      where: { id: requestId },
      include: {
        student: true,
        course: true,
        tutor: true
      }
    });

    if (!enrollmentRequest) {
      return NextResponse.json({ error: 'Enrollment request not found' }, { status: 404 });
    }

    if (enrollmentRequest.status !== 'PENDING') {
      return NextResponse.json({ error: 'Request has already been processed' }, { status: 400 });
    }

    // Check if student is already enrolled in this course
    const existingEnrollment = await prisma.courseEnrollment.findFirst({
      where: {
        studentId: enrollmentRequest.studentId,
        courseId: enrollmentRequest.courseId,
        status: 'ACTIVE'
      }
    });

    if (existingEnrollment) {
      return NextResponse.json({ error: 'Student is already enrolled in this course' }, { status: 400 });
    }

    // Check tutor's current student load
    const currentLoad = await prisma.courseEnrollment.count({
      where: {
        tutorId: enrollmentRequest.tutorId,
        status: 'ACTIVE'
      }
    });

    if (currentLoad >= 40) {
      return NextResponse.json({ error: 'Tutor has reached maximum student capacity (40 students)' }, { status: 400 });
    }

    // Use a transaction to ensure data consistency
    const result = await prisma.$transaction(async (tx) => {
      // Update the enrollment request status
      const updatedRequest = await tx.manualEnrollmentRequest.update({
        where: { id: requestId },
        data: { 
          status: 'APPROVED',
          updatedAt: new Date()
        }
      });

      // Create the actual enrollment
      const enrollment = await tx.courseEnrollment.create({
        data: {
          courseId: enrollmentRequest.courseId,
          studentId: enrollmentRequest.studentId,
          tutorId: enrollmentRequest.tutorId,
          status: 'ACTIVE',
          paymentStatus: 'PAID',
          enrolledAt: new Date()
        }
      });

      // Create payment record
      const payment = await tx.payment.create({
        data: {
          enrollmentId: enrollment.id,
          studentId: enrollmentRequest.studentId,
          courseId: enrollmentRequest.courseId,
          amount: enrollmentRequest.coursePrice,
          paymentMethod: 'MANUAL',
          status: 'PAID'
        }
      });

      return { updatedRequest, enrollment, payment };
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Enrollment request approved and student enrolled successfully',
      enrollment: result.enrollment
    });

  } catch (error: any) {
    console.error('Error approving enrollment request:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to approve enrollment request' },
      { status: 500 }
    );
  }
}
