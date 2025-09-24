import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Test database connection first
    try {
      await prisma.$connect();
    } catch (dbError: any) {
      console.error('❌ Database connection failed, using mock recent users:', dbError);
      return NextResponse.json({
        users: [
          {
            id: 'mock-1',
            name: 'John Doe',
            email: 'john@example.com',
            role: 'STUDENT',
            createdAt: new Date().toISOString(),
            enrollmentCount: 2
          },
          {
            id: 'mock-2',
            name: 'Jane Smith',
            email: 'jane@example.com',
            role: 'STUDENT',
            createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            enrollmentCount: 1
          }
        ],
        source: 'mock'
      });
    }

    // Get recent users (last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const recentUsers = await prisma.user.findMany({
      take: 20,
      where: {
        createdAt: { gte: thirtyDaysAgo }
      },
      include: {
        _count: {
          select: {
            studentEnrollments: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Format the response
    const formattedUsers = recentUsers.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      enrollmentCount: user._count.studentEnrollments
    }));

    return NextResponse.json({ users: formattedUsers });
  } catch (error: any) {
    console.error('Error fetching recent users:', error);
    
    // Fallback to mock data if database fails
    const session = await getServerSession(authOptions);
    if (session && session.user && session.user.role === 'ADMIN') {
      return NextResponse.json({
        users: [
          {
            id: 'mock-1',
            name: 'John Doe',
            email: 'john@example.com',
            role: 'STUDENT',
            createdAt: new Date().toISOString(),
            enrollmentCount: 2
          },
          {
            id: 'mock-2',
            name: 'Jane Smith',
            email: 'jane@example.com',
            role: 'STUDENT',
            createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            enrollmentCount: 1
          }
        ],
        source: 'mock',
        message: 'Using mock data due to database issues'
      });
    }
    
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
