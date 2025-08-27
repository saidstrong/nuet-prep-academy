import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Lazy import to prevent build-time issues
    const { prisma } = await import('@/lib/prisma');
    const bcrypt = await import('bcryptjs');
    
    console.log('🔍 Testing authentication process...');
    
    // Get the owner account
    const owner = await prisma.user.findUnique({
      where: { email: 'owner@nuetprep.academy' }
    });
    
    if (!owner) {
      return NextResponse.json({
        success: false,
        message: 'Owner account not found'
      });
    }
    
    // Test password verification
    const testPassword = 'owner123';
    const isPasswordValid = await bcrypt.compare(testPassword, owner.password);
    
    // Test with different password variations
    const testPassword2 = 'Saltanat_1980';
    const isPassword2Valid = await bcrypt.compare(testPassword2, owner.password);
    
    return NextResponse.json({
      success: true,
      message: 'Authentication test results',
      ownerId: owner.id,
      ownerName: owner.name,
      ownerRole: owner.role,
      passwordTests: {
        'owner123': isPasswordValid,
        'Saltanat_1980': isPassword2Valid
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
  }
}
