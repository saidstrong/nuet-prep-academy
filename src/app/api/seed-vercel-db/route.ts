import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Lazy import to prevent build-time issues
    const { prisma } = await import('@/lib/prisma');
    const bcrypt = await import('bcryptjs');
    
    console.log('🌱 Seeding Vercel database...');
    
    // Check if admin already exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email: 'admin@nuetprep.academy' }
    });

    if (existingAdmin) {
      console.log('✅ Admin account already exists in Vercel database');
      return NextResponse.json({
        success: true,
        message: 'Admin account already exists in Vercel database',
        adminId: existingAdmin.id,
        adminName: existingAdmin.name,
        adminRole: existingAdmin.role
      });
    }

    // Create admin account in Vercel database
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

    console.log('✅ Admin account created in Vercel database');

    // Create sample courses in Vercel database
    const course1 = await prisma.course.create({
      data: {
        title: 'NUET Full Prep',
        description: '60,000 ₸ for 6 months. Math, Critical Thinking, English. Weekday online lessons for new topics. Saturday full sample test on the website; Sunday review with solutions and feedback.',
        price: 60000,
        duration: '6 months',
        maxStudents: 30,
        instructor: 'Dr. Sarah Johnson',
        difficulty: 'ADVANCED',
        estimatedHours: 120,
        isActive: true,
        creatorId: admin.id,
      }
    });

    const course2 = await prisma.course.create({
      data: {
        title: 'NUET Crash Course',
        description: '40,000 ₸ for 2 months. All topics, content, and problem sets with detailed solutions for self-prep, plus a full sample exam.',
        price: 40000,
        duration: '2 months',
        maxStudents: 25,
        instructor: 'Prof. Michael Chen',
        difficulty: 'INTERMEDIATE',
        estimatedHours: 80,
        isActive: true,
        creatorId: admin.id,
      }
    });

    const course3 = await prisma.course.create({
      data: {
        title: '1-on-1 Private Tutoring',
        description: '80,000 ₸ per month. Daily 1-hour online sessions with the tutor focused on new topics.',
        price: 80000,
        duration: 'Monthly',
        maxStudents: 1,
        instructor: 'Dr. Emily Rodriguez',
        difficulty: 'BEGINNER',
        estimatedHours: 30,
        isActive: true,
        creatorId: admin.id,
      }
    });

    console.log('✅ Sample courses created in Vercel database');

    return NextResponse.json({
      success: true,
      message: 'Vercel database seeded successfully!',
      adminId: admin.id,
      adminName: admin.name,
      adminRole: admin.role,
      coursesCreated: [course1.title, course2.title, course3.title],
      note: 'Now try logging in with admin@nuetprep.academy / admin123'
    });

  } catch (error) {
    console.error('❌ Error seeding Vercel database:', error);
    return NextResponse.json({
      success: false,
      message: 'Error seeding Vercel database',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
