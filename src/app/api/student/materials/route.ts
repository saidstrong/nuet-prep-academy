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

    // Fetch materials from courses where the student is enrolled
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
                materials: {
                  orderBy: { order: 'asc' }
                }
              }
            }
          }
        }
      }
    });

    // Transform the data to include material information
    const materials: any[] = [];
    
    enrollments.forEach(enrollment => {
      const course = enrollment.course;
      
      course.topics.forEach(topic => {
        topic.materials.forEach(material => {
          // For now, we'll use placeholder completion status
          // In a real implementation, this would track actual student progress
          const isCompleted = Math.random() > 0.5; // Placeholder
          const lastAccessed = new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000); // Placeholder

          materials.push({
            id: material.id,
            title: material.title,
            type: material.type,
            courseTitle: course.title,
            topicTitle: topic.title,
            lastAccessed: lastAccessed.toISOString(),
            isCompleted
          });
        });
      });
    });

    // Sort by last accessed date (most recent first)
    materials.sort((a, b) => new Date(b.lastAccessed).getTime() - new Date(a.lastAccessed).getTime());

    return NextResponse.json({
      success: true,
      materials,
      total: materials.length
    });

  } catch (error) {
    console.error('Error fetching student materials:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch student materials',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
