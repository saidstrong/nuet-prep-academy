import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Testing Vercel database connection...');
    
    // Test 1: Check environment variables
    const databaseUrl = process.env.DATABASE_URL;
    const directUrl = process.env.DIRECT_URL;
    
    console.log('Environment check:');
    console.log('DATABASE_URL exists:', !!databaseUrl);
    console.log('DIRECT_URL exists:', !!directUrl);
    console.log('NODE_ENV:', process.env.NODE_ENV);
    
    if (!databaseUrl) {
      return NextResponse.json({
        success: false,
        error: 'DATABASE_URL not found in environment variables',
        step: 'env_check'
      });
    }
    
    // Test 2: Try to import Prisma
    let prisma;
    try {
      const { PrismaClient } = await import('@prisma/client');
      prisma = new PrismaClient();
      console.log('✅ Prisma client created successfully');
    } catch (error: any) {
      console.error('❌ Prisma import failed:', error.message);
      return NextResponse.json({
        success: false,
        error: 'Failed to import Prisma client',
        details: error.message,
        step: 'prisma_import'
      });
    }
    
    // Test 3: Try to connect to database
    try {
      console.log('🔗 Attempting database connection...');
      await prisma.$connect();
      console.log('✅ Database connection successful');
      
      // Test 4: Try a simple query
      const result = await prisma.$queryRaw`SELECT NOW() as current_time`;
      console.log('✅ Database query successful:', result);
      
      await prisma.$disconnect();
      
      return NextResponse.json({
        success: true,
        message: 'Database connection successful from Vercel',
        currentTime: result,
        environment: {
          hasDatabaseUrl: !!databaseUrl,
          hasDirectUrl: !!directUrl,
          nodeEnv: process.env.NODE_ENV
        }
      });
      
    } catch (dbError: any) {
      console.error('❌ Database connection failed:', dbError);
      await prisma.$disconnect();
      
      return NextResponse.json({
        success: false,
        error: 'Database connection failed',
        details: dbError.message,
        code: dbError.code,
        step: 'database_connection'
      });
    }
    
  } catch (error: any) {
    console.error('❌ Test failed:', error);
    return NextResponse.json({
      success: false,
      error: 'Test failed',
      details: error.message,
      step: 'general_error'
    }, { status: 500 });
  }
}
