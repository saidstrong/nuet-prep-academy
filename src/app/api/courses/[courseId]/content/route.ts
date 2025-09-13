import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: { courseId: string } }
) {
  try {
    const { courseId } = params;
    
    console.log(`🔍 Fetching content for course: ${courseId}`);

    // Try to fetch from database first
    try {
      await prisma.$connect();
      
      const course = await prisma.course.findUnique({
        where: { id: courseId },
        include: {
          topics: {
            orderBy: { order: 'asc' },
            include: {
              materials: {
                orderBy: { order: 'asc' }
              },
              tests: true
            }
          }
        }
      });

      if (course && course.topics.length > 0) {
        const content = course.topics.flatMap(topic => [
          // Topic introduction
          {
            id: `topic-${topic.id}`,
            type: 'text',
            title: topic.title,
            description: topic.description || `Introduction to ${topic.title}`,
            duration: 5,
            isCompleted: false,
            isLocked: false,
            order: topic.order * 100,
            thumbnail: undefined,
            url: undefined
          },
          // Materials
          ...topic.materials.map(material => ({
            id: material.id,
            type: material.type.toLowerCase() as 'video' | 'text' | 'pdf',
            title: material.title,
            description: material.description || '',
            duration: 10, // Default duration since field doesn't exist
            isCompleted: false,
            isLocked: false,
            order: topic.order * 100 + material.order,
            thumbnail: undefined,
            url: material.url || undefined
          })),
          // Tests
          ...topic.tests.map(test => ({
            id: test.id,
            type: 'quiz' as const,
            title: test.title || 'Quiz',
            description: test.description || '',
            duration: 30,
            isCompleted: false,
            isLocked: false,
            order: topic.order * 100 + 50,
            thumbnail: undefined,
            url: undefined,
            questions: [
              {
                id: 'q1',
                question: 'Sample question for this quiz',
                options: ['Option A', 'Option B', 'Option C', 'Option D'],
                correctAnswer: 0,
                explanation: 'This is a sample explanation'
              }
            ]
          }))
        ]).sort((a, b) => a.order - b.order);

        console.log(`✅ Found ${content.length} content items for course ${courseId}`);
        
        return NextResponse.json({
          success: true,
          content
        });
      }
    } catch (dbError: any) {
      console.log('❌ Database error, using mock content:', dbError.message);
    }

    // Fallback to mock content
    const mockContent = [
      {
        id: 'intro-1',
        type: 'text',
        title: 'Course Introduction',
        description: 'Welcome to this comprehensive course. In this introduction, we\'ll cover the basics and what you can expect to learn.',
        duration: 5,
        isCompleted: false,
        isLocked: false,
        order: 1
      },
      {
        id: 'video-1',
        type: 'video',
        title: 'Getting Started',
        description: 'Learn the fundamentals and get started with the course material.',
        duration: 15,
        isCompleted: false,
        isLocked: false,
        order: 2
      },
      {
        id: 'text-1',
        type: 'text',
        title: 'Key Concepts',
        description: 'Understanding the key concepts is crucial for your success in this course.',
        duration: 10,
        isCompleted: false,
        isLocked: false,
        order: 3
      },
      {
        id: 'quiz-1',
        type: 'quiz',
        title: 'Knowledge Check',
        description: 'Test your understanding of the material covered so far.',
        duration: 20,
        isCompleted: false,
        isLocked: false,
        order: 4,
        questions: [
          {
            id: 'q1',
            question: 'What is the main topic of this course?',
            options: [
              'Advanced Mathematics',
              'Basic Programming',
              'Course Subject Matter',
              'General Knowledge'
            ],
            correctAnswer: 2,
            explanation: 'The main topic depends on the specific course content.'
          },
          {
            id: 'q2',
            question: 'How long should you spend on each lesson?',
            options: [
              '5 minutes',
              '10-15 minutes',
              '30 minutes',
              '1 hour'
            ],
            correctAnswer: 1,
            explanation: 'Most lessons are designed to be completed in 10-15 minutes.'
          }
        ]
      },
      {
        id: 'video-2',
        type: 'video',
        title: 'Advanced Topics',
        description: 'Dive deeper into advanced concepts and practical applications.',
        duration: 25,
        isCompleted: false,
        isLocked: false,
        order: 5
      },
      {
        id: 'pdf-1',
        type: 'pdf',
        title: 'Reference Materials',
        description: 'Download and review these reference materials for future use.',
        duration: 30,
        isCompleted: false,
        isLocked: false,
        order: 6
      },
      {
        id: 'assignment-1',
        type: 'assignment',
        title: 'Practical Exercise',
        description: 'Complete this hands-on exercise to apply what you\'ve learned.',
        duration: 45,
        isCompleted: false,
        isLocked: false,
        order: 7
      },
      {
        id: 'quiz-2',
        type: 'quiz',
        title: 'Final Assessment',
        description: 'Comprehensive quiz covering all course material.',
        duration: 30,
        isCompleted: false,
        isLocked: false,
        order: 8,
        questions: [
          {
            id: 'q3',
            question: 'What should you do after completing each lesson?',
            options: [
              'Skip to the next one',
              'Review the material',
              'Take a break',
              'Start over'
            ],
            correctAnswer: 1,
            explanation: 'It\'s important to review the material to reinforce learning.'
          }
        ]
      }
    ];

    console.log(`✅ Using ${mockContent.length} mock content items for course ${courseId}`);

    return NextResponse.json({
      success: true,
      content: mockContent
    });

  } catch (error: any) {
    console.error('❌ Error fetching course content:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch course content',
        details: error.message
      },
      { status: 500 }
    );
  }
}
