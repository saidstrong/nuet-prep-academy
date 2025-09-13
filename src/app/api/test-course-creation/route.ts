import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    console.log('Testing course creation and retrieval...');
    
    // First, check if we can connect to the database
    await prisma.$connect();
    console.log('✅ Database connected');
    
    // Count existing courses
    const courseCount = await prisma.course.count();
    console.log(`📊 Total courses in database: ${courseCount}`);
    
    // Get all courses
    const courses = await prisma.course.findMany({
      select: {
        id: true,
        title: true,
        description: true,
        instructor: true,
        difficulty: true,
        estimatedHours: true,
        price: true,
        duration: true,
        maxStudents: true,
        status: true,
        isActive: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    console.log(`📋 Retrieved ${courses.length} courses`);
    
    return NextResponse.json({
      success: true,
      message: 'Course test successful',
      courseCount,
      courses: courses.slice(0, 5), // Return first 5 courses for testing
      totalCourses: courses.length
    });
    
  } catch (error: any) {
    console.error('❌ Course test failed:', error);
    return NextResponse.json({
      success: false,
      error: 'Course test failed',
      details: error.message,
      code: error.code
    }, { status: 500 });
  }
}
