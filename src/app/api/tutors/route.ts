import { NextResponse } from 'next/server';

export async function GET() {
  try {
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

    } catch (dbError: any) {
      console.log('❌ Database error, using mock tutors:', dbError.message);
      
      // Fallback: Mock tutors data
      const mockTutors = [
        {
          id: 'tutor-1',
          name: 'Dr. Sarah Johnson',
          email: 'sarah.johnson@nuet.com',
          role: 'TUTOR',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          profile: {
            id: 'profile-1',
            bio: 'Mathematics expert with 10+ years of experience',
            phone: '+7 777 123 4567',
            whatsapp: '+7 777 123 4567',
            experience: '10+ years in mathematics education'
          },
          tutorEnrollments: [
            { id: 'enrollment-1', courseId: 'course-1', studentId: 'student-1', status: 'ACTIVE' },
            { id: 'enrollment-2', courseId: 'course-1', studentId: 'student-2', status: 'ACTIVE' }
          ]
        },
        {
          id: 'tutor-2',
          name: 'Prof. Michael Chen',
          email: 'michael.chen@nuet.com',
          role: 'TUTOR',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          profile: {
            id: 'profile-2',
            bio: 'Critical thinking specialist and logic expert',
            phone: '+7 777 234 5678',
            whatsapp: '+7 777 234 5678',
            experience: '8+ years in critical thinking education'
          },
          tutorEnrollments: [
            { id: 'enrollment-3', courseId: 'course-2', studentId: 'student-1', status: 'ACTIVE' }
          ]
        },
        {
          id: 'tutor-3',
          name: 'Ms. Emily Rodriguez',
          email: 'emily.rodriguez@nuet.com',
          role: 'TUTOR',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          profile: {
            id: 'profile-3',
            bio: 'English language specialist and communication expert',
            phone: '+7 777 345 6789',
            whatsapp: '+7 777 345 6789',
            experience: '12+ years in English language education'
          },
          tutorEnrollments: [
            { id: 'enrollment-4', courseId: 'course-3', studentId: 'student-2', status: 'ACTIVE' }
          ]
        }
      ];

      return NextResponse.json({
        success: true,
        tutors: mockTutors,
      });
    }

  } catch (error) {
    console.error('Error fetching tutors:', error);
    return NextResponse.json({
      success: false,
      message: 'An error occurred while fetching tutors',
    }, { status: 500 });
  }
}
