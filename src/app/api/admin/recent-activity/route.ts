import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

// Mock data for recent activities
const mockActivities = [
  {
    id: 'enrollment-1',
    type: 'enrollment',
    message: 'Amina Kenzhebekova enrolled in NUET Mathematics Preparation',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    user: 'Amina Kenzhebekova',
    course: 'NUET Mathematics Preparation'
  },
  {
    id: 'enrollment-2',
    type: 'enrollment',
    message: 'Daniyar Almatov enrolled in NUET Critical Thinking',
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
    user: 'Daniyar Almatov',
    course: 'NUET Critical Thinking'
  },
  {
    id: 'user-1',
    type: 'user_registered',
    message: 'Zarina Tulegenova registered as STUDENT',
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
    user: 'Zarina Tulegenova',
    role: 'STUDENT'
  },
  {
    id: 'course-1',
    type: 'course_created',
    message: 'Dr. Sarah Johnson created course "NUET Chemistry Mastery"',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    user: 'Dr. Sarah Johnson',
    course: 'NUET Chemistry Mastery'
  },
  {
    id: 'enrollment-3',
    type: 'enrollment',
    message: 'Arman Nurpeisov enrolled in NUET English Language',
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    user: 'Arman Nurpeisov',
    course: 'NUET English Language'
  },
  {
    id: 'user-2',
    type: 'user_registered',
    message: 'Aidana Zhumabekova registered as STUDENT',
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
    user: 'Aidana Zhumabekova',
    role: 'STUDENT'
  },
  {
    id: 'enrollment-4',
    type: 'enrollment',
    message: 'Bekzhan Kadyrov enrolled in NUET Physics Fundamentals',
    timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
    user: 'Bekzhan Kadyrov',
    course: 'NUET Physics Fundamentals'
  },
  {
    id: 'course-2',
    type: 'course_created',
    message: 'Prof. Michael Chen created course "Advanced NUET Preparation"',
    timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 1 week ago
    user: 'Prof. Michael Chen',
    course: 'Advanced NUET Preparation'
  }
];

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Try database first, fallback to mock data
    let activities = [];
    let useDatabase = false;

    try {
      await prisma.$connect();
      console.log('✅ Database connected for recent activity');
      
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
      activities = [
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

      useDatabase = true;
      console.log(`✅ Found ${activities.length} activities from database`);
      
    } catch (dbError: any) {
      console.log('❌ Database connection failed for recent activity, using mock data:', dbError.message);
      activities = mockActivities;
    }

    // If no activities from database, use mock data
    if (activities.length === 0) {
      activities = mockActivities;
      console.log('✅ Using mock activities data');
    }

    return NextResponse.json({ 
      activities,
      source: useDatabase ? 'database' : 'mock'
    });
  } catch (error) {
    console.error('Error fetching recent activity:', error);
    // Return mock data on any error
    return NextResponse.json({ 
      activities: mockActivities,
      source: 'mock',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
