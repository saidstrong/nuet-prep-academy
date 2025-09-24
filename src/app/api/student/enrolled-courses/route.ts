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

    // Test database connection first
    try {
      await prisma.$connect();
    } catch (dbError: any) {
      console.error('❌ Database connection failed, using mock enrolled courses:', dbError);
      return NextResponse.json({
        success: true,
        courses: [],
        source: 'mock',
        message: 'No enrolled courses found (using mock data due to database issues)'
      });
    }

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
                  where: {
                    isPublished: true
                  },
                  orderBy: {
                    order: 'asc',
                  },
                },
                tests: {
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
          select: {
            id: true,
            name: true,
            email: true,
            profile: {
              select: {
                phone: true,
                whatsapp: true,
                specialization: true,
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

  } catch (error: any) {
    console.error('Error fetching enrolled courses:', error);
    
    // Fallback to mock data if database fails
    const session = await getServerSession(authOptions);
    if (session && session.user.role === 'STUDENT') {
      return NextResponse.json({
        success: true,
        courses: [],
        source: 'mock',
        message: 'No enrolled courses found (using mock data due to database issues)'
      });
    }
    
    return NextResponse.json({
      success: false,
      message: 'An error occurred while fetching enrolled courses',
    }, { status: 500 });
  }
}
