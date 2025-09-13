import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: { courseId: string } }
) {
  try {
    console.log('🔍 Admin course details API called for courseId:', params.courseId);
    
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'ADMIN') {
      console.log('❌ Unauthorized access attempt');
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

    console.log('✅ Admin session verified, fetching course details...');

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

    // Fetch course with basic details
    console.log('🔍 Fetching course details...');
    const course = await prisma.course.findUnique({
      where: {
        id: params.courseId
      }
    });

    if (!course) {
      console.log('❌ Course not found:', params.courseId);
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      );
    }

    console.log('✅ Course found:', course.title);

    // Get additional stats
    const [topicsCount, testsCount, enrollmentsCount] = await Promise.all([
      prisma.topic.count({ where: { courseId: params.courseId } }),
      prisma.test.count({ 
        where: { 
          topic: { courseId: params.courseId }
        }
      }),
      prisma.courseEnrollment.count({ where: { courseId: params.courseId } })
    ]);

    const courseWithStats = {
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
      isActive: course.isActive,
      createdAt: course.createdAt,
      updatedAt: course.updatedAt,
      totalTopics: topicsCount,
      totalTests: testsCount,
      enrolledStudents: enrollmentsCount,
      completionRate: 0 // Will be calculated later
    };

    console.log(`✅ Returning course with stats: ${topicsCount} topics, ${testsCount} tests, ${enrollmentsCount} enrollments`);

    return NextResponse.json({
      success: true,
      course: courseWithStats
    });

  } catch (error: any) {
    console.error('❌ Unexpected error in admin course details API:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch course details',
        details: error.message,
        code: error.code
      },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { courseId: string } }
) {
  try {
    console.log('🔍 Admin course update API called for courseId:', params.courseId);
    
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    console.log('📝 Update data:', body);

    const updatedCourse = await prisma.course.update({
      where: { id: params.courseId },
      data: {
        title: body.title,
        description: body.description,
        instructor: body.instructor,
        difficulty: body.difficulty,
        estimatedHours: body.estimatedHours,
        price: body.price,
        duration: body.duration,
        maxStudents: body.maxStudents,
        status: body.status,
        isActive: body.isActive
      }
    });

    console.log('✅ Course updated successfully:', updatedCourse.title);

    return NextResponse.json({
      success: true,
      course: updatedCourse
    });

  } catch (error: any) {
    console.error('❌ Error updating course:', error);
    return NextResponse.json(
      { 
        error: 'Failed to update course',
        details: error.message
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { courseId: string } }
) {
  try {
    console.log('🔍 Admin course delete API called for courseId:', params.courseId);
    
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

    // Delete related data first
    await prisma.courseEnrollment.deleteMany({
      where: { courseId: params.courseId }
    });

    // Delete topics and their related data
    const topics = await prisma.topic.findMany({
      where: { courseId: params.courseId }
    });

    for (const topic of topics) {
      // Delete subtopics
      await prisma.subtopic.deleteMany({
        where: { topicId: topic.id }
      });

      // Delete materials
      await prisma.material.deleteMany({
        where: { topicId: topic.id }
      });

      // Delete tests
      await prisma.test.deleteMany({
        where: { topicId: topic.id }
      });

      // Delete questions
      await prisma.question.deleteMany({
        where: { topicId: topic.id }
      });
    }

    // Delete topics
    await prisma.topic.deleteMany({
      where: { courseId: params.courseId }
    });

    // Finally delete the course
    await prisma.course.delete({
      where: { id: params.courseId }
    });

    console.log('✅ Course and all related data deleted successfully');

    return NextResponse.json({
      success: true,
      message: 'Course deleted successfully'
    });

  } catch (error: any) {
    console.error('❌ Error deleting course:', error);
    return NextResponse.json(
      { 
        error: 'Failed to delete course',
        details: error.message
      },
      { status: 500 }
    );
  }
}