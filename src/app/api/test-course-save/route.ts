import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    console.log('🔍 Testing database connection and course saving...');
    
    // Test database connection
    const userCount = await prisma.user.count();
    console.log(`✅ Database connected. User count: ${userCount}`);
    
    // Check if there are any courses
    const courseCount = await prisma.course.count();
    console.log(`📚 Total courses in database: ${courseCount}`);
    
    // Get all courses
    const courses = await prisma.course.findMany({
      select: {
        id: true,
        title: true,
        instructor: true,
        createdAt: true,
        status: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    console.log('📋 Courses found:', courses);
    
    return NextResponse.json({
      success: true,
      userCount,
      courseCount,
      courses
    });
    
  } catch (error: any) {
    console.error('❌ Database test failed:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      code: error.code
    }, { status: 500 });
  }
}

export async function POST() {
  try {
    console.log('🧪 Testing course creation...');
    
    // Create a test course
    const testCourse = await prisma.course.create({
      data: {
        title: 'Test Course - ' + new Date().toISOString(),
        description: 'This is a test course created to verify database functionality',
        instructor: 'Test Instructor',
        difficulty: 'BEGINNER',
        estimatedHours: 1,
        price: 0,
        duration: '1 hour',
        maxStudents: 30,
        status: 'ACTIVE',
        isActive: true,
        creatorId: 'test-creator-id'
      }
    });
    
    console.log('✅ Test course created:', testCourse);
    
    return NextResponse.json({
      success: true,
      course: testCourse
    });
    
  } catch (error: any) {
    console.error('❌ Course creation test failed:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      code: error.code
    }, { status: 500 });
  }
}
