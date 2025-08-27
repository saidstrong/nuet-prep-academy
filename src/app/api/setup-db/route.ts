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
    
    // Check for owner account
    const owner = await prisma.user.findUnique({
      where: { email: 'owner@nuetprep.academy' }
    });
    
    if (owner) {
      console.log('✅ Owner account exists');
      return NextResponse.json({
        success: true,
        message: 'Database setup complete - Owner account exists',
        userCount,
        ownerId: owner.id,
        ownerName: owner.name,
        ownerRole: owner.role
      });
    }
    
    // Create owner account if it doesn't exist
    console.log('❌ Owner account not found - creating it now...');
    const bcrypt = await import('bcryptjs');
    const hashedPassword = await bcrypt.hash('owner123', 12);
    
    const newOwner = await prisma.user.create({
      data: {
        email: 'owner@nuetprep.academy',
        name: 'Said Amanzhol',
        password: hashedPassword,
        role: 'OWNER',
        profile: {
          create: {
            bio: 'Founder and owner of NUET Prep Academy',
            phone: '+77075214911',
            address: 'Astana, Kabanbay Batyr avenue, 53. Nazarbayev University',
          }
        }
      }
    });
    
    console.log('✅ Owner account created successfully');
    
    return NextResponse.json({
      success: true,
      message: 'Database setup complete - Owner account created',
      userCount: userCount + 1,
      ownerId: newOwner.id,
      ownerName: newOwner.name,
      ownerRole: newOwner.role
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
