import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Create users
  const hashedPassword = await bcrypt.hash('admin123', 12)
  const studentPassword = await bcrypt.hash('student123', 12)
  const managerPassword = await bcrypt.hash('manager123', 12)
  const tutorPassword = await bcrypt.hash('tutor123', 12)

  const admin = await prisma.user.upsert({
    where: { email: 'admin@nuetprep.academy' },
    update: {},
    create: {
      email: 'admin@nuetprep.academy',
      name: 'Admin User',
      password: hashedPassword,
      role: 'ADMIN',
    },
  })

  const manager1 = await prisma.user.upsert({
    where: { email: 'yeraltay@manager.com' },
    update: {},
    create: {
      email: 'yeraltay@manager.com',
      name: 'Yeraltay Manager',
      password: managerPassword,
      role: 'MANAGER',
    },
  })

  const manager2 = await prisma.user.upsert({
    where: { email: 'asylzada@manager.com' },
    update: {},
    create: {
      email: 'asylzada@manager.com',
      name: 'Asylzada Manager',
      password: managerPassword,
      role: 'MANAGER',
    },
  })

  const tutor = await prisma.user.upsert({
    where: { email: 'tutor@nuet.com' },
    update: {},
    create: {
      email: 'tutor@nuet.com',
      name: 'Tutor User',
      password: tutorPassword,
      role: 'TUTOR',
    },
  })

  const student = await prisma.user.upsert({
    where: { email: 'student@nuet.com' },
    update: {},
    create: {
      email: 'student@nuet.com',
      name: 'Student User',
      password: studentPassword,
      role: 'STUDENT',
    },
  })

  const antonStudent = await prisma.user.upsert({
    where: { email: 'anton.ivanova@gmail.com' },
    update: {},
    create: {
      email: 'anton.ivanova@gmail.com',
      name: 'Anton Ivanova',
      password: studentPassword,
      role: 'STUDENT',
    },
  })

  // Create additional tutors
  const tutor1 = await prisma.user.upsert({
    where: { email: 'tutor1@nuet.com' },
    update: {},
    create: {
      email: 'tutor1@nuet.com',
      name: 'Dr. Sarah Johnson',
      password: tutorPassword,
      role: 'TUTOR',
    },
  })

  const tutor2 = await prisma.user.upsert({
    where: { email: 'tutor2@nuet.com' },
    update: {},
    create: {
      email: 'tutor2@nuet.com',
      name: 'Prof. Michael Chen',
      password: tutorPassword,
      role: 'TUTOR',
    },
  })

  const tutor3 = await prisma.user.upsert({
    where: { email: 'tutor3@nuet.com' },
    update: {},
    create: {
      email: 'tutor3@nuet.com',
      name: 'Dr. Aisha Rahman',
      password: tutorPassword,
      role: 'TUTOR',
    },
  })

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
  })

  await prisma.profile.upsert({
    where: { userId: tutor2.id },
    update: {},
    create: {
      userId: tutor2.id,
      bio: 'Engineering Mathematics Expert',
      specialization: 'Calculus & Analysis',
      experience: '12+ years',
    },
  })

  await prisma.profile.upsert({
    where: { userId: tutor3.id },
    update: {},
    create: {
      userId: tutor3.id,
      bio: 'Statistics & Probability Specialist',
      specialization: 'Data Analysis',
      experience: '6+ years',
    },
  })

  console.log('✅ Users created:', { admin: admin.email, manager1: manager1.email, manager2: manager2.email, tutor: tutor.email, student: student.email, anton: antonStudent.email })

  // Create courses
  const course1 = await prisma.course.upsert({
    where: { id: 'course-1' },
    update: {},
    create: {
      id: 'course-1',
      title: 'NUET Mathematics Fundamentals',
      description: 'Master the essential mathematical concepts required for NUET success. This comprehensive course covers algebra, geometry, trigonometry, and calculus fundamentals.',
      price: 15000,
      duration: '8 weeks',
      status: 'ACTIVE',
      maxStudents: 50,
      instructor: 'Dr. Mathematics Expert',
      difficulty: 'Intermediate',
      estimatedHours: 120,
      creatorId: admin.id,
    },
  })

  const course2 = await prisma.course.upsert({
    where: { id: 'course-2' },
    update: {},
    create: {
      id: 'course-2',
      title: 'NUET Physics Mastery',
      description: 'Comprehensive physics course covering mechanics, thermodynamics, electromagnetism, and modern physics for NUET preparation.',
      price: 18000,
      duration: '10 weeks',
      status: 'ACTIVE',
      maxStudents: 40,
      instructor: 'Prof. Physics Specialist',
      difficulty: 'Advanced',
      estimatedHours: 150,
      creatorId: admin.id,
    },
  })

  const course3 = await prisma.course.upsert({
    where: { id: 'course-3' },
    update: {},
    create: {
      id: 'course-3',
      title: 'NUET Chemistry Essentials',
      description: 'Essential chemistry concepts including organic, inorganic, and physical chemistry for NUET success.',
      price: 16000,
      duration: '9 weeks',
      status: 'ACTIVE',
      maxStudents: 45,
      instructor: 'Dr. Chemistry Expert',
      difficulty: 'Intermediate',
      estimatedHours: 135,
      creatorId: admin.id,
    },
  })

  const course4 = await prisma.course.upsert({
    where: { id: 'course-4' },
    update: {},
    create: {
      id: 'course-4',
      title: 'NUET Biology Complete',
      description: 'Complete biology course covering cell biology, genetics, evolution, and ecology for NUET preparation.',
      price: 14000,
      duration: '7 weeks',
      status: 'ACTIVE',
      maxStudents: 60,
      instructor: 'Prof. Biology Specialist',
      difficulty: 'Intermediate',
      estimatedHours: 105,
      creatorId: admin.id,
    },
  })

  const course5 = await prisma.course.upsert({
    where: { id: 'course-5' },
    update: {},
    create: {
      id: 'course-5',
      title: 'NUET English Language',
      description: 'English language proficiency course focusing on reading comprehension, grammar, and writing skills for NUET.',
      price: 12000,
      duration: '6 weeks',
      status: 'ACTIVE',
      maxStudents: 80,
      instructor: 'Ms. English Expert',
      difficulty: 'Beginner',
      estimatedHours: 90,
      creatorId: admin.id,
    },
  })

  console.log('✅ Courses created:', { course1: course1.title, course2: course2.title, course3: course3.title, course4: course4.title, course5: course5.title })

  // Create topics for course 1
  const topic1 = await prisma.topic.create({
    data: {
      title: 'Algebra Fundamentals',
      description: 'Basic algebraic concepts and operations',
      order: 1,
      courseId: course1.id,
    },
  })

  const topic2 = await prisma.topic.create({
    data: {
      title: 'Geometry Basics',
      description: 'Introduction to geometric shapes and properties',
      order: 2,
      courseId: course1.id,
    },
  })

  // Create materials for topics
  await prisma.material.create({
    data: {
      title: 'Algebra Introduction Video',
      description: 'Introduction to algebraic concepts',
      type: 'VIDEO',
      url: '/uploads/algebra-intro.mp4',
      order: 1,
      topicId: topic1.id,
      isPublished: true,
    },
  })

  await prisma.material.create({
    data: {
      title: 'Algebra Practice Problems',
      description: 'Practice problems for algebra fundamentals',
      type: 'PDF',
      url: '/uploads/algebra-practice.pdf',
      order: 2,
      topicId: topic1.id,
      isPublished: true,
    },
  })

  // Create enrollment for student
  await prisma.courseEnrollment.create({
    data: {
      courseId: course1.id,
      studentId: student.id,
      tutorId: tutor.id,
      status: 'ACTIVE',
      paymentStatus: 'PAID',
      paymentMethod: 'CARD',
    },
  })

  await prisma.courseEnrollment.create({
    data: {
      courseId: course2.id,
      studentId: antonStudent.id,
      tutorId: tutor.id,
      status: 'ACTIVE',
      paymentStatus: 'PAID',
      paymentMethod: 'CARD',
    },
  })

  console.log('✅ Database seeded successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })