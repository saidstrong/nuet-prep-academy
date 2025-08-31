import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET() {
  try {
    // Check if user is authenticated and is admin
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

    // Lazy import to prevent build-time issues
    const { prisma } = await import('@/lib/prisma');
    
    // Fetch all tutors with their current student load
    const tutors = await prisma.user.findMany({
      where: {
        role: 'TUTOR'
      },
      include: {
        tutorEnrollments: {
          where: {
            status: 'ACTIVE'
          },
          select: {
            id: true
          }
        },
        profile: {
          select: {
            experience: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });

    // Transform the data to include student counts and capacity
    const transformedTutors = tutors.map(tutor => {
      const assignedStudents = tutor.tutorEnrollments.length;
      const maxStudents = 40; // Default max students per tutor
      
      return {
        id: tutor.id,
        name: tutor.name,
        email: tutor.email,
        assignedStudents,
        maxStudents,
        availableCapacity: Math.max(0, maxStudents - assignedStudents),
        experience: tutor.profile?.experience || 'No experience listed'
      };
    });

    // Filter to only show tutors with available capacity
    const availableTutors = transformedTutors.filter(tutor => tutor.availableCapacity > 0);

    return NextResponse.json({
      success: true,
      tutors: availableTutors,
      total: availableTutors.length
    });

  } catch (error) {
    console.error('Error fetching available tutors:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch available tutors',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
