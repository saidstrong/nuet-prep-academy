import { NextResponse } from 'next/server';

export async function GET() {
  try {
    console.log('🧪 Testing signup functionality...');
    
    // Lazy import to prevent build-time issues
    const { prisma } = await import('@/lib/prisma');

    try {
      // Test basic database connection
      await prisma.$connect();
      console.log('✅ Database connected successfully');

      // Test if we can create a simple user (we'll delete it immediately)
      const testUser = await prisma.user.create({
        data: {
          name: 'Test User',
          email: 'test@example.com',
          password: 'test123',
          role: 'STUDENT',
          profile: {
            create: {
              bio: 'Test user for signup testing',
              phone: '',
              avatar: ''
            }
          }
        }
      });

      console.log('✅ Test user created successfully:', testUser.id);

      // Immediately delete the test user
      await prisma.user.delete({
        where: { id: testUser.id }
      });

      console.log('✅ Test user deleted successfully');

      return NextResponse.json({
        success: true,
        message: 'Signup functionality test successful!',
        test: 'User creation and deletion working',
        timestamp: new Date().toISOString(),
        note: 'Signup should work now!'
      });

    } catch (dbError: any) {
      console.error('❌ Database operation failed:', dbError);
      
      return NextResponse.json({
        success: false,
        message: 'Signup functionality test failed',
        error: dbError.message,
        timestamp: new Date().toISOString(),
        note: 'This explains why signup is failing'
      });
    } finally {
      await prisma.$disconnect();
    }

  } catch (error) {
    console.error('❌ Signup test failed:', error);
    return NextResponse.json({
      success: false,
      message: 'Signup test failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
