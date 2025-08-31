import { NextResponse } from 'next/server';

export async function GET() {
  let prisma: any = null;
  
  try {
    // Lazy import to prevent build-time issues
    const { prisma: prismaClient } = await import('@/lib/prisma');
    prisma = prismaClient;
    
    console.log('🔍 Testing authentication process...');
    
    // Get the admin account
    const admin = await prisma.user.findUnique({
      where: { email: 'admin@nuetprep.academy' }
    });
    
    if (!admin) {
      return NextResponse.json({
        success: false,
        message: 'Admin account not found'
      });
    }
    
    // Test password verification
    const bcrypt = await import('bcryptjs');
    const testPassword = 'admin123';
    const isPasswordValid = await bcrypt.compare(testPassword, admin.password);
    
    // Test with different password variations
    const testPassword2 = 'owner123';
    const isPassword2Valid = await bcrypt.compare(testPassword2, admin.password);
    
    return NextResponse.json({
      success: true,
      message: 'Authentication test results',
      adminId: admin.id,
      adminName: admin.name,
      adminRole: admin.role,
      passwordTests: {
        'admin123': isPasswordValid,
        'owner123': isPassword2Valid
      },
      note: 'Check which password matches the hash in the database'
    });
    
  } catch (error) {
    console.error('❌ Authentication test failed:', error);
    return NextResponse.json({
      success: false,
      message: 'Authentication test failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  } finally {
    if (prisma) {
      try {
        await prisma.$disconnect();
      } catch (e) {
        // Ignore disconnect errors
      }
    }
  }
}
