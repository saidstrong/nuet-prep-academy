import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in' },
        { status: 401 }
      );
    }

    if (session.user.role !== 'STUDENT') {
      return NextResponse.json(
        { error: 'Forbidden - Student access required' },
        { status: 403 }
      );
    }

    // Get student's enrolled courses
    const enrolledCourses = await prisma.courseEnrollment.findMany({
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
                  where: {
                    isPublished: true
                  },
                  orderBy: {
                    order: 'asc'
                  }
                }
              },
              orderBy: {
                order: 'asc'
              }
            }
          }
        }
      }
    });

    // Flatten materials from all enrolled courses
    const materials = [];
    
    for (const enrollment of enrolledCourses) {
      for (const topic of enrollment.course.topics) {
        for (const material of topic.materials) {
          // Get material progress if exists (simplified for now)
          const progress = null; // MaterialProgress model might not exist yet

          materials.push({
            id: material.id,
            title: material.title,
            description: material.description,
            type: material.type,
            url: material.url,
            content: material.content,
            fileName: material.fileName,
            fileSize: material.fileSize,
            mimeType: material.mimeType,
            order: material.order,
            isPublished: material.isPublished,
            createdAt: material.createdAt,
            updatedAt: material.updatedAt,
            courseTitle: enrollment.course.title,
            topicTitle: topic.title,
            lastAccessed: material.createdAt,
            isCompleted: false, // Default to false for now
            estimatedTime: 30, // Default estimated time
            priority: 'MEDIUM' // Default priority
          });
        }
      }
    }

    // Sort by last accessed (most recent first)
    materials.sort((a, b) => new Date(b.lastAccessed).getTime() - new Date(a.lastAccessed).getTime());

    return NextResponse.json({
      success: true,
      materials: materials
    });

  } catch (error: any) {
    console.error('Error fetching student materials:', error);
    return NextResponse.json(
      { error: 'Failed to fetch materials' },
      { status: 500 }
    );
  }
}