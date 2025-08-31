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
    
    // Fetch courses with assigned tutors and their capacity
    const courses = await prisma.course.findMany({
      where: {
        status: 'ACTIVE'
      },
      include: {
        enrollments: {
          where: {
            status: 'ACTIVE',
            tutorId: { not: null }
          },
          select: {
            tutorId: true,
            studentId: true
          }
        }
      },
      orderBy: {
        title: 'asc'
      }
    });

    // Transform the data to include available tutors with capacity
    const transformedCourses = courses.map(course => {
      // Group enrollments by tutor to get tutor capacity
      const tutorEnrollments = course.enrollments.reduce((acc, enrollment) => {
        if (enrollment.tutorId) {
          if (!acc[enrollment.tutorId]) {
            acc[enrollment.tutorId] = [];
          }
          acc[enrollment.tutorId].push(enrollment);
        }
        return acc;
      }, {} as Record<string, any[]>);

      // Get unique tutor IDs
      const tutorIds = Object.keys(tutorEnrollments);
      
      // For now, we'll return basic course info
      // In a real implementation, you'd fetch tutor details here
      return {
        id: course.id,
        title: course.title,
        description: course.description,
        price: course.price,
        duration: course.duration,
        availableTutors: tutorIds.map(tutorId => ({
          id: tutorId,
          name: 'Tutor Name', // This would be fetched from tutor data
          email: 'tutor@email.com',
          assignedStudents: tutorEnrollments[tutorId].length,
          maxStudents: 40,
          experience: 'Teaching experience'
        }))
      };
    });

    return NextResponse.json({
      success: true,
      courses: transformedCourses,
      total: transformedCourses.length
    });

  } catch (error) {
    console.error('Error fetching available courses:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch available courses',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
