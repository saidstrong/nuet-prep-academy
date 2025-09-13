import { NextResponse } from 'next/server';

export async function GET() {
  try {
    console.log('🔍 Fallback courses API called');
    
    // Return mock data as fallback
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
        totalTopics: 12,
        totalTests: 8,
        totalMaterials: 15,
        enrolledStudents: 25,
        completionRate: 85,
        rating: 4.7,
        reviews: 32
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
        totalTopics: 10,
        totalTests: 6,
        totalMaterials: 12,
        enrolledStudents: 18,
        completionRate: 92,
        rating: 4.8,
        reviews: 28
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
        totalTopics: 8,
        totalTests: 5,
        totalMaterials: 10,
        enrolledStudents: 22,
        completionRate: 78,
        rating: 4.5,
        reviews: 19
      }
    ];

    console.log(`✅ Returning ${mockCourses.length} mock courses`);

    return NextResponse.json({
      success: true,
      courses: mockCourses,
      fallback: true
    });

  } catch (error: any) {
    console.error('❌ Error in fallback courses API:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch courses',
        details: error.message
      },
      { status: 500 }
    );
  }
}
