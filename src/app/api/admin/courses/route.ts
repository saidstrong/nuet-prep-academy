import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { prisma } = await import('@/lib/prisma');

    const courses = await prisma.course.findMany({
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        enrollments: {
          include: {
            student: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            tutor: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        assignedTutors: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        topics: {
          select: {
            id: true,
            title: true,
            materials: {
              select: {
                id: true,
                title: true,
                type: true,
              },
            },
            tests: {
              select: {
                id: true,
                title: true,
                duration: true,
                totalPoints: true,
                isActive: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({
      success: true,
      courses,
    });

  } catch (error) {
    console.error('Error fetching courses:', error);
    return NextResponse.json({
      success: false,
      message: 'An error occurred while fetching courses',
    }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { title, description, price, duration, maxStudents, status } = body;

    if (!title || !description || !price || !duration) {
      return NextResponse.json({
        success: false,
        message: 'Missing required fields',
      }, { status: 400 });
    }

    const { prisma } = await import('@/lib/prisma');

    const course = await prisma.course.create({
      data: {
        title,
        description,
        price: parseFloat(price),
        duration,
        maxStudents: maxStudents || 30,
        status: status || 'ACTIVE',
        creatorId: session.user.id,
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Course created successfully',
      course,
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating course:', error);
    return NextResponse.json({
      success: false,
      message: 'An error occurred while creating the course',
    }, { status: 500 });
  }
}
