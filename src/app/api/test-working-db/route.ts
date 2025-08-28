import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Lazy import to prevent build-time issues
    const { prisma } = await import('@/lib/prisma');
    
    console.log('🔍 Testing database functionality...');
    
    // Test basic connection
    await prisma.$connect();
    console.log('✅ Database connected successfully');
    
    // Test user count
    const userCount = await prisma.user.count();
    console.log(`📊 Users found: ${userCount}`);
    
    // Test finding admin account
    const admin = await prisma.user.findFirst({
      where: { role: 'ADMIN' },
      select: { id: true, email: true, name: true, role: true }
    });
    
    console.log('✅ Admin account found:', admin ? 'Yes' : 'No');
    
    // Test course count
    const courseCount = await prisma.course.count();
    console.log(`📚 Courses found: ${courseCount}`);
    
    return NextResponse.json({
      success: true,
      message: 'Database is working perfectly!',
      userCount,
      adminFound: !!admin,
      adminEmail: admin?.email || 'Not found',
      courseCount,
      timestamp: new Date().toISOString(),
      note: 'Authentication should work now!'
    });
    
  } catch (error) {
    console.error('❌ Database test failed:', error);
    return NextResponse.json({
      success: false,
      message: 'Database test failed',
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
