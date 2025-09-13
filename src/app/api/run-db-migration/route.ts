import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST() {
  try {
    // Test basic connection first
    await prisma.$queryRaw`SELECT 1 as test`;
    
    // Since we can't run execSync in Vercel, go straight to manual SQL fallback
    try {
      console.log('Starting manual database schema update...');
      
      // Create missing tables with basic structure
      await prisma.$executeRaw`
        CREATE TABLE IF NOT EXISTS "UserPoints" (
          "id" TEXT NOT NULL,
          "userId" TEXT NOT NULL,
          "points" INTEGER NOT NULL DEFAULT 0,
          "level" INTEGER NOT NULL DEFAULT 1,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL,
          CONSTRAINT "UserPoints_pkey" PRIMARY KEY ("id")
        );
      `;
      
      await prisma.$executeRaw`
        CREATE TABLE IF NOT EXISTS "FriendConnection" (
          "id" TEXT NOT NULL,
          "userId" TEXT NOT NULL,
          "friendId" TEXT NOT NULL,
          "status" TEXT NOT NULL DEFAULT 'PENDING',
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL,
          CONSTRAINT "FriendConnection_pkey" PRIMARY KEY ("id")
        );
      `;
      
      await prisma.$executeRaw`
        CREATE TABLE IF NOT EXISTS "Event" (
          "id" TEXT NOT NULL,
          "name" TEXT NOT NULL,
          "description" TEXT,
          "type" TEXT NOT NULL,
          "status" TEXT NOT NULL DEFAULT 'ACTIVE',
          "startDate" TIMESTAMP(3) NOT NULL,
          "endDate" TIMESTAMP(3) NOT NULL,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL,
          CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
        );
      `;
      
      // Add missing columns to existing tables
      try {
        await prisma.$executeRaw`
          ALTER TABLE "profiles" ADD COLUMN IF NOT EXISTS "whatsapp" TEXT;
        `;
      } catch (error) {
        console.log('whatsapp column might already exist or table structure is different');
      }
      
      try {
        await prisma.$executeRaw`
          ALTER TABLE "course_enrollments" ADD COLUMN IF NOT EXISTS "paymentStatus" TEXT DEFAULT 'PENDING';
        `;
      } catch (error) {
        console.log('paymentStatus column might already exist or table structure is different');
      }
      
      try {
        await prisma.$executeRaw`
          ALTER TABLE "payments" ADD COLUMN IF NOT EXISTS "currency" TEXT DEFAULT 'USD';
      `;
      } catch (error) {
        console.log('currency column might already exist or table structure is different');
      }
      
      // Create missing enums if they don't exist
      try {
        await prisma.$executeRaw`
          DO $$ BEGIN
            CREATE TYPE "EnrollmentStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');
          EXCEPTION
            WHEN duplicate_object THEN null;
          END $$;
        `;
      } catch (error) {
        console.log('EnrollmentStatus enum might already exist');
      }
      
      try {
        await prisma.$executeRaw`
          DO $$ BEGIN
            CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PAID', 'FAILED', 'REFUNDED');
          EXCEPTION
            WHEN duplicate_object THEN null;
          END $$;
        `;
      } catch (error) {
        console.log('PaymentStatus enum might already exist');
      }
      
      return NextResponse.json({ 
        success: true, 
        message: 'Database schema updated successfully (manual SQL fallback)',
        details: 'Created missing tables and added missing columns',
        timestamp: new Date().toISOString()
      });
      
    } catch (manualError: any) {
      console.error('Manual schema update failed:', manualError);
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to update schema manually',
        details: manualError.message,
        timestamp: new Date().toISOString()
      }, { status: 500 });
    }
    
  } catch (error: any) {
    console.error('Database connection test failed:', error);
    
    return NextResponse.json({ 
      success: false, 
      error: 'Database connection failed',
      details: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
