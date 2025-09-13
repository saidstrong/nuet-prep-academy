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

    if (session.user.role !== 'TUTOR' && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden: Only tutors and admins can create materials' }, { status: 403 });
    }

    const body = await request.json();
    const { title, description, type, url, topicId, order, isPublished, fileSize, fileName, mimeType } = body;

    // Validate required fields
    if (!title || !type || !topicId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Verify the topic exists and user has access
    const topic = await prisma.topic.findFirst({
      where: { id: topicId },
      include: { 
        course: {
          include: {
            assignedTutors: true
          }
        } 
      }
    });

    if (!topic) {
      return NextResponse.json({ error: 'Topic not found' }, { status: 404 });
    }

    // Check if user is the course creator or assigned tutor
    if (session.user.role !== 'ADMIN' && 
        topic.course.creatorId !== session.user.id && 
        !topic.course.assignedTutors.some(tutor => tutor.id === session.user.id)) {
      return NextResponse.json({ error: 'Forbidden: You can only add materials to your own courses' }, { status: 403 });
    }

    // Create the material
    const material = await prisma.material.create({
      data: {
        title,
        description,
        type,
        url: url || null,
        content: type === 'TEXT' ? url : null,
        order: order || 1,
        isPublished: isPublished || false,
        fileSize: fileSize || null,
        fileName: fileName || null,
        mimeType: mimeType || null,
        topicId
      }
    });

    return NextResponse.json(material, { status: 201 });

  } catch (error) {
    console.error('Error creating material:', error);
    return NextResponse.json(
      { error: 'Failed to create material' },
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

    const { searchParams } = new URL(request.url);
    const topicId = searchParams.get('topicId');
    const courseId = searchParams.get('courseId');
    const includeProgress = searchParams.get('includeProgress') === 'true';

    if (!topicId && !courseId) {
      return NextResponse.json({ error: 'Missing topicId or courseId parameter' }, { status: 400 });
    }

    let whereClause: any = {};
    let includeClause: any = {
      topic: {
        include: {
          course: true
        }
      }
    };

    if (topicId) {
      whereClause.topicId = topicId;
    } else if (courseId) {
      whereClause.topic = {
        courseId: courseId
      };
    }

    // Add progress tracking if requested and user is a student
    if (includeProgress && session.user.role === 'STUDENT') {
      includeClause.progress = {
        where: {
          studentId: session.user.id
        }
      };
    }

    const materials = await prisma.material.findMany({
      where: whereClause,
      include: includeClause,
      orderBy: [
        { topic: { order: 'asc' } },
        { order: 'asc' }
      ]
    });

    // Transform the data to include progress information
    const transformedMaterials = materials.map(material => ({
      ...material,
      progress: material.progress?.[0] || null
    }));

    return NextResponse.json(transformedMaterials);

  } catch (error) {
    console.error('Error fetching materials:', error);
    return NextResponse.json(
      { error: 'Failed to fetch materials' },
      { status: 500 }
    );
  }
}
