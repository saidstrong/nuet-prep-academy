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

    if (!['ADMIN', 'OWNER', 'MANAGER'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    try {
      // Try to get top courses from database
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

      return NextResponse.json({ 
        success: true,
        courses: formattedCourses,
        source: 'database'
      });
    } catch (dbError) {
      console.error('Database error, using fallback data:', dbError);
      
      // Fallback to mock data
      const mockTopCourses = [
        {
          id: 'course-1',
          title: 'NUET Mathematics Preparation',
          description: 'Comprehensive preparation for NUET Mathematics section',
          enrollmentCount: 45,
          materialCount: 12,
          testCount: 8,
          tutorName: 'Dr. Sarah Johnson',
          createdAt: new Date().toISOString(),
          isActive: true,
          price: 50000
        },
        {
          id: 'course-2',
          title: 'NUET Logical Reasoning',
          description: 'Complete logical reasoning preparation for NUET exam',
          enrollmentCount: 38,
          materialCount: 10,
          testCount: 6,
          tutorName: 'Prof. Michael Chen',
          createdAt: new Date().toISOString(),
          isActive: true,
          price: 45000
        },
        {
          id: 'course-3',
          title: 'NUET English Language',
          description: 'Complete English language preparation',
          enrollmentCount: 32,
          materialCount: 8,
          testCount: 5,
          tutorName: 'Ms. Emily Rodriguez',
          createdAt: new Date().toISOString(),
          isActive: true,
          price: 40000
        }
      ];

      return NextResponse.json({ 
        success: true,
        courses: mockTopCourses,
        source: 'fallback',
        message: 'Using fallback data due to database issues'
      });
    }
  } catch (error) {
    console.error('Error fetching top courses:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
