import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET() {
  try {
    console.log('🔍 Testing test questions API...');
    
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ 
        success: false, 
        error: 'Unauthorized - Admin access required' 
      }, { status: 401 });
    }

    // Lazy import to prevent build-time issues
    const { prisma } = await import('@/lib/prisma');
    
    console.log('🔍 Testing database connection for questions...');
    
    // Test basic database connection
    const questionCount = await prisma.question.count();
    console.log(`✅ Total questions in database: ${questionCount}`);
    
    // Get all questions with their relations
    const questions = await prisma.question.findMany({
      include: {
        topic: {
          include: {
            course: {
              select: {
                id: true,
                title: true
              }
            }
          }
        },
        options: true
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 5 // Limit to first 5 for testing
    });
    
    console.log(`✅ Questions found: ${questions.length}`, questions);

    return NextResponse.json({
      success: true,
      totalQuestions: questionCount,
      questions: questions,
      questionCount: questions.length,
      message: 'Test questions API working'
    });

  } catch (error) {
    console.error('❌ Test questions API error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Test questions API failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
