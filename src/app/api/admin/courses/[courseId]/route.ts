import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(
  request: Request,
  { params }: { params: { courseId: string } }
) {
  try {
    // Check if user is authenticated and is admin
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

    const { courseId } = params;

    // Lazy import to prevent build-time issues
    const { prisma } = await import('@/lib/prisma');
    
    // Fetch the course with all related data
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        topics: {
          orderBy: { order: 'asc' },
          include: {
            materials: {
              orderBy: { order: 'asc' },
              select: {
                id: true,
                title: true,
                description: true,
                type: true,
                url: true,
                content: true,
                order: true,
                createdAt: true
              }
            },
            tests: {
              select: {
                id: true,
                title: true,
                description: true,
                duration: true,
                totalPoints: true,
                isActive: true,
                createdAt: true
              }
            }
          }
        },
        enrollments: {
          where: { status: 'ACTIVE' },
          select: {
            id: true,
            studentId: true,
            tutorId: true,
            enrolledAt: true
          }
        }
      }
    });

    if (!course) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      );
    }

    // Check if user has permission to view this course
    if (course.creatorId !== session.user.id) {
      return NextResponse.json(
        { error: 'You can only view courses you created' },
        { status: 403 }
      );
    }

    // Transform the data for the frontend
    const transformedCourse = {
      id: course.id,
      title: course.title,
      description: course.description,
      price: course.price,
      duration: course.duration,
      status: course.status,
      maxStudents: course.maxStudents,
      enrolledStudents: course.enrollments.length,
      topics: course.topics.map(topic => ({
        id: topic.id,
        title: topic.title,
        description: topic.description,
        order: topic.order,
        materials: topic.materials,
        tests: topic.tests
      })),
      createdAt: course.createdAt,
      updatedAt: course.updatedAt
    };

    return NextResponse.json({
      success: true,
      course: transformedCourse
    });

  } catch (error) {
    console.error('Error fetching course:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch course',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
