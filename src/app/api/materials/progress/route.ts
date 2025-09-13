import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.user.role !== 'STUDENT') {
      return NextResponse.json({ error: 'Forbidden: Only students can update material progress' }, { status: 403 });
    }

    const body = await request.json();
    const { materialId, status, timeSpent } = body;

    if (!materialId || !status) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Verify the material exists and student is enrolled in the course
    const material = await prisma.material.findFirst({
      where: { id: materialId },
      include: {
        topic: {
          include: {
            course: {
              include: {
                enrollments: {
                  where: {
                    studentId: session.user.id,
                    status: 'ACTIVE'
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!material) {
      return NextResponse.json({ error: 'Material not found' }, { status: 404 });
    }

    if (!material.topic || material.topic.course.enrollments.length === 0) {
      return NextResponse.json({ error: 'Forbidden: You must be enrolled in this course to access materials' }, { status: 403 });
    }

    // Update or create progress record
    const progress = await prisma.materialProgress.upsert({
      where: {
        materialId_studentId: {
          materialId,
          studentId: session.user.id
        }
      },
      update: {
        status,
        timeSpent: timeSpent || 0,
        lastAccessed: new Date(),
        completedAt: status === 'COMPLETED' ? new Date() : null
      },
      create: {
        materialId,
        studentId: session.user.id,
        status,
        timeSpent: timeSpent || 0,
        lastAccessed: new Date(),
        completedAt: status === 'COMPLETED' ? new Date() : null
      }
    });

    return NextResponse.json(progress);

  } catch (error) {
    console.error('Error updating material progress:', error);
    return NextResponse.json(
      { error: 'Failed to update progress' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.user.role !== 'STUDENT') {
      return NextResponse.json({ error: 'Forbidden: Only students can view their progress' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get('courseId');

    if (!courseId) {
      return NextResponse.json({ error: 'Missing courseId parameter' }, { status: 400 });
    }

    // Get all progress for materials in the specified course
    const progress = await prisma.materialProgress.findMany({
      where: {
        studentId: session.user.id,
        material: {
          topic: {
            courseId: courseId
          }
        }
      },
      include: {
        material: {
          include: {
            topic: true
          }
        }
      },
      orderBy: [
        { material: { topic: { order: 'asc' } } },
        { material: { order: 'asc' } }
      ]
    });

    return NextResponse.json(progress);

  } catch (error) {
    console.error('Error fetching material progress:', error);
    return NextResponse.json(
      { error: 'Failed to fetch progress' },
      { status: 500 }
    );
  }
}
