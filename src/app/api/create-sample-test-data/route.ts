import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET() {
  try {
    console.log('🔍 Creating sample test data...');
    
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ 
        success: false, 
        error: 'Unauthorized - Admin access required' 
      }, { status: 401 });
    }

    // Lazy import to prevent build-time issues
    const { prisma } = await import('@/lib/prisma');
    
    console.log('🔍 Checking existing data...');
    
    // Check if we already have courses
    const existingCourses = await prisma.course.count();
    
    if (existingCourses > 0) {
      return NextResponse.json({
        success: true,
        message: `Already have ${existingCourses} courses. No need to create sample data.`,
        existingCourses
      });
    }
    
    console.log('🔍 Creating sample course...');
    
    // Create a sample course
    const course = await prisma.course.create({
      data: {
        title: 'NUET Mathematics Preparation',
        description: 'Comprehensive mathematics course for NUET preparation',
        price: 50000,
        duration: '3 months',
        maxStudents: 50,
        status: 'ACTIVE',
        instructor: 'Dr. Mathematics Expert',
        difficulty: 'INTERMEDIATE',
        estimatedHours: 90,
        isActive: true,
        creatorId: session.user.id // Use the current admin as creator
      }
    });
    
    console.log('✅ Created course:', course.id);
    
    // Create sample topics
    const topics = [
      {
        title: 'Algebra Basics',
        description: 'Fundamental algebraic concepts',
        order: 1
      },
      {
        title: 'Geometry',
        description: 'Basic geometric principles',
        order: 2
      },
      {
        title: 'Calculus Introduction',
        description: 'Introduction to calculus concepts',
        order: 3
      }
    ];
    
    const createdTopics = [];
    for (const topicData of topics) {
      const topic = await prisma.topic.create({
        data: {
          ...topicData,
          courseId: course.id
        }
      });
      createdTopics.push(topic);
      console.log('✅ Created topic:', topic.id);
    }
    
    // Create sample questions for each topic
    const sampleQuestions = [
      {
        text: 'What is the value of x in the equation 2x + 5 = 15?',
        type: 'MULTIPLE_CHOICE',
        difficulty: 'EASY',
        points: 1,
        correctAnswer: '5',
        explanation: 'Solve: 2x + 5 = 15, so 2x = 10, therefore x = 5',
        options: [
          { text: '3', isCorrect: false, order: 1 },
          { text: '5', isCorrect: true, order: 2 },
          { text: '7', isCorrect: false, order: 3 },
          { text: '10', isCorrect: false, order: 4 }
        ]
      },
      {
        text: 'What is the area of a circle with radius 5?',
        type: 'MULTIPLE_CHOICE',
        difficulty: 'MEDIUM',
        points: 2,
        correctAnswer: '25π',
        explanation: 'Area = πr² = π × 5² = 25π',
        options: [
          { text: '10π', isCorrect: false, order: 1 },
          { text: '25π', isCorrect: true, order: 2 },
          { text: '50π', isCorrect: false, order: 3 },
          { text: '100π', isCorrect: false, order: 4 }
        ]
      },
      {
        text: 'What is the derivative of x²?',
        type: 'MULTIPLE_CHOICE',
        difficulty: 'HARD',
        points: 3,
        correctAnswer: '2x',
        explanation: 'Using power rule: d/dx(x²) = 2x',
        options: [
          { text: 'x', isCorrect: false, order: 1 },
          { text: '2x', isCorrect: true, order: 2 },
          { text: 'x²', isCorrect: false, order: 3 },
          { text: '2x²', isCorrect: false, order: 4 }
        ]
      }
    ];
    
    const createdQuestions = [];
    for (let i = 0; i < sampleQuestions.length; i++) {
      const questionData = sampleQuestions[i];
      const topic = createdTopics[i % createdTopics.length]; // Distribute questions across topics
      
      const question = await prisma.question.create({
        data: {
          text: questionData.text,
          type: questionData.type,
          difficulty: questionData.difficulty,
          points: questionData.points,
          correctAnswer: questionData.correctAnswer,
          explanation: questionData.explanation,
          topicId: topic.id
        }
      });
      
      // Create options for the question
      for (const optionData of questionData.options) {
        await prisma.questionOption.create({
          data: {
            text: optionData.text,
            isCorrect: optionData.isCorrect,
            order: optionData.order,
            questionId: question.id
          }
        });
      }
      
      createdQuestions.push(question);
      console.log('✅ Created question:', question.id);
    }
    
    return NextResponse.json({
      success: true,
      message: 'Sample test data created successfully',
      data: {
        course: course,
        topics: createdTopics,
        questions: createdQuestions
      }
    });

  } catch (error) {
    console.error('❌ Create sample test data error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to create sample test data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
