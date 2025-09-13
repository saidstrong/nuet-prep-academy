import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET() {
  try {
    // Check if user is authenticated and is a tutor
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'TUTOR') {
      return NextResponse.json(
        { error: 'Unauthorized - Tutor access required' },
        { status: 401 }
      );
    }

    const { prisma } = await import('@/lib/prisma');
    
    // Fetch courses where the current user is assigned as a tutor
    const courses = await prisma.course.findMany({
      where: {
        OR: [
          {
            assignedTutors: {
              some: {
                id: session.user.id
              }
            }
          },
          {
            enrollments: {
              some: {
                tutorId: session.user.id,
                status: 'ACTIVE'
              }
            }
          }
        ],
        status: 'ACTIVE'
      },
      include: {
        topics: {
          orderBy: { order: 'asc' },
          include: {
            _count: {
              select: {
                materials: true,
                tests: true
              }
            }
          }
        },
        enrollments: {
          where: {
            tutorId: session.user.id,
            status: 'ACTIVE'
          },
          select: {
            id: true
          }
        }
      },
      orderBy: { title: 'asc' }
    });

    // Transform the data to include student counts and topic counts
    const transformedCourses = courses.map(course => ({
      id: course.id,
      title: course.title,
      description: course.description,
      price: course.price,
      duration: course.duration,
      status: course.status,
      studentCount: course.enrollments.length,
      topics: course.topics.map(topic => ({
        id: topic.id,
        title: topic.title,
        description: topic.description,
        order: topic.order,
        materialsCount: topic._count.materials,
        testsCount: topic._count.tests
      }))
    }));

    return NextResponse.json({
      success: true,
      courses: transformedCourses,
      total: transformedCourses.length
    });

  } catch (error) {
    console.error('Error fetching tutor courses:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch tutor courses',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
