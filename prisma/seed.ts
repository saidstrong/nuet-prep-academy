import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create owner account
  const hashedPassword = await bcrypt.hash('owner123', 12);
  
  const owner = await prisma.user.upsert({
    where: { email: 'owner@nuetprep.academy' },
    update: {},
    create: {
      email: 'owner@nuetprep.academy',
      name: 'Said Amanzhol',
      password: hashedPassword,
      role: 'OWNER',
    },
  });

  // Create owner profile
  await prisma.profile.upsert({
    where: { userId: owner.id },
    update: {},
    create: {
      userId: owner.id,
      bio: 'Founder and owner of NUET Prep Academy',
      phone: '+77075214911',
      address: 'Astana, Kabanbay Batyr avenue, 53. Nazarbayev University',
    },
  });

  // Create sample courses
  const course1 = await prisma.course.upsert({
    where: { id: 'course-1' },
    update: {},
    create: {
      id: 'course-1',
      title: 'NUET Full Prep',
      description: '60,000 ₸ for 6 months. Math, Critical Thinking, English. Weekday online lessons for new topics. Saturday full sample test on the website; Sunday review with solutions and feedback.',
      price: 60000,
      duration: '6 months',
      creatorId: owner.id,
    },
  });

  const course2 = await prisma.course.upsert({
    where: { id: 'course-2' },
    update: {},
    create: {
      id: 'course-2',
      title: 'NUET Crash Course',
      description: '40,000 ₸ for 2 months. All topics, content, and problem sets with detailed solutions for self-prep, plus a full sample exam.',
      price: 40000,
      duration: '2 months',
      creatorId: owner.id,
    },
  });

  const course3 = await prisma.course.upsert({
    where: { id: 'course-3' },
    update: {},
    create: {
      id: 'course-3',
      title: '1-on-1 Private Tutoring',
      description: '80,000 ₸ per month. Daily 1-hour online sessions with the tutor focused on new topics.',
      price: 80000,
      duration: 'Monthly',
      creatorId: owner.id,
    },
  });

  console.log('✅ Database seeded successfully!');
  console.log('👤 Owner account created:');
  console.log(`   Email: owner@nuetprep.academy`);
  console.log(`   Password: owner123`);
  console.log(`   Role: ${owner.role}`);
  console.log('📚 Sample courses created:', [course1.title, course2.title, course3.title].join(', '));
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
