import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

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
    
    // Fetch courses with their tutors and enrollment data
    const courses = await prisma.course.findMany({
      where: {
        status: 'ACTIVE'
      },
      include: {
        enrollments: {
          where: {
            status: 'ACTIVE'
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

    // Get all tutors for the courses
    const allTutorIds = new Set<string>();
    courses.forEach(course => {
      course.enrollments.forEach(enrollment => {
        if (enrollment.tutorId && enrollment.tutorId.trim() !== '') {
          allTutorIds.add(enrollment.tutorId);
        }
      });
    });

    // Fetch tutor details
    const tutors = await prisma.user.findMany({
      where: {
        id: { in: Array.from(allTutorIds) },
        role: 'TUTOR'
      },
      select: {
        id: true,
        name: true,
        email: true,
        profile: {
          select: {
            experience: true
          }
        }
      }
    });

    // Create tutor lookup map
    const tutorMap = new Map();
    tutors.forEach(tutor => {
      tutorMap.set(tutor.id, {
        id: tutor.id,
        name: tutor.name,
        email: tutor.email,
        experience: tutor.profile?.experience || 'Teaching experience'
      });
    });

    // Transform the data to include available tutors with capacity
    const transformedCourses = courses.map(course => {
      // Group enrollments by tutor
      const tutorEnrollments = course.enrollments
        .filter(enrollment => enrollment.tutorId && enrollment.tutorId.trim() !== '')
        .reduce((acc, enrollment) => {
          if (!acc[enrollment.tutorId]) {
            acc[enrollment.tutorId] = [];
          }
          acc[enrollment.tutorId].push(enrollment);
          return acc;
        }, {} as Record<string, any[]>);

      // Get available tutors with their data
      const availableTutors = Object.keys(tutorEnrollments).map(tutorId => {
        const tutorData = tutorMap.get(tutorId);
        return {
          id: tutorId,
          name: tutorData?.name || 'Unknown Tutor',
          email: tutorData?.email || 'tutor@email.com',
          assignedStudents: tutorEnrollments[tutorId].length,
          maxStudents: 40,
          experience: tutorData?.experience || 'Teaching experience'
        };
      });

      return {
        id: course.id,
        title: course.title,
        description: course.description,
        price: course.price,
        duration: course.duration,
        availableTutors
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
