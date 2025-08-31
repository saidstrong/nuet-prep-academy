import { NextResponse } from 'next/server';

export async function GET() {
  try {
    console.log('🔍 Testing database connection from Vercel...');
    
    // Lazy import to prevent build-time issues
    const { prisma } = await import('@/lib/prisma');
    
    // Test basic connection
    await prisma.$connect();
    console.log('✅ Database connected successfully');
    
    // Check if users table exists and has data
    const userCount = await prisma.user.count();
    console.log(`📊 Total users in database: ${userCount}`);
    
    // Check for the admin account specifically
    const admin = await prisma.user.findUnique({
      where: { email: 'admin@nuetprep.academy' }
    });
    
    if (admin) {
      console.log('✅ Admin account found');
      return NextResponse.json({
        success: true,
        message: 'Database connection successful',
        userCount,
        adminFound: true,
        adminId: admin.id,
        adminName: admin.name,
        adminRole: admin.role
      });
    } else {
      console.log('❌ Admin account NOT found');
      return NextResponse.json({
        success: true,
        message: 'Database connected but admin account not found',
        userCount,
        adminFound: false
      });
    }
    
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
