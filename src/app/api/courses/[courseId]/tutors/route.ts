import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { courseId: string } }
) {
  try {
    const courseId = params.courseId;
    console.log('Fetching tutors for course:', courseId);

    // First, check if course exists
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: { id: true, title: true }
    });

    if (!course) {
      console.log('Course not found:', courseId);
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      );
    }

    console.log('Course found:', course.title);

    // Get all available tutors (without profile for now)
    const tutors = await prisma.user.findMany({
      where: {
        role: 'TUTOR'
      },
      select: {
        id: true,
        name: true,
        email: true
      },
      orderBy: {
        name: 'asc'
      }
    });

    console.log('Found tutors:', tutors.length);

    return NextResponse.json({ 
      tutors: tutors,
      hasAssignedTutors: false,
      courseId: courseId
    });
  } catch (error) {
    console.error('Error fetching course tutors:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch tutors',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
