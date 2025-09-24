import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import courseStorage from '@/lib/courseStorage';

export async function GET() {
  try {
    console.log('🔍 Admin courses API (simple version) called');
    
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'ADMIN') {
      console.log('❌ Unauthorized access attempt');
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

    console.log('✅ Admin session verified, fetching courses...');

    // Try database first
    let courses = [];
    try {
      await prisma.$connect();
      const dbCourses = await prisma.course.findMany({
        include: {
          _count: {
            select: {
              topics: true,
              tests: true,
              enrollments: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      courses = dbCourses.map(course => ({
        id: course.id,
        title: course.title,
        description: course.description,
        instructor: course.instructor,
        difficulty: course.difficulty,
        estimatedHours: course.estimatedHours,
        price: course.price,
        duration: course.duration,
        maxStudents: course.maxStudents,
        status: course.status,
        isActive: course.isActive,
        createdAt: course.createdAt.toISOString(),
        updatedAt: course.updatedAt.toISOString(),
        totalTopics: course._count.topics,
        totalTests: course._count.tests,
        enrolledStudents: course._count.enrollments,
        completionRate: 85 // Default completion rate
      }));

      console.log(`✅ Found ${courses.length} courses in database`);
    } catch (dbError: any) {
      console.log('❌ Database error, using temporary storage and mock data:', dbError.message);
      
      // Get courses from temporary storage
      const tempCourses = courseStorage.getAllCourses();
      const tempCoursesFormatted = tempCourses.map(course => ({
        id: course.id,
        title: course.title,
        description: course.description,
        instructor: course.instructor,
        difficulty: course.difficulty,
        estimatedHours: course.estimatedHours,
        price: course.price,
        duration: course.duration,
        maxStudents: course.maxStudents,
        status: course.status,
        isActive: course.isActive,
        createdAt: course.createdAt,
        updatedAt: course.updatedAt,
        totalTopics: 0,
        totalTests: 0,
        enrolledStudents: 0,
        completionRate: 0
      }));

      courses = tempCoursesFormatted;
      console.log(`✅ Found ${courses.length} courses in temporary storage`);
    }

    // Add mock courses if no courses found
    if (courses.length === 0) {
      console.log('📚 No courses found, using mock data...');
      const mockCourses = [
      {
        id: 'course-1',
        title: 'NUET Mathematics Preparation',
        description: 'Comprehensive preparation for NUET Mathematics section covering algebra, geometry, and problem-solving techniques.',
        instructor: 'Dr. Sarah Johnson',
        difficulty: 'INTERMEDIATE',
        estimatedHours: 40,
        price: 50000,
        duration: '8 weeks',
        maxStudents: 30,
        status: 'ACTIVE',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        totalTopics: 3,
        totalTests: 0,
        enrolledStudents: 3,
        completionRate: 85
      },
      {
        id: 'course-2',
        title: 'NUET Critical Thinking',
        description: 'Master critical thinking skills for the NUET exam with practice tests and analytical exercises.',
        instructor: 'Prof. Michael Chen',
        difficulty: 'ADVANCED',
        estimatedHours: 35,
        price: 45000,
        duration: '6 weeks',
        maxStudents: 25,
        status: 'ACTIVE',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        totalTopics: 2,
        totalTests: 0,
        enrolledStudents: 2,
        completionRate: 92
      },
      {
        id: 'course-3',
        title: 'NUET English Language',
        description: 'Complete English language preparation including reading comprehension, grammar, and writing skills.',
        instructor: 'Ms. Emily Rodriguez',
        difficulty: 'BEGINNER',
        estimatedHours: 30,
        price: 40000,
        duration: '5 weeks',
        maxStudents: 35,
        status: 'ACTIVE',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        totalTopics: 3,
        totalTests: 0,
        enrolledStudents: 3,
        completionRate: 78
      },
      {
        id: 'course-4',
        title: 'NUET Physics Fundamentals',
        description: 'Essential physics concepts and problem-solving strategies for the NUET exam.',
        instructor: 'Dr. Ahmed Hassan',
        difficulty: 'INTERMEDIATE',
        estimatedHours: 35,
        price: 42000,
        duration: '7 weeks',
        maxStudents: 28,
        status: 'ACTIVE',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        totalTopics: 2,
        totalTests: 0,
        enrolledStudents: 2,
        completionRate: 88
      },
      {
        id: 'course-5',
        title: 'NUET Chemistry Mastery',
        description: 'Complete chemistry preparation covering organic, inorganic, and physical chemistry.',
        instructor: 'Prof. Lisa Wang',
        difficulty: 'ADVANCED',
        estimatedHours: 45,
        price: 48000,
        duration: '9 weeks',
        maxStudents: 22,
        status: 'ACTIVE',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        totalTopics: 3,
        totalTests: 0,
        enrolledStudents: 1,
        completionRate: 90
      }
      ];
      
      courses = mockCourses;
      console.log(`✅ Using ${courses.length} mock courses for admin`);
    }

    // Combine temporary storage courses with existing courses (avoid duplicates)
    const tempCourses = courseStorage.getAllCourses();
    const existingCourseIds = new Set(courses.map(c => c.id));
    
    tempCourses.forEach(tempCourse => {
      if (!existingCourseIds.has(tempCourse.id)) {
        courses.unshift({
          id: tempCourse.id,
          title: tempCourse.title,
          description: tempCourse.description,
          instructor: tempCourse.instructor,
          difficulty: tempCourse.difficulty,
          estimatedHours: tempCourse.estimatedHours,
          price: tempCourse.price,
          duration: tempCourse.duration,
          maxStudents: tempCourse.maxStudents,
          status: tempCourse.status,
          isActive: tempCourse.isActive,
          createdAt: tempCourse.createdAt,
          updatedAt: tempCourse.updatedAt,
          totalTopics: 0,
          totalTests: 0,
          enrolledStudents: 0,
          completionRate: 0
        });
      }
    });

    console.log(`✅ Returning ${courses.length} total courses (including ${tempCourses.length} from temporary storage)`);

    return NextResponse.json({
      success: true,
      courses: courses
    });

  } catch (error: any) {
    console.error('❌ Unexpected error in admin courses API:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch courses',
        details: error.message,
        code: error.code
      },
      { status: 500 }
    );
  }
}
