import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    console.log('🔧 Fixing EnrollmentStatus enum...');

    // First, let's check what values exist in the database
    const result = await prisma.$queryRaw`
      SELECT unnest(enum_range(NULL::"EnrollmentStatus")) as status;
    `;
    
    console.log('Current enum values:', result);

    // Try to create the enum if it doesn't exist
    try {
      await prisma.$executeRaw`
        CREATE TYPE "EnrollmentStatus" AS ENUM ('PENDING', 'ACTIVE', 'COMPLETED', 'CANCELLED');
      `;
      console.log('✅ Created EnrollmentStatus enum');
    } catch (error: any) {
      if (error.message.includes('already exists')) {
        console.log('✅ EnrollmentStatus enum already exists');
      } else {
        console.log('❌ Error creating enum:', error.message);
      }
    }

    // Try to add missing values
    try {
      await prisma.$executeRaw`
        ALTER TYPE "EnrollmentStatus" ADD VALUE IF NOT EXISTS 'ACTIVE';
      `;
      console.log('✅ Added ACTIVE value to enum');
    } catch (error: any) {
      console.log('❌ Error adding ACTIVE value:', error.message);
    }

    try {
      await prisma.$executeRaw`
        ALTER TYPE "EnrollmentStatus" ADD VALUE IF NOT EXISTS 'PENDING';
      `;
      console.log('✅ Added PENDING value to enum');
    } catch (error: any) {
      console.log('❌ Error adding PENDING value:', error.message);
    }

    try {
      await prisma.$executeRaw`
        ALTER TYPE "EnrollmentStatus" ADD VALUE IF NOT EXISTS 'COMPLETED';
      `;
      console.log('✅ Added COMPLETED value to enum');
    } catch (error: any) {
      console.log('❌ Error adding COMPLETED value:', error.message);
    }

    try {
      await prisma.$executeRaw`
        ALTER TYPE "EnrollmentStatus" ADD VALUE IF NOT EXISTS 'CANCELLED';
      `;
      console.log('✅ Added CANCELLED value to enum');
    } catch (error: any) {
      console.log('❌ Error adding CANCELLED value:', error.message);
    }

    // Check final enum values
    const finalResult = await prisma.$queryRaw`
      SELECT unnest(enum_range(NULL::"EnrollmentStatus")) as status;
    `;
    
    console.log('Final enum values:', finalResult);

    return NextResponse.json({
      success: true,
      message: 'EnrollmentStatus enum fixed',
      initialValues: result,
      finalValues: finalResult
    });
  } catch (error: any) {
    console.error('Fix Enrollment Enum API Error:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}
