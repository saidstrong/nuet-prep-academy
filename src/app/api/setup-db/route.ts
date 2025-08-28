import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Lazy import to prevent build-time issues
    const { prisma } = await import('@/lib/prisma');
    
    console.log('🔧 Setting up Supabase database...');
    
    // Test basic connection first
    await prisma.$connect();
    console.log('✅ Database connected successfully');
    
    // Check if tables exist by trying to count users
    const userCount = await prisma.user.count();
    console.log(`📊 Users table exists, count: ${userCount}`);
    
    // Check for admin account
    const admin = await prisma.user.findUnique({
      where: { email: 'admin@nuetprep.academy' }
    });
    
    if (admin) {
      console.log('✅ Admin account exists');
      return NextResponse.json({
        success: true,
        message: 'Database setup complete - Admin account exists',
        userCount,
        adminId: admin.id,
        adminName: admin.name,
        adminRole: admin.role
      });
    }
    
    // Create admin account if it doesn't exist
    console.log('❌ Admin account not found - creating it now...');
    const bcrypt = await import('bcryptjs');
    const hashedPassword = await bcrypt.hash('admin123', 12);
    
    const newAdmin = await prisma.user.create({
      data: {
        email: 'admin@nuetprep.academy',
        name: 'Said Amanzhol',
        password: hashedPassword,
        role: 'ADMIN',
        profile: {
          create: {
            bio: 'Founder and admin of NUET Prep Academy',
            phone: '+77075214911',
            experience: '5+ years in education',
          }
        }
      }
    });
    
    console.log('✅ Admin account created successfully');
    
    return NextResponse.json({
      success: true,
      message: 'Database setup complete - Admin account created',
      userCount: userCount + 1,
      adminId: newAdmin.id,
      adminName: newAdmin.name,
      adminRole: newAdmin.role
    });
    
  } catch (error) {
    console.error('❌ Database setup failed:', error);
    return NextResponse.json({
      success: false,
      message: 'Database setup failed',
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
