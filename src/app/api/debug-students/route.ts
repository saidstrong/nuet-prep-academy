import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    console.log('Debug: Starting students query...');
    
    // Test basic connection
    const connectionTest = await prisma.$queryRaw`SELECT 1 as test`;
    console.log('Debug: Connection test result:', connectionTest);
    
    // Count total users
    const totalUsers = await prisma.user.count();
    console.log('Debug: Total users in database:', totalUsers);
    
    // Count students specifically
    const totalStudents = await prisma.user.count({
      where: { role: 'STUDENT' }
    });
    console.log('Debug: Total students in database:', totalStudents);
    
    // Get all users with basic info
    const allUsers = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' }
    });
    console.log('Debug: All users:', allUsers);
    
    // Get students with basic info
    const students = await prisma.user.findMany({
      where: { role: 'STUDENT' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' }
    });
    console.log('Debug: Students found:', students);
    
    return NextResponse.json({
      success: true,
      debug: {
        connectionTest,
        totalUsers,
        totalStudents,
        allUsers,
        students
      }
    });
    
  } catch (error: any) {
    console.error('Debug students error:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}
