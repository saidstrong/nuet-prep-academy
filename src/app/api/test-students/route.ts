import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET() {
  try {
    console.log('🔍 Testing students API...');
    
    const session = await getServerSession(authOptions);
    
    if (!session || !['ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ 
        success: false, 
        error: 'Unauthorized - Admin access required' 
      }, { status: 401 });
    }

    // Lazy import to prevent build-time issues
    const { prisma } = await import('@/lib/prisma');
    
    console.log('🔍 Testing database connection...');
    
    // Test basic database connection
    const userCount = await prisma.user.count();
    console.log(`✅ Total users in database: ${userCount}`);
    
    // Get all users with their roles
    const allUsers = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    console.log(`✅ All users:`, allUsers);
    
    // Get only students
    const students = await prisma.user.findMany({
      where: {
        role: 'STUDENT'
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    console.log(`✅ Students found: ${students.length}`, students);

    return NextResponse.json({
      success: true,
      totalUsers: userCount,
      allUsers: allUsers,
      students: students,
      studentCount: students.length,
      message: 'Database connection successful'
    });

  } catch (error) {
    console.error('❌ Students test error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Students test failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
