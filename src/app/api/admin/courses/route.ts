import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET() {
  try {
    // Check if user is authenticated and is admin
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

    // Lazy import to prevent build-time issues
    const { prisma } = await import('@/lib/prisma');
    
    // Fetch all courses with related data
    const courses = await prisma.course.findMany({
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        topics: {
          select: {
            id: true,
            title: true
          }
        },
        materials: {
          select: {
            id: true
          }
        },
        tests: {
          select: {
            id: true
          }
        },
        enrollments: {
          where: {
            status: 'ACTIVE'
          },
          select: {
            id: true,
            studentId: true,
            tutorId: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Transform the data for the dashboard
    const transformedCourses = courses.map(course => {
      // Get unique tutors from enrollments
      const tutors = [...new Set(course.enrollments.map(enrollment => enrollment.tutorId))];
      
      // Count enrolled students
      const enrolledStudents = course.enrollments.length;
      
      return {
        id: course.id,
        title: course.title,
        description: course.description,
        price: course.price,
        duration: course.duration,
        status: course.status,
        creatorId: course.creatorId,
        creatorName: course.creator.name,
        maxStudents: course.maxStudents || 40,
        enrolledStudents,
        tutors,
        topics: course.topics.length,
        materials: course.materials.length,
        tests: course.tests.length,
        createdAt: course.createdAt,
        updatedAt: course.updatedAt
      };
    });

    return NextResponse.json({
      success: true,
      courses: transformedCourses,
      total: transformedCourses.length
    });

  } catch (error) {
    console.error('Error fetching admin courses:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch courses',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    // Check if user is authenticated and is admin
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { title, description, price, duration, maxStudents, status } = body;

    // Validate required fields
    if (!title || !description || price === undefined || !duration) {
      return NextResponse.json(
        { error: 'Missing required fields: title, description, price, duration' },
        { status: 400 }
      );
    }

    // Lazy import to prevent build-time issues
    const { prisma } = await import('@/lib/prisma');
    
    // Create the course
    const course = await prisma.course.create({
      data: {
        title,
        description,
        price: parseFloat(price),
        duration,
        maxStudents: maxStudents || 40,
        status: status || 'ACTIVE',
        creatorId: session.user.id
      }
    });

    return NextResponse.json({
      success: true,
      course,
      message: 'Course created successfully'
    });

  } catch (error) {
    console.error('Error creating course:', error);
    return NextResponse.json(
      { 
        error: 'Failed to create course',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}


