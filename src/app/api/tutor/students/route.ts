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
    
    // Fetch students enrolled in courses where the current user is the tutor
    const enrollments = await prisma.courseEnrollment.findMany({
      where: {
        tutorId: session.user.id,
        status: 'ACTIVE'
      },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        course: {
          select: {
            id: true,
            title: true
          }
        }
      },
      orderBy: { enrolledAt: 'desc' }
    });

    // Transform the data to include student information and progress
    const transformedStudents = enrollments.map(enrollment => {
      // For now, we'll use a placeholder progress calculation
      // In a real implementation, this would be calculated based on test scores, completed materials, etc.
      const progress = Math.floor(Math.random() * 100); // Placeholder - replace with actual progress calculation
      
      // For now, we'll use the enrollment date as last activity
      // In a real implementation, this would track actual student activity
      const lastActivity = enrollment.enrolledAt;
      
      return {
        id: enrollment.student.id,
        name: enrollment.student.name,
        email: enrollment.student.email,
        enrolledAt: enrollment.enrolledAt.toISOString(),
        progress,
        lastActivity: lastActivity.toISOString(),
        courseId: enrollment.course.id,
        courseTitle: enrollment.course.title
      };
    });

    return NextResponse.json({
      success: true,
      students: transformedStudents,
      total: transformedStudents.length
    });

  } catch (error) {
    console.error('Error fetching tutor students:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch tutor students',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
