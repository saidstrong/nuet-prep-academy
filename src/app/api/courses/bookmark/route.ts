import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in' },
        { status: 401 }
      );
    }

    if (session.user.role !== 'STUDENT') {
      return NextResponse.json(
        { error: 'Forbidden - Student access required' },
        { status: 403 }
      );
    }

    const { courseId, isBookmarked } = await request.json();

    if (!courseId) {
      return NextResponse.json(
        { error: 'Course ID is required' },
        { status: 400 }
      );
    }

    // Verify course exists
    const course = await prisma.course.findUnique({
      where: { id: courseId }
    });

    if (!course) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      );
    }

    try {
      if (isBookmarked) {
        // Add to bookmarks
        await prisma.courseBookmark.upsert({
          where: {
            studentId_courseId: {
              studentId: session.user.id,
              courseId: courseId
            }
          },
          update: {},
          create: {
            studentId: session.user.id,
            courseId: courseId
          }
        });
      } else {
        // Remove from bookmarks
        await prisma.courseBookmark.deleteMany({
          where: {
            studentId: session.user.id,
            courseId: courseId
          }
        });
      }
    } catch (error: any) {
      console.error('Error updating bookmarks:', error);
      return NextResponse.json(
        { error: 'Bookmarks feature not available yet' },
        { status: 503 }
      );
    }

    return NextResponse.json({
      success: true,
      isBookmarked: isBookmarked
    });

  } catch (error: any) {
    console.error('Error toggling course bookmark:', error);
    return NextResponse.json(
      { error: 'Failed to toggle bookmark' },
      { status: 500 }
    );
  }
}
