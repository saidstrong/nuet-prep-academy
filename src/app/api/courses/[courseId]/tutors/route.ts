import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { courseId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { courseId } = params;

    try {
      // Try to get tutors from database
      const course = await prisma.course.findUnique({
        where: { id: courseId },
        include: {
          assignedTutors: {
            include: {
              profile: true
            }
          }
        }
      });

      if (!course) {
        return NextResponse.json({ error: 'Course not found' }, { status: 404 });
      }

      const tutors = course.assignedTutors.map(tutor => ({
        id: tutor.id,
        name: tutor.name,
        email: tutor.email,
        bio: tutor.profile?.bio || '',
        avatar: tutor.profile?.avatar || null,
        specialization: tutor.profile?.specialization || 'General',
        experience: tutor.profile?.experience || 0
      }));

      return NextResponse.json({
        success: true,
        tutors,
        courseTitle: course.title,
        source: 'database'
      });

    } catch (dbError) {
      console.error('Database error, using fallback data:', dbError);
      
      // Fallback to mock data
      const mockTutors = [
        {
          id: 'tutor-1',
          name: 'Dr. Sarah Johnson',
          email: 'sarah.johnson@nuet.com',
          bio: 'Mathematics expert with 10+ years of experience in NUET preparation',
          avatar: null,
          specialization: 'Mathematics',
          experience: 10
        },
        {
          id: 'tutor-2',
          name: 'Prof. Michael Chen',
          email: 'michael.chen@nuet.com',
          bio: 'Logical reasoning specialist and test preparation expert',
          avatar: null,
          specialization: 'Logical Reasoning',
          experience: 8
        },
        {
          id: 'tutor-3',
          name: 'Ms. Emily Rodriguez',
          email: 'emily.rodriguez@nuet.com',
          bio: 'English language instructor with focus on NUET exam requirements',
          avatar: null,
          specialization: 'English Language',
          experience: 6
        }
      ];

      return NextResponse.json({
        success: true,
        tutors: mockTutors,
        courseTitle: 'NUET Preparation Course',
        source: 'fallback',
        message: 'Using fallback data due to database issues'
      });
    }

  } catch (error) {
    console.error('Error fetching course tutors:', error);
    return NextResponse.json(
      { error: 'Failed to fetch course tutors' },
      { status: 500 }
    );
  }
}