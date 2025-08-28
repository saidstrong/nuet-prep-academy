import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'TUTOR') {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { prisma } = await import('@/lib/prisma');

    // Get courses where the tutor is assigned as a tutor
    const courses = await prisma.course.findMany({
      where: {
        enrollments: {
          some: {
            tutorId: session.user.id,
          },
        },
      },
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
                  include: {
                    student: {
                      select: {
                        id: true,
                        name: true,
                        email: true,
                      },
                    },
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
        enrollments: {
          where: {
            tutorId: session.user.id,
          },
          include: {
            student: {
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
    console.error('Error fetching tutor courses:', error);
    return NextResponse.json({
      success: false,
      message: 'An error occurred while fetching courses',
    }, { status: 500 });
  }
}
