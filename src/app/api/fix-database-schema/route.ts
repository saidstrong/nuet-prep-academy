import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST() {
  try {
    // Test basic connection first
    await prisma.$queryRaw`SELECT 1 as test`;
    
    // Run schema push to sync database with Prisma schema
    const { execSync } = require('child_process');
    
    try {
      // This will run in Vercel environment
      execSync('npx prisma db push --accept-data-loss', { 
        stdio: 'pipe',
        env: process.env 
      });
      
      return NextResponse.json({ 
        success: true, 
        message: 'Database schema updated successfully',
        timestamp: new Date().toISOString()
      });
    } catch (execError: any) {
      console.error('Schema push failed:', execError);
      
      // Fallback: try to create missing tables manually
      try {
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
        
        return NextResponse.json({ 
          success: true, 
          message: 'Database schema partially updated (manual fallback)',
          timestamp: new Date().toISOString()
        });
        
      } catch (manualError: any) {
        return NextResponse.json({ 
          success: false, 
          error: 'Failed to update schema',
          execError: execError.message,
          manualError: manualError.message,
          timestamp: new Date().toISOString()
        }, { status: 500 });
      }
    }
    
  } catch (error: any) {
    console.error('Database schema fix failed:', error);
    
    return NextResponse.json({ 
      success: false, 
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
