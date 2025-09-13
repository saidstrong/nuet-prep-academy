import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST() {
  try {
    console.log('Fixing course schema...');
    
    // Add missing columns to the courses table
    const alterQueries = [
      // Add instructor column if it doesn't exist
      `ALTER TABLE courses ADD COLUMN IF NOT EXISTS instructor TEXT;`,
      
      // Add difficulty column if it doesn't exist
      `ALTER TABLE courses ADD COLUMN IF NOT EXISTS difficulty TEXT;`,
      
          // Add estimated_hours column if it doesn't exist
    `ALTER TABLE courses ADD COLUMN IF NOT EXISTS estimated_hours INTEGER;`,
    
    // Add estimatedHours column (camelCase) if it doesn't exist
    `ALTER TABLE courses ADD COLUMN IF NOT EXISTS "estimatedHours" INTEGER;`,
      
          // Add is_active column if it doesn't exist
    `ALTER TABLE courses ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;`,
    
    // Add isActive column (camelCase) if it doesn't exist
    `ALTER TABLE courses ADD COLUMN IF NOT EXISTS "isActive" BOOLEAN DEFAULT true;`,
      
      // Update existing records with default values
      `UPDATE courses SET instructor = 'Unknown Instructor' WHERE instructor IS NULL;`,
      `UPDATE courses SET difficulty = 'BEGINNER' WHERE difficulty IS NULL;`,
      `UPDATE courses SET estimated_hours = 1 WHERE estimated_hours IS NULL;`,
      `UPDATE courses SET "estimatedHours" = 1 WHERE "estimatedHours" IS NULL;`,
      `UPDATE courses SET is_active = true WHERE is_active IS NULL;`,
      `UPDATE courses SET "isActive" = true WHERE "isActive" IS NULL;`,
    ];

    for (const query of alterQueries) {
      try {
        await prisma.$executeRawUnsafe(query);
        console.log(`✅ Executed: ${query}`);
      } catch (error: any) {
        console.log(`⚠️  Query failed (may already exist): ${query}`);
        console.log(`Error: ${error.message}`);
      }
    }

    // First, create a test user if none exists
    let testUser;
    try {
      testUser = await prisma.user.findFirst();
      if (!testUser) {
        testUser = await prisma.user.create({
          data: {
            id: 'test-creator-id',
            email: 'test@example.com',
            name: 'Test User',
            password: 'test-password',
            role: 'ADMIN'
          }
        });
      }
    } catch (error) {
      console.log('Could not create/find test user, using existing user ID');
      // Use a default user ID that might exist
      testUser = { id: 'test-creator-id' };
    }

    // Test the schema by trying to create a test course
    try {
      const testCourse = await prisma.course.create({
        data: {
          title: 'Test Course',
          description: 'Test Description',
          instructor: 'Test Instructor',
          difficulty: 'BEGINNER',
          estimatedHours: 1,
          price: 0,
          duration: '1 week',
          maxStudents: 10,
          status: 'DRAFT',
          isActive: true,
          creatorId: testUser.id
        }
      });
      
      // Clean up test course
      await prisma.course.delete({
        where: { id: testCourse.id }
      });
      
      console.log('✅ Schema fix successful - test course creation worked');
      
      return NextResponse.json({
        success: true,
        message: 'Course schema fixed successfully',
        testResult: 'Course creation test passed'
      });
      
    } catch (testError: any) {
      console.error('❌ Test course creation failed:', testError);
      return NextResponse.json({
        success: false,
        error: 'Schema fix completed but test failed',
        details: testError.message
      }, { status: 500 });
    }

  } catch (error: any) {
    console.error('❌ Schema fix failed:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fix course schema',
      details: error.message
    }, { status: 500 });
  }
}
