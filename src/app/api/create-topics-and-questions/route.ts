import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET() {
  try {
    console.log('🔍 Creating topics and questions for existing courses...');
    
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ 
        success: false, 
        error: 'Unauthorized - Admin access required' 
      }, { status: 401 });
    }

    // Lazy import to prevent build-time issues
    const { prisma } = await import('@/lib/prisma');
    
    console.log('🔍 Getting existing courses...');
    
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
    
    const results = [];
    
    // Create topics and questions for each course
    for (const course of courses) {
      console.log(`🔍 Creating topics for course: ${course.title}`);
      
      // Create topics based on course title
      const topics = [];
      if (course.title.toLowerCase().includes('math')) {
        topics.push(
          { title: 'Algebra Basics', description: 'Fundamental algebraic concepts', order: 1 },
          { title: 'Geometry', description: 'Basic geometric principles', order: 2 },
          { title: 'Calculus Introduction', description: 'Introduction to calculus concepts', order: 3 }
        );
      } else if (course.title.toLowerCase().includes('physics')) {
        topics.push(
          { title: 'Mechanics', description: 'Basic mechanics and motion', order: 1 },
          { title: 'Thermodynamics', description: 'Heat and energy concepts', order: 2 },
          { title: 'Electromagnetism', description: 'Electric and magnetic fields', order: 3 }
        );
      } else if (course.title.toLowerCase().includes('chemistry')) {
        topics.push(
          { title: 'Atomic Structure', description: 'Basic atomic theory', order: 1 },
          { title: 'Chemical Bonding', description: 'Types of chemical bonds', order: 2 },
          { title: 'Reaction Kinetics', description: 'Speed of chemical reactions', order: 3 }
        );
      } else {
        // Generic topics for any other course
        topics.push(
          { title: 'Introduction', description: 'Course introduction and basics', order: 1 },
          { title: 'Core Concepts', description: 'Main concepts and principles', order: 2 },
          { title: 'Advanced Topics', description: 'Advanced and specialized topics', order: 3 }
        );
      }
      
             const createdTopics = [];
       for (const topicData of topics) {
         try {
           const topic = await prisma.topic.create({
             data: {
               title: topicData.title,
               description: topicData.description || null,
               order: topicData.order,
               courseId: course.id
             }
           });
           createdTopics.push(topic);
           console.log(`✅ Created topic: ${topic.title} for course: ${course.title}`);
         } catch (topicError) {
           console.error(`❌ Failed to create topic ${topicData.title}:`, topicError);
           // Continue with other topics even if one fails
         }
       }
      
      // Create sample questions for each topic
      const sampleQuestions = [
        {
          text: `What is the main concept covered in ${course.title}?`,
          type: 'MULTIPLE_CHOICE',
          difficulty: 'EASY',
          points: 1,
          correctAnswer: 'Core principles',
          explanation: 'This course covers the core principles and fundamentals.',
          options: [
            { text: 'Advanced techniques', isCorrect: false, order: 1 },
            { text: 'Core principles', isCorrect: true, order: 2 },
            { text: 'Historical background', isCorrect: false, order: 3 },
            { text: 'Future applications', isCorrect: false, order: 4 }
          ]
        },
        {
          text: `Which of the following is most important in ${course.title}?`,
          type: 'MULTIPLE_CHOICE',
          difficulty: 'MEDIUM',
          points: 2,
          correctAnswer: 'Understanding fundamentals',
          explanation: 'Understanding the fundamentals is crucial for success in this course.',
          options: [
            { text: 'Memorizing formulas', isCorrect: false, order: 1 },
            { text: 'Understanding fundamentals', isCorrect: true, order: 2 },
            { text: 'Speed of completion', isCorrect: false, order: 3 },
            { text: 'Using calculators', isCorrect: false, order: 4 }
          ]
        },
        {
          text: `How would you apply ${course.title} concepts in real-world scenarios?`,
          type: 'MULTIPLE_CHOICE',
          difficulty: 'HARD',
          points: 3,
          correctAnswer: 'Problem-solving approach',
          explanation: 'Real-world application requires a systematic problem-solving approach.',
          options: [
            { text: 'Direct formula application', isCorrect: false, order: 1 },
            { text: 'Problem-solving approach', isCorrect: true, order: 2 },
            { text: 'Trial and error method', isCorrect: false, order: 3 },
            { text: 'Intuitive guessing', isCorrect: false, order: 4 }
          ]
        }
      ];
      
             const createdQuestions = [];
       for (let i = 0; i < sampleQuestions.length; i++) {
         const questionData = sampleQuestions[i];
         const topic = createdTopics[i % createdTopics.length]; // Distribute questions across topics
         
         if (!topic) {
           console.error(`❌ No topic available for question ${i + 1}`);
           continue;
         }
         
         try {
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
             try {
               await prisma.questionOption.create({
                 data: {
                   text: optionData.text,
                   isCorrect: optionData.isCorrect,
                   order: optionData.order,
                   questionId: question.id
                 }
               });
             } catch (optionError) {
               console.error(`❌ Failed to create option for question ${question.id}:`, optionError);
             }
           }
           
           createdQuestions.push(question);
           console.log(`✅ Created question: ${question.text.substring(0, 50)}...`);
         } catch (questionError) {
           console.error(`❌ Failed to create question ${i + 1}:`, questionError);
           // Continue with other questions even if one fails
         }
       }
      
      results.push({
        course: course.title,
        topicsCreated: createdTopics.length,
        questionsCreated: createdQuestions.length
      });
    }
    
    return NextResponse.json({
      success: true,
      message: 'Topics and questions created successfully for all courses',
      results: results,
      totalTopics: results.reduce((sum, r) => sum + r.topicsCreated, 0),
      totalQuestions: results.reduce((sum, r) => sum + r.questionsCreated, 0)
    });

  } catch (error) {
    console.error('❌ Create topics and questions error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to create topics and questions',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
