import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Create a fresh Prisma instance for this request
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();
    
    console.log('🔐 Testing minimal authentication...');
    
    // Simple connection test
    await prisma.$connect();
    console.log('✅ Connected to database');
    
    // Try to find the admin account
    const admin = await prisma.user.findFirst({
      where: { role: 'ADMIN' },
      select: { id: true, email: true, name: true, role: true }
    });
    
    console.log('✅ Admin account found:', admin ? 'Yes' : 'No');
    
    // Always disconnect
    await prisma.$disconnect();
    
    return NextResponse.json({
      success: true,
      message: 'Minimal authentication test successful',
      adminFound: !!admin,
      adminEmail: admin?.email || 'Not found',
      timestamp: new Date().toISOString(),
      note: 'This test used a fresh Prisma instance to avoid connection conflicts'
    });
    
  } catch (error) {
    console.error('❌ Minimal auth test failed:', error);
    return NextResponse.json({
      success: false,
      message: 'Minimal authentication test failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
