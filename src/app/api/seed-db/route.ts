import { NextResponse } from 'next/server';

export async function GET() {
  return await seedDatabase();
}

export async function POST() {
  return await seedDatabase();
}

async function seedDatabase() {
  try {
    // Lazy import to prevent build-time issues
    const { prisma } = await import('@/lib/prisma');
    const bcrypt = await import('bcryptjs');
    
    console.log('🌱 Seeding Supabase database...');
    
    // Check if owner already exists
    const existingOwner = await prisma.user.findUnique({
      where: { email: 'owner@nuetprep.academy' }
    });
    
    if (existingOwner) {
      console.log('✅ Owner account already exists');
      return NextResponse.json({
        success: true,
        message: 'Owner account already exists',
        ownerId: existingOwner.id,
        ownerName: existingOwner.name,
        ownerRole: existingOwner.role
      });
    }
    
    // Create owner account
    const hashedPassword = await bcrypt.hash('owner123', 12);
    
    const owner = await prisma.user.create({
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
      message: 'Owner account created successfully',
      ownerId: owner.id,
      ownerName: owner.name,
      ownerRole: owner.role
    });
    
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    return NextResponse.json({
      success: false,
      message: 'Error seeding database',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
