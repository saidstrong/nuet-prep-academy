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
    
        // Check if admin already exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email: 'admin@nuetprep.academy' }
    });

    if (existingAdmin) {
      console.log('✅ Admin account already exists');
      return NextResponse.json({
        success: true,
        message: 'Admin account already exists',
        adminId: existingAdmin.id,
        adminName: existingAdmin.name,
        adminRole: existingAdmin.role
      });
    }

    // Create admin account
    const hashedPassword = await bcrypt.hash('admin123', 12);

    const admin = await prisma.user.create({
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
      message: 'Admin account created successfully',
      adminId: admin.id,
      adminName: admin.name,
      adminRole: admin.role
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
