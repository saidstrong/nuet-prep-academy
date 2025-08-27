import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Lazy import to prevent build-time issues
    const { prisma } = await import('@/lib/prisma');
    const bcrypt = await import('bcryptjs');
    
    console.log('🌱 Seeding Vercel database...');
    
    // Check if owner already exists
    const existingOwner = await prisma.user.findUnique({
      where: { email: 'owner@nuetprep.academy' }
    });

    if (existingOwner) {
      console.log('✅ Owner account already exists in Vercel database');
      return NextResponse.json({
        success: true,
        message: 'Owner account already exists in Vercel database',
        ownerId: existingOwner.id,
        ownerName: existingOwner.name,
        ownerRole: existingOwner.role
      });
    }

    // Create owner account in Vercel database
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

    console.log('✅ Owner account created in Vercel database');

    // Create sample courses in Vercel database
    const course1 = await prisma.course.create({
      data: {
        title: 'NUET Full Prep',
        description: '60,000 ₸ for 6 months. Math, Critical Thinking, English. Weekday online lessons for new topics. Saturday full sample test on the website; Sunday review with solutions and feedback.',
        price: 60000,
        duration: '6 months',
        creatorId: owner.id,
      }
    });

    const course2 = await prisma.course.create({
      data: {
        title: 'NUET Crash Course',
        description: '40,000 ₸ for 2 months. All topics, content, and problem sets with detailed solutions for self-prep, plus a full sample exam.',
        price: 40000,
        duration: '2 months',
        creatorId: owner.id,
      }
    });

    const course3 = await prisma.course.create({
      data: {
        title: '1-on-1 Private Tutoring',
        description: '80,000 ₸ per month. Daily 1-hour online sessions with the tutor focused on new topics.',
        price: 80000,
        duration: 'Monthly',
        creatorId: owner.id,
      }
    });

    console.log('✅ Sample courses created in Vercel database');

    return NextResponse.json({
      success: true,
      message: 'Vercel database seeded successfully!',
      ownerId: owner.id,
      ownerName: owner.name,
      ownerRole: owner.role,
      coursesCreated: [course1.title, course2.title, course3.title],
      note: 'Now try logging in with owner@nuetprep.academy / owner123'
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
