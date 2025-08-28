import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const { prisma } = await import('@/lib/prisma');

    const courses = await prisma.course.findMany({
      where: {
        status: 'ACTIVE',
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        enrollments: {
          select: {
            id: true,
            studentId: true,
            tutorId: true,
            status: true,
          },
        },
        topics: {
          select: {
            id: true,
            title: true,
            order: true,
          },
          orderBy: {
            order: 'asc',
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
