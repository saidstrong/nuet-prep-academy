import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    
    console.log('🔍 Debug login attempt:', { email, password });
    
    // Lazy import to prevent build-time issues
    const { prisma } = await import('@/lib/prisma');
    
    // Find the user
    const user = await prisma.user.findUnique({
      where: { email: email }
    });
    
    if (!user) {
      console.log('❌ User not found');
      return NextResponse.json({
        success: false,
        message: 'User not found',
        debug: { email, userFound: false }
      });
    }
    
    console.log('✅ User found:', { id: user.id, name: user.name, role: user.role });
    
    // Test password with bcrypt
    const bcrypt = await import('bcryptjs');
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    console.log('🔐 Password check result:', { isPasswordValid, passwordLength: password.length });
    
    // Test with known working password
    const testPassword = 'admin123';
    const isTestPasswordValid = await bcrypt.compare(testPassword, user.password);
    
    console.log('🧪 Test password check:', { isTestPasswordValid });
    
    return NextResponse.json({
      success: true,
      message: 'Login debug completed',
      debug: {
        email,
        userFound: true,
        userId: user.id,
        userName: user.name,
        userRole: user.role,
        passwordProvided: password,
        passwordLength: password.length,
        passwordValid: isPasswordValid,
        testPasswordValid: isTestPasswordValid,
        note: 'Check if the provided password matches the test password'
      }
    });
    
  } catch (error) {
    console.error('❌ Debug login failed:', error);
    return NextResponse.json({
      success: false,
      message: 'Debug login failed',
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
