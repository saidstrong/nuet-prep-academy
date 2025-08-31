import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET() {
  try {
    // Check if user is authenticated and is a student
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'STUDENT') {
      return NextResponse.json(
        { error: 'Unauthorized - Student access required' },
        { status: 401 }
      );
    }

    const { prisma } = await import('@/lib/prisma');

    // Fetch courses where the student is enrolled
    const enrollments = await prisma.courseEnrollment.findMany({
      where: {
        studentId: session.user.id,
        status: 'ACTIVE'
      },
      include: {
        course: {
          include: {
            topics: {
              include: {
                _count: {
                  select: {
                    materials: true,
                    tests: true
                  }
                }
              }
            }
          }
        }
      },
      orderBy: { enrolledAt: 'desc' }
    });

    // Transform the data to include progress information
    const transformedCourses = enrollments.map(enrollment => {
      const course = enrollment.course;
      const totalTopics = course.topics.length;
      const totalMaterials = course.topics.reduce((sum, topic) => sum + topic._count.materials, 0);
      const totalTests = course.topics.reduce((sum, topic) => sum + topic._count.tests, 0);

      // For now, we'll use placeholder progress values
      // In a real implementation, this would track actual student progress
      const completedTopics = Math.floor(Math.random() * totalTopics); // Placeholder
      const completedTests = Math.floor(Math.random() * totalTests); // Placeholder
      const progress = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;

      return {
        id: course.id,
        title: course.title,
        description: course.description,
        progress,
        totalTopics,
        completedTopics,
        totalTests,
        completedTests,
        lastAccessed: enrollment.enrolledAt.toISOString() // Placeholder - would track actual last access
      };
    });

    return NextResponse.json({
      success: true,
      courses: transformedCourses,
      total: transformedCourses.length
    });

  } catch (error) {
    console.error('Error fetching student courses:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch student courses',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
