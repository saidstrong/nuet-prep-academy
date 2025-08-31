import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST() {
  try {
    // Add maxStudents column to courses table if it doesn't exist
    const result = await prisma.$executeRaw`
      DO $$ 
      BEGIN 
        -- Check if maxStudents column exists in courses table
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'courses' 
          AND column_name = 'maxStudents'
        ) THEN
          -- Add maxStudents column to courses table
          ALTER TABLE "courses" ADD COLUMN "maxStudents" INTEGER DEFAULT 40;
        END IF;
      END $$;
    `;

    return NextResponse.json({
      success: true,
      message: 'Database schema updated successfully - maxStudents column added',
      result,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error updating database schema:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Failed to update database schema',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
