import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST() {
  try {
    // Add ADMIN role to UserRole enum if it doesn't exist
    const result = await prisma.$executeRaw`
      DO $$ 
      BEGIN 
        -- Check if ADMIN value exists in UserRole enum
        IF NOT EXISTS (
          SELECT 1 FROM pg_enum 
          WHERE enumlabel = 'ADMIN' 
          AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'UserRole')
        ) THEN
          -- Add ADMIN value to UserRole enum
          ALTER TYPE "UserRole" ADD VALUE 'ADMIN';
        END IF;
      END $$;
    `;

    return NextResponse.json({
      success: true,
      message: 'UserRole enum updated successfully',
      result,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error updating UserRole enum:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Failed to update UserRole enum',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
