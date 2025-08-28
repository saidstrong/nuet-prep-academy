import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const { prisma } = await import('@/lib/prisma');

    const tutors = await prisma.user.findMany({
      where: {
        role: 'TUTOR',
      },
      include: {
        profile: {
          select: {
            id: true,
            bio: true,
            phone: true,
            whatsapp: true,
            experience: true,
          },
        },
        tutorEnrollments: {
          select: {
            id: true,
            courseId: true,
            studentId: true,
            status: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({
      success: true,
      tutors,
    });

  } catch (error) {
    console.error('Error fetching tutors:', error);
    return NextResponse.json({
      success: false,
      message: 'An error occurred while fetching tutors',
    }, { status: 500 });
  }
}
