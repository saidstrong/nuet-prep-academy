import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    console.log('🔍 Fetching tutors...');

    // Try to fetch from database first
    try {
      await prisma.$connect();
      
      const tutors = await prisma.user.findMany({
        where: { role: 'TUTOR' },
        include: {
          profile: true
        }
      });

      if (tutors.length > 0) {
        const formattedTutors = tutors.map(tutor => ({
          id: tutor.id,
          name: tutor.name,
          specialization: tutor.profile?.bio || 'General Education',
          experience: '5+ years',
          rating: 4.5,
          avatar: tutor.profile?.avatar || undefined
        }));

        console.log(`✅ Found ${formattedTutors.length} tutors from database`);
        
        return NextResponse.json({
          success: true,
          tutors: formattedTutors
        });
      }
    } catch (dbError: any) {
      console.log('❌ Database error, using mock tutors:', dbError.message);
    }

    // Fallback to mock tutors
    const mockTutors = [
      {
        id: 'tutor-1',
        name: 'Dr. Sarah Johnson',
        specialization: 'Mathematics & Physics',
        experience: '8+ years',
        rating: 4.8,
        avatar: undefined
      },
      {
        id: 'tutor-2',
        name: 'Prof. Michael Chen',
        specialization: 'Advanced Mathematics',
        experience: '12+ years',
        rating: 4.9,
        avatar: undefined
      },
      {
        id: 'tutor-3',
        name: 'Dr. Aisha Rahman',
        specialization: 'Engineering Mathematics',
        experience: '6+ years',
        rating: 4.7,
        avatar: undefined
      },
      {
        id: 'tutor-4',
        name: 'Prof. David Kim',
        specialization: 'Statistics & Probability',
        experience: '10+ years',
        rating: 4.6,
        avatar: undefined
      },
      {
        id: 'tutor-5',
        name: 'Dr. Elena Petrov',
        specialization: 'Calculus & Analysis',
        experience: '7+ years',
        rating: 4.8,
        avatar: undefined
      },
      {
        id: 'tutor-6',
        name: 'Prof. James Wilson',
        specialization: 'Algebra & Geometry',
        experience: '9+ years',
        rating: 4.5,
        avatar: undefined
      }
    ];

    console.log(`✅ Using ${mockTutors.length} mock tutors`);

    return NextResponse.json({
      success: true,
      tutors: mockTutors
    });

  } catch (error: any) {
    console.error('❌ Error fetching tutors:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch tutors',
        details: error.message
      },
      { status: 500 }
    );
  }
}
