import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Testing enrollment components...');

    // Test 1: Check if we can connect to database
    console.log('Test 1: Database connection...');
    const userCount = await prisma.user.count();
    console.log('✅ Database connected, user count:', userCount);

    // Test 2: Check if specific user exists
    console.log('Test 2: User lookup...');
    const testUser = await prisma.user.findUnique({
      where: { email: 'adilet.naizbayev@gmail.com' },
      select: { id: true, email: true, role: true }
    });
    console.log('User found:', testUser);

    // Test 3: Check if course exists
    console.log('Test 3: Course lookup...');
    const testCourse = await prisma.course.findUnique({
      where: { id: 'cmf6zxwj60001xum8pnemsq8v' },
      select: { id: true, title: true, isActive: true }
    });
    console.log('Course found:', testCourse);

    // Test 4: Check existing enrollments
    if (testUser) {
      console.log('Test 4: Existing enrollments...');
      const existingEnrollments = await prisma.courseEnrollment.findMany({
        where: { studentId: testUser.id },
        select: { id: true, courseId: true, status: true }
      });
      console.log('Existing enrollments:', existingEnrollments);
    }

    return NextResponse.json({
      success: true,
      tests: {
        databaseConnected: true,
        userCount,
        userFound: !!testUser,
        user: testUser,
        courseFound: !!testCourse,
        course: testCourse,
        existingEnrollments: testUser ? await prisma.courseEnrollment.findMany({
          where: { studentId: testUser.id },
          select: { id: true, courseId: true, status: true }
        }) : null
      }
    });
  } catch (error: any) {
    console.error('Test Enrollment API Error:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}
