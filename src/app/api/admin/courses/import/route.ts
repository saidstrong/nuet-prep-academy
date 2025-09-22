import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !['ADMIN', 'OWNER', 'MANAGER'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { courses } = body;

    if (!courses || !Array.isArray(courses)) {
      return NextResponse.json(
        { error: 'Invalid courses data' },
        { status: 400 }
      );
    }

    const importedCourses = [];

    for (const courseData of courses) {
      try {
        const course = await prisma.course.create({
          data: {
            title: courseData.title,
            description: courseData.description || '',
            level: courseData.level || 'BEGINNER',
            status: courseData.status || 'DRAFT',
            price: courseData.price || 0,
            duration: courseData.duration || 0,
            thumbnail: courseData.thumbnail || null,
            tutorId: courseData.tutorId || null,
            topics: {
              create: courseData.topics?.map((topic: any) => ({
                title: topic.title,
                description: topic.description || '',
                order: topic.order || 0,
                subtopics: {
                  create: topic.subtopics?.map((subtopic: any) => ({
                    title: subtopic.title,
                    content: subtopic.content || '',
                    type: subtopic.type || 'TEXT',
                    order: subtopic.order || 0
                  })) || []
                }
              })) || []
            }
          },
          include: {
            topics: {
              include: {
                subtopics: true
              }
            }
          }
        });

        importedCourses.push(course);
      } catch (error) {
        console.error(`Error importing course ${courseData.title}:`, error);
        // Continue with other courses
      }
    }

    return NextResponse.json({
      success: true,
      message: `Successfully imported ${importedCourses.length} courses`,
      courses: importedCourses
    });

  } catch (error) {
    console.error('Error importing courses:', error);
    return NextResponse.json(
      { error: 'Failed to import courses' },
      { status: 500 }
    );
  }
}
