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
  } catch (error) {
    console.error('Error fetching recent users:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
