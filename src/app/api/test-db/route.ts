import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    console.log('🔍 Testing database connection from Vercel...');
    
    // Test basic connection
    await prisma.$connect();
    console.log('✅ Database connected successfully');
    
    // Check if users table exists and has data
    const userCount = await prisma.user.count();
    console.log(`📊 Total users in database: ${userCount}`);
    
    // Check for the owner account specifically
    const owner = await prisma.user.findUnique({
      where: { email: 'owner@nuetprep.academy' }
    });
    
    if (owner) {
      console.log('✅ Owner account found');
      return NextResponse.json({
        success: true,
        message: 'Database connection successful',
        userCount,
        ownerFound: true,
        ownerId: owner.id,
        ownerName: owner.name,
        ownerRole: owner.role
      });
    } else {
      console.log('❌ Owner account NOT found');
      return NextResponse.json({
        success: true,
        message: 'Database connected but owner account not found',
        userCount,
        ownerFound: false
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
    await prisma.$disconnect();
  }
}
