import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    console.log('🔧 Setting up missing database tables...');
    
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

    const results = [];

    // Create subtopics table
    try {
      await prisma.$executeRaw`
        CREATE TABLE IF NOT EXISTS "subtopics" (
          "id" TEXT NOT NULL PRIMARY KEY,
          "title" TEXT NOT NULL,
          "description" TEXT,
          "order" INTEGER NOT NULL DEFAULT 0,
          "topicId" TEXT NOT NULL,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL,
          CONSTRAINT "subtopics_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "topics"("id") ON DELETE CASCADE
        );
      `;
      results.push('✅ Subtopics table created');
    } catch (error: any) {
      results.push(`⚠️  Subtopics table: ${error.message}`);
    }

    // Add subtopicId columns to materials table
    try {
      await prisma.$executeRaw`
        ALTER TABLE "materials" 
        ADD COLUMN IF NOT EXISTS "subtopicId" TEXT;
      `;
      results.push('✅ Materials subtopicId column added');
    } catch (error: any) {
      results.push(`⚠️  Materials subtopicId: ${error.message}`);
    }

    // Add subtopicId columns to tests table
    try {
      await prisma.$executeRaw`
        ALTER TABLE "tests" 
        ADD COLUMN IF NOT EXISTS "subtopicId" TEXT;
      `;
      results.push('✅ Tests subtopicId column added');
    } catch (error: any) {
      results.push(`⚠️  Tests subtopicId: ${error.message}`);
    }

    // Add foreign key constraints (PostgreSQL doesn't support IF NOT EXISTS for constraints)
    try {
      await prisma.$executeRaw`
        DO $$ 
        BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM information_schema.table_constraints 
            WHERE constraint_name = 'materials_subtopicId_fkey'
          ) THEN
            ALTER TABLE "materials" 
            ADD CONSTRAINT "materials_subtopicId_fkey" 
            FOREIGN KEY ("subtopicId") REFERENCES "subtopics"("id") ON DELETE CASCADE;
          END IF;
        END $$;
      `;
      results.push('✅ Materials foreign key constraint added');
    } catch (error: any) {
      results.push(`⚠️  Materials foreign key: ${error.message}`);
    }

    try {
      await prisma.$executeRaw`
        DO $$ 
        BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM information_schema.table_constraints 
            WHERE constraint_name = 'tests_subtopicId_fkey'
          ) THEN
            ALTER TABLE "tests" 
            ADD CONSTRAINT "tests_subtopicId_fkey" 
            FOREIGN KEY ("subtopicId") REFERENCES "subtopics"("id") ON DELETE CASCADE;
          END IF;
        END $$;
      `;
      results.push('✅ Tests foreign key constraint added');
    } catch (error: any) {
      results.push(`⚠️  Tests foreign key: ${error.message}`);
    }

    // Add missing fileSize column to materials table
    try {
      await prisma.$executeRaw`
        ALTER TABLE "materials" 
        ADD COLUMN IF NOT EXISTS "fileSize" INTEGER;
      `;
      results.push('✅ Materials fileSize column added');
    } catch (error: any) {
      results.push(`⚠️  Materials fileSize: ${error.message}`);
    }

    // Add missing fileName column to materials table
    try {
      await prisma.$executeRaw`
        ALTER TABLE "materials" 
        ADD COLUMN IF NOT EXISTS "fileName" TEXT;
      `;
      results.push('✅ Materials fileName column added');
    } catch (error: any) {
      results.push(`⚠️  Materials fileName: ${error.message}`);
    }

    // Add missing mimeType column to materials table
    try {
      await prisma.$executeRaw`
        ALTER TABLE "materials" 
        ADD COLUMN IF NOT EXISTS "mimeType" TEXT;
      `;
      results.push('✅ Materials mimeType column added');
    } catch (error: any) {
      results.push(`⚠️  Materials mimeType: ${error.message}`);
    }

    // Add missing isPublished column to materials table
    try {
      await prisma.$executeRaw`
        ALTER TABLE "materials" 
        ADD COLUMN IF NOT EXISTS "isPublished" BOOLEAN DEFAULT false;
      `;
      results.push('✅ Materials isPublished column added');
    } catch (error: any) {
      results.push(`⚠️  Materials isPublished: ${error.message}`);
    }

    // Add missing updatedAt column to course_enrollments table
    try {
      await prisma.$executeRaw`
        ALTER TABLE "course_enrollments" 
        ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
      `;
      results.push('✅ Course enrollments updatedAt column added');
    } catch (error: any) {
      results.push(`⚠️  Course enrollments updatedAt: ${error.message}`);
    }

    // Create course_favorites table
    try {
      await prisma.$executeRaw`
        CREATE TABLE IF NOT EXISTS "course_favorites" (
          "id" TEXT NOT NULL PRIMARY KEY,
          "studentId" TEXT NOT NULL,
          "courseId" TEXT NOT NULL,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "course_favorites_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "users"("id") ON DELETE CASCADE,
          CONSTRAINT "course_favorites_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "courses"("id") ON DELETE CASCADE,
          CONSTRAINT "course_favorites_studentId_courseId_key" UNIQUE ("studentId", "courseId")
        );
      `;
      results.push('✅ Course favorites table created');
    } catch (error: any) {
      results.push(`⚠️  Course favorites table: ${error.message}`);
    }

    // Create course_bookmarks table
    try {
      await prisma.$executeRaw`
        CREATE TABLE IF NOT EXISTS "course_bookmarks" (
          "id" TEXT NOT NULL PRIMARY KEY,
          "studentId" TEXT NOT NULL,
          "courseId" TEXT NOT NULL,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "course_bookmarks_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "users"("id") ON DELETE CASCADE,
          CONSTRAINT "course_bookmarks_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "courses"("id") ON DELETE CASCADE,
          CONSTRAINT "course_bookmarks_studentId_courseId_key" UNIQUE ("studentId", "courseId")
        );
      `;
      results.push('✅ Course bookmarks table created');
    } catch (error: any) {
      results.push(`⚠️  Course bookmarks table: ${error.message}`);
    }

    // Test the setup by trying to fetch some data
    try {
      const courses = await prisma.course.findMany({ take: 1 });
      const topics = await prisma.topic.findMany({ take: 1 });
      const subtopics = await prisma.subtopic.findMany({ take: 1 });
      const materials = await prisma.material.findMany({ take: 1 });
      const tests = await prisma.test.findMany({ take: 1 });
      
      results.push(`✅ Test successful: ${courses.length} courses, ${topics.length} topics, ${subtopics.length} subtopics, ${materials.length} materials, ${tests.length} tests`);
    } catch (error: any) {
      results.push(`❌ Test failed: ${error.message}`);
    }

    console.log('✅ Database setup completed');
    console.log('Results:', results);

    return NextResponse.json({
      success: true,
      message: 'Missing tables setup completed',
      results: results
    });

  } catch (error: any) {
    console.error('❌ Database setup failed:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Database setup failed',
        details: error.message,
        code: error.code
      },
      { status: 500 }
    );
  }
}
