import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { courseId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'STUDENT') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { courseId } = params;

    // Check if student has an approved enrollment request for this course
    const enrollmentRequest = await prisma.enrollmentRequest.findFirst({
      where: {
        courseId,
        studentEmail: session.user.email,
        status: 'APPROVED'
      },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            status: true,
            isActive: true
          }
        }
      }
    });

    if (!enrollmentRequest) {
      return NextResponse.json({ 
        isEnrolled: false,
        message: 'No approved enrollment found for this course'
      });
    }

    // Check if course is still active
    if (!enrollmentRequest.course.isActive || enrollmentRequest.course.status !== 'ACTIVE') {
      return NextResponse.json({ 
        isEnrolled: false,
        message: 'Course is no longer active'
      });
    }

    // Check access period if set
    const now = new Date();
    if (enrollmentRequest.course.accessStartDate && new Date(enrollmentRequest.course.accessStartDate) > now) {
      return NextResponse.json({ 
        isEnrolled: false,
        message: 'Course access has not started yet'
      });
    }

    if (enrollmentRequest.course.accessEndDate && new Date(enrollmentRequest.course.accessEndDate) < now) {
      return NextResponse.json({ 
        isEnrolled: false,
        message: 'Course access has expired'
      });
    }

    return NextResponse.json({ 
      isEnrolled: true,
      enrollmentRequest: {
        id: enrollmentRequest.id,
        status: enrollmentRequest.status,
        createdAt: enrollmentRequest.createdAt,
        course: enrollmentRequest.course
      }
    });

  } catch (error) {
    console.error('Error checking enrollment status:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
