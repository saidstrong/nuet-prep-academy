import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    console.log('🔍 Debugging course fetch...');
    
    // Check session
    const session = await getServerSession(authOptions);
    console.log('Session:', {
      exists: !!session,
      user: session?.user ? {
        id: session.user.id,
        email: session.user.email,
        role: session.user.role
      } : null
    });

    if (!session) {
      return NextResponse.json({
        success: false,
        error: 'No session found',
        debug: {
          session: null,
          step: 'session_check'
        }
      });
    }

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({
        success: false,
        error: 'Not admin user',
        debug: {
          session: {
            id: session.user.id,
            email: session.user.email,
            role: session.user.role
          },
          step: 'role_check'
        }
      });
    }

    // Test database connection
    console.log('Testing database connection...');
    await prisma.$connect();
    console.log('✅ Database connected');

    // Count courses
    const courseCount = await prisma.course.count();
    console.log(`📊 Total courses in database: ${courseCount}`);

    // Fetch courses with all relations
    console.log('Fetching courses with relations...');
    let courses;
    try {
      courses = await prisma.course.findMany({
        include: {
          topics: {
            include: {
              tests: true
            }
          },
          enrollments: {
            include: {
              student: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });
    } catch (error: any) {
      console.log('⚠️  Error fetching with enrollments, trying without:', error.message);
      // If enrollments fail, try without them
      courses = await prisma.course.findMany({
        include: {
          topics: {
            include: {
              tests: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });
      
      // Add empty enrollments array to each course
      courses = courses.map(course => ({
        ...course,
        enrollments: []
      }));
    }

    console.log(`📋 Fetched ${courses.length} courses from database`);

    // Process courses for response
    const coursesWithStats = courses.map(course => ({
      id: course.id,
      title: course.title,
      description: course.description,
      instructor: course.instructor,
      difficulty: course.difficulty,
      estimatedHours: course.estimatedHours,
      isActive: course.isActive,
      createdAt: course.createdAt,
      updatedAt: course.updatedAt,
      totalTopics: course.topics.length,
      totalTests: course.topics.reduce((total, topic) => total + topic.tests.length, 0),
      enrolledStudents: course.enrollments.length,
      completionRate: course.enrollments.length > 0 
        ? Math.round((course.enrollments.filter(e => e.status === 'COMPLETED').length / course.enrollments.length) * 100)
        : 0
    }));

    console.log(`✅ Processed ${coursesWithStats.length} courses for response`);

    return NextResponse.json({
      success: true,
      message: 'Course fetch debug successful',
      debug: {
        session: {
          id: session.user.id,
          email: session.user.email,
          role: session.user.role
        },
        database: {
          connected: true,
          courseCount,
          coursesFetched: courses.length,
          coursesProcessed: coursesWithStats.length
        },
        courses: coursesWithStats.slice(0, 3), // Return first 3 courses for debugging
        step: 'complete'
      }
    });

  } catch (error: any) {
    console.error('❌ Course fetch debug failed:', error);
    return NextResponse.json({
      success: false,
      error: 'Course fetch debug failed',
      details: error.message,
      stack: error.stack,
      debug: {
        step: 'error'
      }
    }, { status: 500 });
  }
}
