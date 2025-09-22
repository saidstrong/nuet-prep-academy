import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { courseId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has access to this course
    const enrollment = await prisma.courseEnrollment.findFirst({
      where: {
        userId: session.user.id,
        courseId: params.courseId,
        status: 'ACTIVE'
      }
    });

    // Allow admins, tutors, and enrolled students
    const isAuthorized = 
      ['ADMIN', 'OWNER', 'MANAGER'].includes(session.user.role) ||
      session.user.role === 'TUTOR' ||
      enrollment;

    if (!isAuthorized) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Fetch course with materials
    const course = await prisma.course.findUnique({
      where: { id: params.courseId },
      include: {
        topics: {
          include: {
            subtopics: {
              where: {
                type: { in: ['VIDEO', 'DOCUMENT', 'PRESENTATION', 'IMAGE', 'AUDIO'] }
              }
            }
          }
        }
      }
    });

    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    // Format materials
    const materials = course.topics.flatMap(topic =>
      topic.subtopics.map(subtopic => ({
        id: subtopic.id,
        title: subtopic.title,
        type: subtopic.type,
        url: subtopic.content,
        description: subtopic.description || '',
        duration: subtopic.duration || null,
        size: subtopic.size || null,
        uploadedAt: subtopic.createdAt.toISOString()
      }))
    );

    return NextResponse.json({
      success: true,
      course: {
        id: course.id,
        title: course.title,
        description: course.description,
        materials
      }
    });

  } catch (error) {
    console.error('Error fetching course materials:', error);
    return NextResponse.json(
      { error: 'Failed to fetch course materials' },
      { status: 500 }
    );
  }
}
