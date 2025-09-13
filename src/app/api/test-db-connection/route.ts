import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    console.log('🔍 Testing database connection...');
    console.log('🔗 DATABASE_URL:', process.env.DATABASE_URL ? 'Set' : 'Not set');
    
    // Test simple query
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    console.log('✅ Database query successful:', result);
    
    // Test course count
    const courseCount = await prisma.course.count();
    console.log('📚 Course count:', courseCount);
    
    // Test fetching courses
    const courses = await prisma.course.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' }
    });
    console.log('📚 Sample courses:', courses.map(c => ({ id: c.id, title: c.title })));
    
    return NextResponse.json({
      success: true,
      message: 'Database connection successful',
      courseCount,
      sampleCourses: courses.map(c => ({ id: c.id, title: c.title, status: c.status }))
    });

  } catch (error: any) {
    console.error('❌ Database connection failed:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Database connection failed',
        details: error.message,
        code: error.code,
        databaseUrl: process.env.DATABASE_URL ? 'Set' : 'Not set'
      },
      { status: 500 }
    );
  }
}