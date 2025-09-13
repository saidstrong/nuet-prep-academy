import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST() {
  try {
    console.log('🚀 Starting database migration...');
    
    // Test database connection first
    try {
      await prisma.$connect();
      console.log('✅ Database connected successfully');
    } catch (dbError: any) {
      console.error('❌ Database connection failed:', dbError);
      return NextResponse.json(
        { 
          error: 'Database connection failed',
          details: dbError.message,
          code: dbError.code
        },
        { status: 500 }
      );
    }
    
    // First, create or find an admin user to be the creator
    let adminUser;
    try {
      adminUser = await prisma.user.upsert({
        where: { email: 'admin@nuetprep.com' },
        update: {},
        create: {
          email: 'admin@nuetprep.com',
          name: 'Admin User',
          role: 'ADMIN',
          password: 'hashedpassword' // This should be properly hashed in production
        }
      });
      console.log('✅ Admin user created/found');
    } catch (error: any) {
      console.error('❌ Error creating admin user:', error.message);
      return NextResponse.json(
        { error: 'Failed to create admin user', details: error.message },
        { status: 500 }
      );
    }

    // Create sample courses
    const courses = [
      {
        id: 'course-1',
        title: 'NUET Mathematics Preparation',
        description: 'Comprehensive preparation for NUET Mathematics section covering algebra, geometry, and problem-solving techniques.',
        instructor: 'Dr. Sarah Johnson',
        difficulty: 'INTERMEDIATE' as const,
        estimatedHours: 40,
        price: 50000,
        duration: '8 weeks',
        maxStudents: 30,
        status: 'ACTIVE' as const,
        isActive: true,
        creatorId: adminUser.id,
      },
      {
        id: 'course-2',
        title: 'NUET Critical Thinking',
        description: 'Master critical thinking skills for the NUET exam with practice tests and analytical exercises.',
        instructor: 'Prof. Michael Chen',
        difficulty: 'ADVANCED' as const,
        estimatedHours: 35,
        price: 45000,
        duration: '6 weeks',
        maxStudents: 25,
        status: 'ACTIVE' as const,
        isActive: true,
        creatorId: adminUser.id,
      },
      {
        id: 'course-3',
        title: 'NUET English Language',
        description: 'Complete English language preparation including reading comprehension, grammar, and writing skills.',
        instructor: 'Ms. Emily Rodriguez',
        difficulty: 'BEGINNER' as const,
        estimatedHours: 30,
        price: 40000,
        duration: '5 weeks',
        maxStudents: 35,
        status: 'ACTIVE' as const,
        isActive: true,
        creatorId: adminUser.id,
      },
      {
        id: 'course-4',
        title: 'NUET Physics Fundamentals',
        description: 'Essential physics concepts and problem-solving strategies for the NUET exam.',
        instructor: 'Dr. Ahmed Hassan',
        difficulty: 'INTERMEDIATE' as const,
        estimatedHours: 35,
        price: 42000,
        duration: '7 weeks',
        maxStudents: 28,
        status: 'ACTIVE' as const,
        isActive: true,
        creatorId: adminUser.id,
      },
      {
        id: 'course-5',
        title: 'NUET Chemistry Mastery',
        description: 'Complete chemistry preparation covering organic, inorganic, and physical chemistry.',
        instructor: 'Prof. Lisa Wang',
        difficulty: 'ADVANCED' as const,
        estimatedHours: 45,
        price: 48000,
        duration: '9 weeks',
        maxStudents: 22,
        status: 'ACTIVE' as const,
        isActive: true,
        creatorId: adminUser.id,
      }
    ];
    
    const createdCourses = [];
    
    // Create courses
    for (const course of courses) {
      try {
        const createdCourse = await prisma.course.upsert({
          where: { id: course.id },
          update: course,
          create: course
        });
        createdCourses.push(createdCourse);
        console.log(`✅ Course created/updated: ${course.title}`);
      } catch (error: any) {
        console.error(`❌ Error with course ${course.title}:`, error.message);
      }
    }
    
    // Create topics for each course
    const topics = [
      // Course 1 topics
      { courseId: 'course-1', title: 'Algebra Fundamentals', description: 'Basic algebraic concepts and equations', order: 1 },
      { courseId: 'course-1', title: 'Geometry Basics', description: 'Introduction to geometric shapes and properties', order: 2 },
      { courseId: 'course-1', title: 'Problem Solving', description: 'Advanced problem-solving techniques', order: 3 },
      
      // Course 2 topics
      { courseId: 'course-2', title: 'Logical Reasoning', description: 'Understanding logical structures and arguments', order: 1 },
      { courseId: 'course-2', title: 'Analytical Thinking', description: 'Breaking down complex problems', order: 2 },
      
      // Course 3 topics
      { courseId: 'course-3', title: 'Grammar Essentials', description: 'Fundamental grammar rules and usage', order: 1 },
      { courseId: 'course-3', title: 'Reading Comprehension', description: 'Strategies for understanding complex texts', order: 2 },
      { courseId: 'course-3', title: 'Writing Skills', description: 'Effective writing techniques and practice', order: 3 },
      
      // Course 4 topics
      { courseId: 'course-4', title: 'Mechanics', description: 'Basic mechanics and motion', order: 1 },
      { courseId: 'course-4', title: 'Thermodynamics', description: 'Heat and energy concepts', order: 2 },
      
      // Course 5 topics
      { courseId: 'course-5', title: 'Organic Chemistry', description: 'Carbon compounds and reactions', order: 1 },
      { courseId: 'course-5', title: 'Inorganic Chemistry', description: 'Elements and compounds', order: 2 },
      { courseId: 'course-5', title: 'Physical Chemistry', description: 'Chemical kinetics and thermodynamics', order: 3 },
    ];
    
    const createdTopics = [];
    
    for (const topic of topics) {
      try {
        const createdTopic = await prisma.topic.create({
          data: topic
        });
        createdTopics.push(createdTopic);
        console.log(`✅ Topic created/updated: ${topic.title}`);
      } catch (error: any) {
        console.error(`❌ Error with topic ${topic.title}:`, error.message);
      }
    }
    
    console.log('🎉 Database migration completed successfully!');
    
    return NextResponse.json({
      success: true,
      message: 'Database migration completed successfully',
      data: {
        courses: createdCourses.length,
        topics: createdTopics.length
      }
    });
    
  } catch (error: any) {
    console.error('❌ Database migration failed:', error);
    return NextResponse.json(
      {
        error: 'Database migration failed',
        details: error.message
      },
      { status: 500 }
    );
  }
}
