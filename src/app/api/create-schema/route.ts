import { NextResponse } from 'next/server';

export async function GET() {
  try {
    console.log('🏗️ Attempting to create database schema on Vercel...');
    
    // Lazy import to prevent build-time issues
    const { prisma } = await import('@/lib/prisma');
    
    try {
      // Try to connect to the database
      await prisma.$connect();
      console.log('✅ Connected to Vercel database');
      
      // Try to create a simple table by running a query that might trigger schema creation
      // This is a workaround since we can't run prisma db push on Vercel
      try {
        // Try to count users - this might trigger table creation
        const userCount = await prisma.user.count();
        console.log(`✅ Users table exists, count: ${userCount}`);
        
        return NextResponse.json({
          success: true,
          message: 'Database schema already exists!',
          userCount,
          timestamp: new Date().toISOString(),
          note: 'Tables are ready, you can now seed the database'
        });
        
      } catch (tableError: any) {
        console.log('⚠️ Tables might not exist, trying to create them...');
        
        // If tables don't exist, we need to create them manually
        // For now, return an error that explains the situation
        return NextResponse.json({
          success: false,
          message: 'Database tables do not exist yet',
          error: tableError.message,
          timestamp: new Date().toISOString(),
          note: 'You need to run "prisma db push" locally to create tables, or the database connection is wrong'
        });
      }
      
    } catch (connectionError: any) {
      console.error('❌ Database connection failed:', connectionError);
      
      return NextResponse.json({
        success: false,
        message: 'Database connection failed',
        error: connectionError.message,
        timestamp: new Date().toISOString(),
        note: 'Check your DATABASE_URL in Vercel environment variables'
      });
    }
    
  } catch (error) {
    console.error('❌ Schema creation endpoint failed:', error);
    return NextResponse.json({
      success: false,
      message: 'Schema creation endpoint failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  } finally {
    try {
      const { prisma } = await import('@/lib/prisma');
      await prisma.$disconnect();
    } catch (e) {
      // Ignore disconnect errors
    }
  }
}
