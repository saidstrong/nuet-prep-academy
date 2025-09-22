import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const enrollmentSchema = z.object({
  courseId: z.string().min(1, 'Course ID is required'),
  tutorId: z.string().optional(),
  paymentMethod: z.enum(['KASPI', 'CARD', 'BANK_TRANSFER', 'CONTACT_MANAGER']),
  contactInfo: z.object({
    phone: z.string().optional(),
    email: z.string().email().optional(),
    notes: z.string().optional()
  }).optional()
});

export async function POST(request: Request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validationResult = enrollmentSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Validation failed',
          errors: validationResult.error.errors
        },
        { status: 400 }
      );
    }

    const { courseId, tutorId, paymentMethod, contactInfo } = validationResult.data;

    // Check if course exists
    const course = await prisma.course.findUnique({
      where: { id: courseId }
    });

    if (!course) {
      return NextResponse.json(
        { success: false, message: 'Course not found' },
        { status: 404 }
      );
    }

    // Check if user is already enrolled
    const existingEnrollment = await prisma.courseEnrollment.findFirst({
      where: {
        studentId: session.user.id,
        courseId: courseId
      }
    });

    if (existingEnrollment) {
      return NextResponse.json(
        { success: false, message: 'You are already enrolled in this course' },
        { status: 400 }
      );
    }

    // Create enrollment
    const enrollment = await prisma.courseEnrollment.create({
      data: {
        studentId: session.user.id,
        courseId: courseId,
        status: paymentMethod === 'CONTACT_MANAGER' ? 'PENDING' : 'ACTIVE',
        paymentMethod: paymentMethod,
        tutorId: tutorId || 'default-tutor-id', // Use default tutor if none provided
        enrolledAt: new Date()
      },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            price: true
          }
        },
        student: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    // If payment method is CONTACT_MANAGER, create a notification for admin
    if (paymentMethod === 'CONTACT_MANAGER') {
      await prisma.notification.create({
        data: {
          userId: session.user.id,
          type: 'ENROLLMENT_REQUEST',
          title: 'New Enrollment Request',
          message: `Student ${session.user.name} wants to enroll in ${course.title}`,
          data: JSON.stringify({
            enrollmentId: enrollment.id,
            courseId: courseId,
            tutorId: tutorId,
            contactInfo: contactInfo
          }),
          isRead: false
        }
      });
    }

    return NextResponse.json({
      success: true,
      message: paymentMethod === 'CONTACT_MANAGER' 
        ? 'Enrollment request submitted. Our team will contact you soon.'
        : 'Successfully enrolled in the course',
      enrollment: {
        id: enrollment.id,
        status: enrollment.status,
        course: enrollment.course,
        enrolledAt: enrollment.enrolledAt
      }
    });

  } catch (error: any) {
    console.error('Enrollment error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'An error occurred during enrollment',
        error: error.message
      },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get user's enrollments
    const enrollments = await prisma.courseEnrollment.findMany({
      where: { studentId: session.user.id },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            description: true,
            price: true,
            duration: true,
            instructor: true,
            difficulty: true
          }
        }
      },
      orderBy: { enrolledAt: 'desc' }
    });

    return NextResponse.json({
      success: true,
      enrollments
    });

  } catch (error: any) {
    console.error('Get enrollments error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to fetch enrollments',
        error: error.message
      },
      { status: 500 }
    );
  }
}
