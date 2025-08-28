import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'STUDENT') {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { prisma } = await import('@/lib/prisma');

    const enrolledCourses = await prisma.courseEnrollment.findMany({
      where: {
        studentId: session.user.id,
        status: 'ACTIVE',
      },
      include: {
        course: {
          include: {
            topics: {
              include: {
                materials: {
                  orderBy: {
                    order: 'asc',
                  },
                },
                tests: {
                  include: {
                    submissions: {
                      where: {
                        studentId: session.user.id,
                      },
                    },
                  },
                  orderBy: {
                    createdAt: 'asc',
                  },
                },
              },
              orderBy: {
                order: 'asc',
              },
            },
          },
        },
        tutor: {
          include: {
            profile: {
              select: {
                phone: true,
                whatsapp: true,
              },
            },
          },
        },
      },
      orderBy: {
        enrolledAt: 'desc',
      },
    });

    return NextResponse.json({
      success: true,
      courses: enrolledCourses,
    });

  } catch (error) {
    console.error('Error fetching enrolled courses:', error);
    return NextResponse.json({
      success: false,
      message: 'An error occurred while fetching enrolled courses',
    }, { status: 500 });
  }
}
