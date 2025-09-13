import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { headers } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 Detailed enrollment debug...');
    
    // Test 1: Check headers
    const headersList = await headers();
    const cookieHeader = headersList.get('cookie');
    const authorizationHeader = headersList.get('authorization');
    
    console.log('Headers check:', {
      hasCookie: !!cookieHeader,
      hasAuthorization: !!authorizationHeader,
      cookieLength: cookieHeader?.length || 0
    });
    
    // Test 2: Check session
    const session = await getServerSession(authOptions);
    
    console.log('Session details:', {
      hasSession: !!session,
      userId: session?.user?.id,
      userEmail: session?.user?.email,
      userRole: session?.user?.role,
      userName: session?.user?.name
    });
    
    if (!session) {
      return NextResponse.json({
        success: false,
        error: 'No session found',
        step: 'session_check',
        headers: {
          hasCookie: !!cookieHeader,
          hasAuthorization: !!authorizationHeader
        }
      });
    }
    
    // Test 3: Parse request body
    let body;
    try {
      body = await request.json();
      console.log('Request body:', body);
    } catch (error) {
      console.error('Body parsing error:', error);
      return NextResponse.json({
        success: false,
        error: 'Failed to parse request body',
        step: 'body_parsing'
      });
    }
    
    const { courseId } = body;
    
    if (!courseId) {
      return NextResponse.json({
        success: false,
        error: 'Course ID is required',
        step: 'course_id_check'
      });
    }
    
    // Test 4: Check course existence
    let course;
    try {
      course = await prisma.course.findUnique({
        where: { id: courseId },
        select: {
          id: true,
          title: true,
          creatorId: true,
          price: true,
          isActive: true
        }
      });
      console.log('Course found:', course);
    } catch (dbError: any) {
      console.error('Database error finding course:', dbError);
      return NextResponse.json({
        success: false,
        error: 'Database error finding course',
        details: dbError.message,
        code: dbError.code,
        step: 'course_lookup'
      });
    }
    
    if (!course) {
      return NextResponse.json({
        success: false,
        error: 'Course not found',
        courseId,
        step: 'course_check'
      });
    }
    
    if (!course.isActive) {
      return NextResponse.json({
        success: false,
        error: 'Course is not active',
        course,
        step: 'course_active_check'
      });
    }
    
    // Test 5: Check existing enrollment
    let existingEnrollment;
    try {
      existingEnrollment = await prisma.courseEnrollment.findFirst({
        where: {
          studentId: session.user.id,
          courseId: courseId
        }
      });
      console.log('Existing enrollment:', existingEnrollment);
    } catch (dbError: any) {
      console.error('Database error checking enrollment:', dbError);
      return NextResponse.json({
        success: false,
        error: 'Database error checking enrollment',
        details: dbError.message,
        code: dbError.code,
        step: 'enrollment_check'
      });
    }
    
    if (existingEnrollment) {
      return NextResponse.json({
        success: false,
        error: 'Already enrolled in this course',
        enrollment: existingEnrollment,
        step: 'duplicate_check'
      });
    }
    
    // Test 6: Try to create enrollment
    try {
      const enrollmentData = {
        studentId: session.user.id,
        courseId: courseId,
        tutorId: course.creatorId,
        status: 'ACTIVE' as const,
        enrolledAt: new Date(),
        updatedAt: new Date()
      };
      
      console.log('Creating enrollment with data:', enrollmentData);
      
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
      console.error('Database error creating enrollment:', dbError);
      return NextResponse.json({
        success: false,
        error: 'Database error creating enrollment',
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
