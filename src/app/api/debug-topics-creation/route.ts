import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET() {
  try {
    console.log('🔍 Debug: Testing topics creation step by step...');
    
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ 
        success: false, 
        error: 'Unauthorized - Admin access required' 
      }, { status: 401 });
    }

    // Lazy import to prevent build-time issues
    const { prisma } = await import('@/lib/prisma');
    
    console.log('🔍 Step 1: Getting existing courses...');
    
    // Get all existing courses
    const courses = await prisma.course.findMany({
      select: {
        id: true,
        title: true,
        description: true
      }
    });
    
    console.log(`✅ Found ${courses.length} existing courses:`, courses.map(c => c.title));
    
    if (courses.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'No courses found. Please create courses first.'
      });
    }
    
    // Test creating just one topic for the first course
    const firstCourse = courses[0];
    console.log(`🔍 Step 2: Testing topic creation for course: ${firstCourse.title}`);
    
    try {
      const testTopic = await prisma.topic.create({
        data: {
          title: 'Test Topic',
          description: 'Test description',
          order: 1,
          courseId: firstCourse.id
        }
      });
      
      console.log(`✅ Successfully created test topic: ${testTopic.id}`);
      
      // Test creating a simple question
      console.log(`🔍 Step 3: Testing question creation...`);
      
      const testQuestion = await prisma.question.create({
        data: {
          text: 'What is 2 + 2?',
          type: 'MULTIPLE_CHOICE',
          difficulty: 'EASY',
          points: 1,
          correctAnswer: '4',
          explanation: 'Basic arithmetic',
          topicId: testTopic.id
        }
      });
      
      console.log(`✅ Successfully created test question: ${testQuestion.id}`);
      
      // Test creating question options
      console.log(`🔍 Step 4: Testing question options creation...`);
      
      const testOption = await prisma.questionOption.create({
        data: {
          text: '4',
          isCorrect: true,
          order: 1,
          questionId: testQuestion.id
        }
      });
      
      console.log(`✅ Successfully created test option: ${testOption.id}`);
      
      // Clean up test data
      await prisma.questionOption.deleteMany({
        where: { questionId: testQuestion.id }
      });
      await prisma.question.delete({
        where: { id: testQuestion.id }
      });
      await prisma.topic.delete({
        where: { id: testTopic.id }
      });
      
      console.log(`✅ Cleaned up test data`);
      
      return NextResponse.json({
        success: true,
        message: 'All tests passed! Topics and questions can be created successfully.',
        testResults: {
          coursesFound: courses.length,
          topicCreated: true,
          questionCreated: true,
          optionCreated: true,
          cleanupCompleted: true
        }
      });
      
    } catch (testError) {
      console.error('❌ Test failed:', testError);
      return NextResponse.json({
        success: false,
        error: 'Test failed',
        details: testError instanceof Error ? testError.message : 'Unknown error',
        testResults: {
          coursesFound: courses.length,
          topicCreated: false,
          questionCreated: false,
          optionCreated: false
        }
      });
    }

  } catch (error) {
    console.error('❌ Debug topics creation error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Debug failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
