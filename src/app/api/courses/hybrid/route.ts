import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Mock data as fallback
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
    topics: [
      { id: 'topic-1', title: 'Algebra Fundamentals', description: 'Basic algebraic concepts and equations', order: 1 },
      { id: 'topic-2', title: 'Geometry Basics', description: 'Introduction to geometric shapes and properties', order: 2 },
      { id: 'topic-3', title: 'Problem Solving', description: 'Advanced problem-solving techniques', order: 3 }
    ],
    enrollments: [
      { id: 'enrollment-1', status: 'ACTIVE', enrolledAt: new Date().toISOString() },
      { id: 'enrollment-2', status: 'ACTIVE', enrolledAt: new Date().toISOString() },
      { id: 'enrollment-3', status: 'ACTIVE', enrolledAt: new Date().toISOString() }
    ]
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
    topics: [
      { id: 'topic-4', title: 'Logical Reasoning', description: 'Understanding logical structures and arguments', order: 1 },
      { id: 'topic-5', title: 'Analytical Thinking', description: 'Breaking down complex problems', order: 2 }
    ],
    enrollments: [
      { id: 'enrollment-4', status: 'ACTIVE', enrolledAt: new Date().toISOString() },
      { id: 'enrollment-5', status: 'ACTIVE', enrolledAt: new Date().toISOString() }
    ]
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
    topics: [
      { id: 'topic-6', title: 'Grammar Essentials', description: 'Fundamental grammar rules and usage', order: 1 },
      { id: 'topic-7', title: 'Reading Comprehension', description: 'Strategies for understanding complex texts', order: 2 },
      { id: 'topic-8', title: 'Writing Skills', description: 'Effective writing techniques and practice', order: 3 }
    ],
    enrollments: [
      { id: 'enrollment-6', status: 'ACTIVE', enrolledAt: new Date().toISOString() },
      { id: 'enrollment-7', status: 'ACTIVE', enrolledAt: new Date().toISOString() },
      { id: 'enrollment-8', status: 'ACTIVE', enrolledAt: new Date().toISOString() }
    ]
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
    topics: [
      { id: 'topic-9', title: 'Mechanics', description: 'Basic mechanics and motion', order: 1 },
      { id: 'topic-10', title: 'Thermodynamics', description: 'Heat and energy concepts', order: 2 }
    ],
    enrollments: [
      { id: 'enrollment-9', status: 'ACTIVE', enrolledAt: new Date().toISOString() },
      { id: 'enrollment-10', status: 'ACTIVE', enrolledAt: new Date().toISOString() }
    ]
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
    topics: [
      { id: 'topic-11', title: 'Organic Chemistry', description: 'Carbon compounds and reactions', order: 1 },
      { id: 'topic-12', title: 'Inorganic Chemistry', description: 'Elements and compounds', order: 2 },
      { id: 'topic-13', title: 'Physical Chemistry', description: 'Chemical kinetics and thermodynamics', order: 3 }
    ],
    enrollments: [
      { id: 'enrollment-11', status: 'ACTIVE', enrolledAt: new Date().toISOString() }
    ]
  }
];

export async function GET() {
  try {
    console.log('🔍 Hybrid courses API called');
    
    // Try to connect to database first
    let useDatabase = false;
    let courses = [];
    
    try {
      console.log('🔌 Attempting database connection...');
      await prisma.$connect();
      
      // Test if we can query courses
      const dbCourses = await prisma.course.findMany({
        where: { status: 'ACTIVE' },
        include: {
          topics: {
            orderBy: { order: 'asc' }
          },
          enrollments: {
            where: { status: 'ACTIVE' },
            select: {
              id: true,
              status: true,
              enrolledAt: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      });
      
      if (dbCourses && dbCourses.length > 0) {
        console.log(`✅ Database connected - found ${dbCourses.length} courses`);
        courses = dbCourses;
        useDatabase = true;
      } else {
        console.log('⚠️ Database connected but no courses found, using mock data');
        courses = mockCourses;
      }
      
    } catch (dbError: any) {
      console.log('❌ Database connection failed, using mock data');
      console.log('Database error:', dbError.message);
      courses = mockCourses;
    }
    
    // Process courses for response
    const processedCourses = courses.map(course => ({
      id: course.id,
      title: course.title,
      description: course.description,
      instructor: course.instructor,
      difficulty: course.difficulty,
      estimatedHours: course.estimatedHours,
      price: course.price || 0,
      duration: course.duration || '',
      maxStudents: course.maxStudents || 30,
      status: course.status || 'ACTIVE',
      isActive: course.isActive !== false,
      createdAt: course.createdAt,
      updatedAt: course.updatedAt,
      topics: course.topics || [],
      enrollments: course.enrollments || [],
      totalTopics: course.topics?.length || 0,
      enrolledStudents: course.enrollments?.length || 0,
      completionRate: course.enrollments?.length > 0 
        ? Math.round((course.enrollments.filter(e => e.status === 'COMPLETED').length / course.enrollments.length) * 100)
        : 0
    }));
    
    console.log(`✅ Returning ${processedCourses.length} courses (${useDatabase ? 'database' : 'mock'})`);
    
    return NextResponse.json({
      success: true,
      courses: processedCourses,
      source: useDatabase ? 'database' : 'mock',
      message: useDatabase ? 'Data loaded from database' : 'Using mock data - database unavailable'
    });
    
  } catch (error: any) {
    console.error('❌ Error in hybrid courses API:', error);
    
    // Fallback to mock data on any error
    console.log('🔄 Falling back to mock data due to error');
    
    return NextResponse.json({
      success: true,
      courses: mockCourses.map(course => ({
        ...course,
        totalTopics: course.topics.length,
        enrolledStudents: course.enrollments.length,
        completionRate: 85
      })),
      source: 'mock',
      message: 'Using mock data due to error',
      error: error.message
    });
  }
}
