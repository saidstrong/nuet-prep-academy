import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import courseStorage from '@/lib/courseStorage';

export async function GET(
  request: Request,
  { params }: { params: { courseId: string } }
) {
  try {
    const courseId = params.courseId;
    console.log(`🔍 Course detail API called for courseId: ${courseId}`);

    // Try database first
    try {
      await prisma.$connect();
      
      const course = await prisma.course.findUnique({
        where: { id: courseId },
        include: {
          topics: {
            orderBy: { order: 'asc' }
          },
          _count: {
            select: {
              topics: true,
              materials: true,
              tests: true,
              enrollments: true
            }
          }
        }
      });

      if (course) {
        console.log(`✅ Found course in database: ${course.title}`);
        
        const courseData = {
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
          topics: course.topics || [],
          totalTopics: course._count.topics,
          totalMaterials: course._count.materials,
          totalTests: course._count.tests,
          enrolledStudents: course._count.enrollments,
          isEnrolled: false,
          isFavorite: false,
          isBookmarked: false,
          rating: 4.5,
          reviews: 0
        };

        return NextResponse.json({
          success: true,
          course: courseData,
          topics: courseData.topics,
          source: 'database'
        });
      }
    } catch (dbError: any) {
      console.log('❌ Database error, checking temporary storage:', dbError.message);
    }

    // Check temporary storage for newly created courses
    const tempCourse = courseStorage.getCourse(courseId);
    if (tempCourse) {
      console.log(`✅ Found course in temporary storage: ${tempCourse.title}`);
      
      const courseData = {
        ...tempCourse,
        topics: [],
        totalTopics: 0,
        totalMaterials: 0,
        totalTests: 0,
        enrolledStudents: 0,
        isEnrolled: false,
        isFavorite: false,
        isBookmarked: false,
        rating: 4.5,
        reviews: 0
      };

      return NextResponse.json({
        success: true,
        course: courseData,
        topics: courseData.topics,
        source: 'temporary_storage'
      });
    }

    // Fallback to mock courses for predefined courses
    const mockCourses = {
      'course-1': {
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
        topics: [
          { id: 'topic-1', title: 'Algebra Fundamentals', description: 'Basic algebraic concepts and equations', order: 1 },
          { id: 'topic-2', title: 'Geometry Basics', description: 'Introduction to geometric shapes and properties', order: 2 },
          { id: 'topic-3', title: 'Problem Solving', description: 'Advanced problem-solving techniques', order: 3 }
        ],
        totalTopics: 3,
        totalMaterials: 0,
        totalTests: 0,
        enrolledStudents: 0,
        isEnrolled: false,
        isFavorite: false,
        isBookmarked: false,
        rating: 4.5,
        reviews: 0
      },
      'course-2': {
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
        topics: [
          { id: 'topic-4', title: 'Logical Reasoning', description: 'Understanding logical structures and arguments', order: 1 },
          { id: 'topic-5', title: 'Analytical Thinking', description: 'Breaking down complex problems', order: 2 }
        ],
        totalTopics: 2,
        totalMaterials: 0,
        totalTests: 0,
        enrolledStudents: 0,
        isEnrolled: false,
        isFavorite: false,
        isBookmarked: false,
        rating: 4.5,
        reviews: 0
      },
      'course-3': {
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
        topics: [
          { id: 'topic-6', title: 'Grammar Essentials', description: 'Fundamental grammar rules and usage', order: 1 },
          { id: 'topic-7', title: 'Reading Comprehension', description: 'Strategies for understanding complex texts', order: 2 },
          { id: 'topic-8', title: 'Writing Skills', description: 'Effective writing techniques and practice', order: 3 }
        ],
        totalTopics: 3,
        totalMaterials: 0,
        totalTests: 0,
        enrolledStudents: 0,
        isEnrolled: false,
        isFavorite: false,
        isBookmarked: false,
        rating: 4.5,
        reviews: 0
      },
      'course-4': {
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
        topics: [
          { id: 'topic-9', title: 'Mechanics', description: 'Basic mechanics and motion', order: 1 },
          { id: 'topic-10', title: 'Thermodynamics', description: 'Heat and energy concepts', order: 2 }
        ],
        totalTopics: 2,
        totalMaterials: 0,
        totalTests: 0,
        enrolledStudents: 0,
        isEnrolled: false,
        isFavorite: false,
        isBookmarked: false,
        rating: 4.5,
        reviews: 0
      },
      'course-5': {
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
        topics: [
          { id: 'topic-11', title: 'Organic Chemistry', description: 'Carbon compounds and reactions', order: 1 },
          { id: 'topic-12', title: 'Inorganic Chemistry', description: 'Elements and compounds', order: 2 },
          { id: 'topic-13', title: 'Physical Chemistry', description: 'Chemical kinetics and thermodynamics', order: 3 }
        ],
        totalTopics: 3,
        totalMaterials: 0,
        totalTests: 0,
        enrolledStudents: 0,
        isEnrolled: false,
        isFavorite: false,
        isBookmarked: false,
        rating: 4.5,
        reviews: 0
      }
    };

    const course = mockCourses[courseId as keyof typeof mockCourses];

    if (!course) {
      console.log(`❌ Course not found: ${courseId}`);
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      );
    }

    console.log(`✅ Returning mock course details for: ${course.title}`);

    return NextResponse.json({
      success: true,
      course: course,
      topics: course.topics,
      source: 'mock'
    });

  } catch (error: any) {
    console.error('Error fetching course details:', error);
    return NextResponse.json(
      { error: 'Failed to fetch course details' },
      { status: 500 }
    );
  }
}
