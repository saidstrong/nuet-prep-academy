import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    console.log('🔧 Fixing subtopic schema...');
    
    // Add subtopicId column to materials table if it doesn't exist
    await prisma.$executeRaw`
      ALTER TABLE materials 
      ADD COLUMN IF NOT EXISTS "subtopicId" TEXT;
    `;
    
    // Add subtopicId column to tests table if it doesn't exist
    await prisma.$executeRaw`
      ALTER TABLE tests 
      ADD COLUMN IF NOT EXISTS "subtopicId" TEXT;
    `;
    
    // Add foreign key constraints if they don't exist
    try {
      await prisma.$executeRaw`
        ALTER TABLE materials 
        ADD CONSTRAINT IF NOT EXISTS "materials_subtopicId_fkey" 
        FOREIGN KEY ("subtopicId") REFERENCES subtopics(id) ON DELETE CASCADE;
      `;
    } catch (error) {
      console.log('⚠️  Materials foreign key constraint already exists or failed:', error);
    }
    
    try {
      await prisma.$executeRaw`
        ALTER TABLE tests 
        ADD CONSTRAINT IF NOT EXISTS "tests_subtopicId_fkey" 
        FOREIGN KEY ("subtopicId") REFERENCES subtopics(id) ON DELETE CASCADE;
      `;
    } catch (error) {
      console.log('⚠️  Tests foreign key constraint already exists or failed:', error);
    }
    
    // Test the schema by trying to fetch courses
    console.log('🧪 Testing course fetch after schema fix...');
    const courses = await prisma.course.findMany({
      take: 1,
      include: {
        topics: {
          include: {
            tests: true
          }
        }
      }
    });
    
    console.log(`✅ Schema fix successful! Found ${courses.length} courses`);
    
    return NextResponse.json({
      success: true,
      message: 'Subtopic schema fixed successfully',
      coursesFound: courses.length
    });

  } catch (error: any) {
    console.error('❌ Schema fix failed:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Schema fix failed',
        details: error.message,
        code: error.code
      },
      { status: 500 }
    );
  }
}
