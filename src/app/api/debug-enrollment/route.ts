import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get('courseId') || 'cmf6zxwj60001xum8pnemsq8v';
    const studentId = searchParams.get('studentId') || 'test-student-id';

    console.log('Testing enrollment with:', { courseId, studentId });

    // Check if course exists
    const course = await prisma.course.findUnique({
      where: { id: courseId }
    });

    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    console.log('Course found:', course.title);

    // Test enrollment data structure
    const enrollmentData = {
      studentId: studentId,
      courseId: courseId,
      tutorId: course.creatorId, // Use course creator as tutor
      status: 'ACTIVE' as const,
      enrolledAt: new Date(),
      updatedAt: new Date()
    };

    console.log('Enrollment data:', enrollmentData);

    // Try to create enrollment
    try {
      const enrollment = await prisma.courseEnrollment.create({
        data: enrollmentData,
        include: {
          course: {
            select: {
              id: true,
              title: true,
              description: true,
              instructor: true,
              price: true
            }
          }
        }
      });

      return NextResponse.json({
        success: true,
        message: 'Enrollment test successful',
        enrollment
      });
    } catch (createError: any) {
      console.error('Enrollment creation error:', createError);
      return NextResponse.json({
        success: false,
        error: 'Enrollment creation failed',
        details: {
          message: createError.message,
          code: createError.code,
          meta: createError.meta
        }
      }, { status: 500 });
    }

  } catch (error: any) {
    console.error('Debug enrollment error:', error);
    return NextResponse.json({
      success: false,
      error: 'Debug failed',
      details: {
        message: error.message,
        code: error.code,
        meta: error.meta
      }
    }, { status: 500 });
  }
}
