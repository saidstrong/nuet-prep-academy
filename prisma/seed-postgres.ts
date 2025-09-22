import { PrismaClient, UserRole, CourseLevel, CourseStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting PostgreSQL database seed...');

  const hashedPassword = await bcrypt.hash('admin123', 10);
  const managerHashedPassword = await bcrypt.hash('manager123', 10);
  const tutorHashedPassword = await bcrypt.hash('tutor123', 10);
  const studentHashedPassword = await bcrypt.hash('student123', 10);

  // Create admin user
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@nuetprep.academy' },
    update: {},
    create: {
      email: 'admin@nuetprep.academy',
      name: 'Admin User',
      password: hashedPassword,
      role: UserRole.ADMIN,
    },
  });

  // Create manager users
  const manager1 = await prisma.user.upsert({
    where: { email: 'yeraltay@manager.com' },
    update: {},
    create: {
      email: 'yeraltay@manager.com',
      name: 'Yeraltay Manager',
      password: managerHashedPassword,
      role: UserRole.MANAGER,
    },
  });

  const manager2 = await prisma.user.upsert({
    where: { email: 'asylzada@manager.com' },
    update: {},
    create: {
      email: 'asylzada@manager.com',
      name: 'Asylzada Manager',
      password: managerHashedPassword,
      role: UserRole.MANAGER,
    },
  });

  // Create tutors
  const tutor1 = await prisma.user.upsert({
    where: { email: 'tutor1@nuet.com' },
    update: {},
    create: {
      email: 'tutor1@nuet.com',
      name: 'Dr. Sarah Johnson',
      password: tutorHashedPassword,
      role: UserRole.TUTOR,
    },
  });

  const tutor2 = await prisma.user.upsert({
    where: { email: 'tutor2@nuet.com' },
    update: {},
    create: {
      email: 'tutor2@nuet.com',
      name: 'Prof. Michael Chen',
      password: tutorHashedPassword,
      role: UserRole.TUTOR,
    },
  });

  const tutor3 = await prisma.user.upsert({
    where: { email: 'tutor3@nuet.com' },
    update: {},
    create: {
      email: 'tutor3@nuet.com',
      name: 'Dr. Aisha Rahman',
      password: tutorHashedPassword,
      role: UserRole.TUTOR,
    },
  });

  // Create student
  const student1 = await prisma.user.upsert({
    where: { email: 'anton.ivanova@gmail.com' },
    update: {},
    create: {
      email: 'anton.ivanova@gmail.com',
      name: 'Anton Ivanova',
      password: studentHashedPassword,
      role: UserRole.STUDENT,
    },
  });

  // Create profiles for tutors
  await prisma.profile.upsert({
    where: { userId: tutor1.id },
    update: {},
    create: {
      userId: tutor1.id,
      bio: 'Mathematics & Physics Specialist',
      specialization: 'Advanced Mathematics',
      experience: '8+ years',
    },
  });

  await prisma.profile.upsert({
    where: { userId: tutor2.id },
    update: {},
    create: {
      userId: tutor2.id,
      bio: 'Engineering Mathematics Expert',
      specialization: 'Calculus & Analysis',
      experience: '12+ years',
    },
  });

  await prisma.profile.upsert({
    where: { userId: tutor3.id },
    update: {},
    create: {
      userId: tutor3.id,
      bio: 'Statistics & Probability Specialist',
      specialization: 'Data Analysis',
      experience: '6+ years',
    },
  });

  // Create sample courses
  const course1 = await prisma.course.upsert({
    where: { id: 'course-1' },
    update: {},
    create: {
      id: 'course-1',
      title: 'Advanced Mathematics',
      description: 'Comprehensive course covering calculus, algebra, and geometry',
      price: 15000,
      duration: '12 weeks',
      status: CourseStatus.ACTIVE,
      maxStudents: 30,
      instructor: 'Dr. Sarah Johnson',
      difficulty: CourseLevel.ADVANCED,
      estimatedHours: 120,
      creatorId: adminUser.id,
    },
  });

  const course2 = await prisma.course.upsert({
    where: { id: 'course-2' },
    update: {},
    create: {
      id: 'course-2',
      title: 'Engineering Mathematics',
      description: 'Essential mathematics for engineering students',
      price: 12000,
      duration: '10 weeks',
      status: CourseStatus.ACTIVE,
      maxStudents: 25,
      instructor: 'Prof. Michael Chen',
      difficulty: CourseLevel.INTERMEDIATE,
      estimatedHours: 100,
      creatorId: adminUser.id,
    },
  });

  // Create a sample chat
  const chat = await prisma.chat.upsert({
    where: { id: '1' },
    update: {},
    create: {
      id: '1',
      name: 'General Discussion',
      type: 'GROUP',
    },
  });

  // Add participants to chat
  await prisma.chatParticipant.upsert({
    where: { 
      chatId_userId: {
        chatId: chat.id,
        userId: adminUser.id
      }
    },
    update: {},
    create: {
      chatId: chat.id,
      userId: adminUser.id,
      isAdmin: true,
    },
  });

  await prisma.chatParticipant.upsert({
    where: { 
      chatId_userId: {
        chatId: chat.id,
        userId: student1.id
      }
    },
    update: {},
    create: {
      chatId: chat.id,
      userId: student1.id,
      isAdmin: false,
    },
  });

  // Create sample messages
  const message1 = await prisma.message.create({
    data: {
      chatId: chat.id,
      senderId: adminUser.id,
      content: 'Welcome to the NUET Prep Academy chat!',
      type: 'TEXT',
    },
  });

  const message2 = await prisma.message.create({
    data: {
      chatId: chat.id,
      senderId: student1.id,
      content: 'Hello! Excited to be here.',
      type: 'TEXT',
    },
  });

  console.log('✅ PostgreSQL database seeded successfully!');
  console.log('👥 Created users:', { adminUser, manager1, manager2, tutor1, tutor2, tutor3, student1 });
  console.log('📚 Created courses:', { course1, course2 });
  console.log('💬 Created chat:', { chat, message1, message2 });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
