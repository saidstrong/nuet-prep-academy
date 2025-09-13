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

    // Get top courses by enrollment count
    const topCourses = await prisma.course.findMany({
      take: 10,
      orderBy: {
        enrollments: {
          _count: 'desc'
        }
      },
      include: {
        _count: {
          select: {
            enrollments: true
          }
        },
        creator: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });

    // Format the response
    const formattedCourses = topCourses.map(course => ({
      id: course.id,
      title: course.title,
      description: course.description,
      enrollmentCount: course._count.enrollments,
      materialCount: 0, // Mock data - replace with actual calculation
      testCount: 0, // Mock data - replace with actual calculation
      tutorName: course.creator?.name || 'Unknown',
      createdAt: course.createdAt,
      isActive: course.isActive,
      price: course.price || 0
    }));

    return NextResponse.json({ courses: formattedCourses });
  } catch (error) {
    console.error('Error fetching top courses:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
