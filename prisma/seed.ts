import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Hash password for admin user
  const hashedPassword = await bcrypt.hash('admin123', 12);

  // Create admin user
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@nuetprep.academy' },
    update: {},
    create: {
              email: 'admin@nuetprep.academy',
      name: 'Said Amanzhol',
      password: hashedPassword,
      role: 'ADMIN',
    },
  });

  console.log('✅ Admin user created:', adminUser.email);

  // Create admin profile
  await prisma.profile.upsert({
    where: { userId: adminUser.id },
    update: {},
    create: {
      userId: adminUser.id,
      bio: 'Founder and admin of NUET Prep Academy',
      phone: '+77075214911',
      whatsapp: '+77075214911',
      experience: '5+ years in education',
    },
  });

  console.log('✅ Admin profile created');

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
      status: 'ACTIVE',
      maxStudents: 30,
      creatorId: adminUser.id,
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
      status: 'ACTIVE',
      maxStudents: 25,
      creatorId: adminUser.id,
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
      status: 'ACTIVE',
      maxStudents: 1,
      creatorId: adminUser.id,
    },
  });

  console.log('✅ Sample courses created:', [course1.title, course2.title, course3.title].join(', '));

  // Create sample topics for course 1
  const topic1 = await prisma.topic.upsert({
    where: { id: 'topic-1' },
    update: {},
    create: {
      id: 'topic-1',
      title: 'Mathematics Fundamentals',
      description: 'Core mathematical concepts and problem-solving techniques',
      order: 1,
      courseId: course1.id,
    },
  });

  const topic2 = await prisma.topic.upsert({
    where: { id: 'topic-2' },
    update: {},
    create: {
      id: 'topic-2',
      title: 'Critical Thinking',
      description: 'Logical reasoning and analytical skills development',
      order: 2,
      courseId: course1.id,
    },
  });

  console.log('✅ Sample topics created');

  console.log('🎉 Database seeding completed successfully!');
  console.log('👤 Admin account created:');
  console.log(`   Email: admin@nuetprep.academy`);
  console.log(`   Password: admin123`);
  console.log(`   Role: ${adminUser.role}`);
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
