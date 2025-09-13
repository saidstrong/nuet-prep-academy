import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET() {
  try {
    console.log('🔍 Testing database structure for test questions...');
    
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ 
        success: false, 
        error: 'Unauthorized - Admin access required' 
      }, { status: 401 });
    }

    // Lazy import to prevent build-time issues
    const { prisma } = await import('@/lib/prisma');
    
    console.log('🔍 Testing database structure...');
    
    // Check courses
    const courseCount = await prisma.course.count();
    console.log(`✅ Total courses: ${courseCount}`);
    
    // Check topics
    const topicCount = await prisma.topic.count();
    console.log(`✅ Total topics: ${topicCount}`);
    
    // Check questions
    const questionCount = await prisma.question.count();
    console.log(`✅ Total questions: ${questionCount}`);
    
    // Get sample courses
    const courses = await prisma.course.findMany({
      take: 3,
      select: {
        id: true,
        title: true,
        description: true,
        topics: {
          select: {
            id: true,
            title: true,
            questions: {
              select: {
                id: true,
                text: true,
                type: true
              }
            }
          }
        }
      }
    });
    
    console.log(`✅ Sample courses:`, courses);

    return NextResponse.json({
      success: true,
      counts: {
        courses: courseCount,
        topics: topicCount,
        questions: questionCount
      },
      sampleData: courses,
      message: 'Database structure test completed'
    });

  } catch (error) {
    console.error('❌ Database structure test error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Database structure test failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
