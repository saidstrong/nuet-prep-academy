import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Debugging enrollment API...');
    
    // Test 1: Check session
    const session = await getServerSession(authOptions);
    console.log('Session check:', {
      hasSession: !!session,
      userId: session?.user?.id,
      userRole: session?.user?.role
    });
    
    if (!session) {
      return NextResponse.json({
        success: false,
        error: 'No session found',
        step: 'session_check'
      });
    }
    
    // Test 2: Check course existence
    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get('courseId') || 'cmf6zxwj60001xum8pnemsq8v';
    
    console.log('Course ID:', courseId);
    
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: {
        id: true,
        title: true,
        creatorId: true,
        price: true
      }
    });
    
    console.log('Course found:', course);
    
    if (!course) {
      return NextResponse.json({
        success: false,
        error: 'Course not found',
        courseId,
        step: 'course_check'
      });
    }
    
    // Test 3: Check if already enrolled
    const existingEnrollment = await prisma.courseEnrollment.findFirst({
      where: {
        studentId: session.user.id,
        courseId: courseId
      }
    });
    
    console.log('Existing enrollment:', existingEnrollment);
    
    if (existingEnrollment) {
      return NextResponse.json({
        success: false,
        error: 'Already enrolled',
        enrollment: existingEnrollment,
        step: 'duplicate_check'
      });
    }
    
    // Test 4: Try to create enrollment
    try {
      const enrollmentData = {
        studentId: session.user.id,
        courseId: courseId,
        tutorId: course.creatorId,
        status: 'ACTIVE' as const,
        enrolledAt: new Date(),
        updatedAt: new Date()
      };
      
      console.log('Enrollment data:', enrollmentData);
      
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
      
      console.log('Enrollment created successfully:', enrollment);
      
      return NextResponse.json({
        success: true,
        message: 'Enrollment successful',
        enrollment,
        step: 'enrollment_created'
      });
      
    } catch (dbError: any) {
      console.error('Database error during enrollment:', dbError);
      return NextResponse.json({
        success: false,
        error: 'Database error during enrollment',
        details: dbError.message,
        code: dbError.code,
        meta: dbError.meta,
        step: 'enrollment_creation'
      });
    }
    
  } catch (error: any) {
    console.error('Debug enrollment error:', error);
    return NextResponse.json({
      success: false,
      error: 'Debug enrollment failed',
      details: error.message,
      step: 'general_error'
    }, { status: 500 });
  }
}
