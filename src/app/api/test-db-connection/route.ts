import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Lazy import to prevent build-time issues
    const { prisma } = await import('@/lib/prisma');
    
    console.log('🔌 Testing database connection...');
    
    // Just try to connect - no queries
    await prisma.$connect();
    console.log('✅ Database connected successfully');
    
    // Simple count query to test basic functionality
    const userCount = await prisma.user.count();
    console.log(`📊 Users table accessible, count: ${userCount}`);
    
    return NextResponse.json({
      success: true,
      message: 'Database connection successful',
      userCount,
      timestamp: new Date().toISOString(),
      note: 'Database is working - authentication should work now'
    });
    
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    return NextResponse.json({
      success: false,
      message: 'Database connection failed',
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
