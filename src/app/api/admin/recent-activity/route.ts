import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get recent activities (last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const [
      recentEnrollments,
      recentCourses,
      recentUsers
    ] = await Promise.all([
      prisma.courseEnrollment.findMany({
        take: 10,
        where: {
          enrolledAt: { gte: thirtyDaysAgo }
        },
        include: {
          student: {
            select: { name: true, email: true }
          },
          course: {
            select: { title: true }
          }
        },
        orderBy: { enrolledAt: 'desc' }
      }),
      prisma.course.findMany({
        take: 5,
        where: {
          createdAt: { gte: thirtyDaysAgo }
        },
        include: {
          creator: {
            select: { name: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.user.findMany({
        take: 10,
        where: {
          createdAt: { gte: thirtyDaysAgo }
        },
        orderBy: { createdAt: 'desc' }
      })
    ]);

    // Format activities
    const activities = [
      ...recentEnrollments.map(enrollment => ({
        id: `enrollment-${enrollment.id}`,
        type: 'enrollment',
        message: `${enrollment.student.name} enrolled in ${enrollment.course.title}`,
        timestamp: enrollment.enrolledAt,
        user: enrollment.student.name,
        course: enrollment.course.title
      })),
      ...recentCourses.map(course => ({
        id: `course-${course.id}`,
        type: 'course_created',
        message: `${course.creator?.name || 'Unknown'} created course "${course.title}"`,
        timestamp: course.createdAt,
        user: course.creator?.name || 'Unknown',
        course: course.title
      })),
      ...recentUsers.map(user => ({
        id: `user-${user.id}`,
        type: 'user_registered',
        message: `${user.name} registered as ${user.role}`,
        timestamp: user.createdAt,
        user: user.name,
        role: user.role
      }))
    ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
     .slice(0, 20);

    return NextResponse.json({ activities });
  } catch (error) {
    console.error('Error fetching recent activity:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
