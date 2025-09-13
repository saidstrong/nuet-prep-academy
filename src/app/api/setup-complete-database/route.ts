import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !['OWNER', 'ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const results = [];

    // Create enum types first
    await prisma.$executeRaw`
      DO $$ BEGIN
        CREATE TYPE "UserRole" AS ENUM ('OWNER', 'ADMIN', 'TUTOR', 'STUDENT');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `;
    results.push('UserRole enum created');

    await prisma.$executeRaw`
      DO $$ BEGIN
        CREATE TYPE "CourseStatus" AS ENUM ('DRAFT', 'ACTIVE', 'INACTIVE', 'ARCHIVED');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `;
    results.push('CourseStatus enum created');

    await prisma.$executeRaw`
      DO $$ BEGIN
        CREATE TYPE "EnrollmentStatus" AS ENUM ('PENDING', 'ACTIVE', 'COMPLETED', 'CANCELLED');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `;
    results.push('EnrollmentStatus enum created');

    await prisma.$executeRaw`
      DO $$ BEGIN
        CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PAID', 'FAILED', 'REFUNDED');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `;
    results.push('PaymentStatus enum created');

    await prisma.$executeRaw`
      DO $$ BEGIN
        CREATE TYPE "PaymentMethod" AS ENUM ('KASPI', 'CARD', 'BANK_TRANSFER');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `;
    results.push('PaymentMethod enum created');

    await prisma.$executeRaw`
      DO $$ BEGIN
        CREATE TYPE "MaterialType" AS ENUM ('PDF', 'VIDEO', 'AUDIO', 'TEXT', 'IMAGE', 'LINK');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `;
    results.push('MaterialType enum created');

    await prisma.$executeRaw`
      DO $$ BEGIN
        CREATE TYPE "QuestionType" AS ENUM ('MULTIPLE_CHOICE', 'TRUE_FALSE', 'SHORT_ANSWER', 'ESSAY');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `;
    results.push('QuestionType enum created');

    await prisma.$executeRaw`
      DO $$ BEGIN
        CREATE TYPE "ChallengeType" AS ENUM ('INDIVIDUAL', 'TEAM', 'MIXED');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `;
    results.push('ChallengeType enum created');

    await prisma.$executeRaw`
      DO $$ BEGIN
        CREATE TYPE "EventType" AS ENUM ('SEASONAL', 'WEEKLY', 'DAILY', 'SPECIAL');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `;
    results.push('EventType enum created');

    await prisma.$executeRaw`
      DO $$ BEGIN
        CREATE TYPE "EventStatus" AS ENUM ('UPCOMING', 'ACTIVE', 'ENDED', 'CANCELLED');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `;
    results.push('EventStatus enum created');

    await prisma.$executeRaw`
      DO $$ BEGIN
        CREATE TYPE "ParticipationStatus" AS ENUM ('REGISTERED', 'ACTIVE', 'COMPLETED', 'DISQUALIFIED');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `;
    results.push('ParticipationStatus enum created');

    await prisma.$executeRaw`
      DO $$ BEGIN
        CREATE TYPE "LeaderboardCategory" AS ENUM ('POINTS', 'COURSE_COMPLETION', 'TEST_SCORES', 'STUDY_TIME', 'STREAK', 'SEASONAL', 'TEAM');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `;
    results.push('LeaderboardCategory enum created');

    await prisma.$executeRaw`
      DO $$ BEGIN
        CREATE TYPE "LeaderboardTimeFrame" AS ENUM ('DAILY', 'WEEKLY', 'MONTHLY', 'ALL_TIME', 'SEASONAL');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `;
    results.push('LeaderboardTimeFrame enum created');

    await prisma.$executeRaw`
      DO $$ BEGIN
        CREATE TYPE "PointTransactionType" AS ENUM ('EARNED', 'SPENT', 'BONUS', 'PENALTY');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `;
    results.push('PointTransactionType enum created');

    await prisma.$executeRaw`
      DO $$ BEGIN
        CREATE TYPE "PointTransactionCategory" AS ENUM ('COURSE_COMPLETION', 'TEST_PERFORMANCE', 'STUDY_TIME', 'STREAK_BONUS', 'BADGE_EARNED', 'SOCIAL_INTERACTION', 'SEASONAL_EVENT', 'TEAM_COMPETITION');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `;
    results.push('PointTransactionCategory enum created');

    await prisma.$executeRaw`
      DO $$ BEGIN
        CREATE TYPE "SocialInteractionType" AS ENUM ('ACHIEVEMENT_SHARE', 'BADGE_SHARE', 'INVITE_FRIEND', 'TEAM_INVITE', 'LEADERBOARD_SHARE');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `;
    results.push('SocialInteractionType enum created');

    await prisma.$executeRaw`
      DO $$ BEGIN
        CREATE TYPE "FriendConnectionStatus" AS ENUM ('PENDING', 'ACCEPTED', 'DECLINED', 'BLOCKED');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `;
    results.push('FriendConnectionStatus enum created');

    await prisma.$executeRaw`
      DO $$ BEGIN
        CREATE TYPE "TeamRole" AS ENUM ('LEADER', 'CO_LEADER', 'MEMBER');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `;
    results.push('TeamRole enum created');

    await prisma.$executeRaw`
      DO $$ BEGIN
        CREATE TYPE "TeamInvitationStatus" AS ENUM ('PENDING', 'ACCEPTED', 'DECLINED', 'EXPIRED');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `;
    results.push('TeamInvitationStatus enum created');

    // Create users table
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "users" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "name" TEXT,
        "email" TEXT NOT NULL UNIQUE,
        "password" TEXT,
        "role" "UserRole" NOT NULL DEFAULT 'STUDENT',
        "avatar" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL
      );
    `;
    results.push('users table created');

    // Create profiles table
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "profiles" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "userId" TEXT NOT NULL,
        "bio" TEXT,
        "phone" TEXT,
        "address" TEXT,
        "dateOfBirth" TIMESTAMP(3),
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
      );
    `;
    results.push('profiles table created');

    // Create courses table
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "courses" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "title" TEXT NOT NULL,
        "description" TEXT,
        "price" DECIMAL(10,2) NOT NULL DEFAULT 0,
        "tutorId" TEXT NOT NULL,
        "status" "CourseStatus" NOT NULL DEFAULT 'DRAFT',
        "isActive" BOOLEAN NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        FOREIGN KEY ("tutorId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
      );
    `;
    results.push('courses table created');

    // Create topics table
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "topics" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "title" TEXT NOT NULL,
        "description" TEXT,
        "courseId" TEXT NOT NULL,
        "order" INTEGER NOT NULL DEFAULT 0,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        FOREIGN KEY ("courseId") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE
      );
    `;
    results.push('topics table created');

    // Create materials table
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "materials" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "title" TEXT NOT NULL,
        "content" TEXT,
        "type" "MaterialType" NOT NULL DEFAULT 'TEXT',
        "topicId" TEXT NOT NULL,
        "order" INTEGER NOT NULL DEFAULT 0,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        FOREIGN KEY ("topicId") REFERENCES "topics"("id") ON DELETE CASCADE ON UPDATE CASCADE
      );
    `;
    results.push('materials table created');

    // Create tests table
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "tests" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "title" TEXT NOT NULL,
        "description" TEXT,
        "topicId" TEXT NOT NULL,
        "timeLimit" INTEGER,
        "maxAttempts" INTEGER DEFAULT 1,
        "isActive" BOOLEAN NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        FOREIGN KEY ("topicId") REFERENCES "topics"("id") ON DELETE CASCADE ON UPDATE CASCADE
      );
    `;
    results.push('tests table created');

    // Create questions table
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "questions" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "question" TEXT NOT NULL,
        "type" "QuestionType" NOT NULL DEFAULT 'MULTIPLE_CHOICE',
        "testId" TEXT NOT NULL,
        "order" INTEGER NOT NULL DEFAULT 0,
        "points" INTEGER NOT NULL DEFAULT 1,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        FOREIGN KEY ("testId") REFERENCES "tests"("id") ON DELETE CASCADE ON UPDATE CASCADE
      );
    `;
    results.push('questions table created');

    // Create question_options table
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "question_options" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "option" TEXT NOT NULL,
        "isCorrect" BOOLEAN NOT NULL DEFAULT false,
        "questionId" TEXT NOT NULL,
        "order" INTEGER NOT NULL DEFAULT 0,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        FOREIGN KEY ("questionId") REFERENCES "questions"("id") ON DELETE CASCADE ON UPDATE CASCADE
      );
    `;
    results.push('question_options table created');

    // Create course_enrollments table
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "course_enrollments" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "courseId" TEXT NOT NULL,
        "studentId" TEXT NOT NULL,
        "tutorId" TEXT NOT NULL,
        "status" "EnrollmentStatus" NOT NULL DEFAULT 'ACTIVE',
        "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
        "enrolledAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        FOREIGN KEY ("courseId") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE,
        FOREIGN KEY ("studentId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE,
        FOREIGN KEY ("tutorId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
      );
    `;
    results.push('course_enrollments table created');

    // Create payments table
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "payments" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "enrollmentId" TEXT NOT NULL,
        "studentId" TEXT NOT NULL,
        "courseId" TEXT NOT NULL,
        "amount" DECIMAL(10,2) NOT NULL,
        "paymentMethod" "PaymentMethod" NOT NULL,
        "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        FOREIGN KEY ("enrollmentId") REFERENCES "course_enrollments"("id") ON DELETE CASCADE ON UPDATE CASCADE,
        FOREIGN KEY ("studentId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE,
        FOREIGN KEY ("courseId") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE
      );
    `;
    results.push('payments table created');

    // Create manual_enrollment_requests table
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "manual_enrollment_requests" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "studentId" TEXT NOT NULL,
        "courseId" TEXT NOT NULL,
        "tutorId" TEXT NOT NULL,
        "fullName" TEXT NOT NULL,
        "phone" TEXT NOT NULL,
        "email" TEXT NOT NULL,
        "preferredContact" "PaymentMethod" NOT NULL,
        "message" TEXT,
        "status" "EnrollmentStatus" NOT NULL DEFAULT 'PENDING',
        "courseTitle" TEXT NOT NULL,
        "coursePrice" DECIMAL(10,2) NOT NULL,
        "tutorName" TEXT NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        FOREIGN KEY ("studentId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE,
        FOREIGN KEY ("courseId") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE,
        FOREIGN KEY ("tutorId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
      );
    `;
    results.push('manual_enrollment_requests table created');

    // Create material_progress table
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "material_progress" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "userId" TEXT NOT NULL,
        "materialId" TEXT NOT NULL,
        "completed" BOOLEAN NOT NULL DEFAULT false,
        "completedAt" TIMESTAMP(3),
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE,
        FOREIGN KEY ("materialId") REFERENCES "materials"("id") ON DELETE CASCADE ON UPDATE CASCADE
      );
    `;
    results.push('material_progress table created');

    // Create badges table
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "badges" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "name" TEXT NOT NULL,
        "description" TEXT,
        "icon" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL
      );
    `;
    results.push('badges table created');

    // Create user_badges table
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "user_badges" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "userId" TEXT NOT NULL,
        "badgeId" TEXT NOT NULL,
        "earnedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE,
        FOREIGN KEY ("badgeId") REFERENCES "badges"("id") ON DELETE CASCADE ON UPDATE CASCADE
      );
    `;
    results.push('user_badges table created');

    // Create achievements table
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "achievements" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "name" TEXT NOT NULL,
        "description" TEXT,
        "icon" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL
      );
    `;
    results.push('achievements table created');

    // Create user_achievements table
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "user_achievements" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "userId" TEXT NOT NULL,
        "achievementId" TEXT NOT NULL,
        "earnedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE,
        FOREIGN KEY ("achievementId") REFERENCES "achievements"("id") ON DELETE CASCADE ON UPDATE CASCADE
      );
    `;
    results.push('user_achievements table created');

    // Create user_points table
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "user_points" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "userId" TEXT NOT NULL,
        "points" INTEGER NOT NULL DEFAULT 0,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
      );
    `;
    results.push('user_points table created');

    // Create point_transactions table
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "point_transactions" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "userId" TEXT NOT NULL,
        "points" INTEGER NOT NULL,
        "type" TEXT NOT NULL,
        "description" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
      );
    `;
    results.push('point_transactions table created');

    // Create leaderboards table
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "leaderboards" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "name" TEXT NOT NULL,
        "type" TEXT NOT NULL,
        "isActive" BOOLEAN NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL
      );
    `;
    results.push('leaderboards table created');

    // Create leaderboard_entries table
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "leaderboard_entries" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "leaderboardId" TEXT NOT NULL,
        "userId" TEXT NOT NULL,
        "score" INTEGER NOT NULL DEFAULT 0,
        "rank" INTEGER,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        FOREIGN KEY ("leaderboardId") REFERENCES "leaderboards"("id") ON DELETE CASCADE ON UPDATE CASCADE,
        FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
      );
    `;
    results.push('leaderboard_entries table created');

    // Create events table
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "events" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "name" TEXT NOT NULL,
        "description" TEXT,
        "type" "EventType" NOT NULL,
        "startDate" TIMESTAMP(3) NOT NULL,
        "endDate" TIMESTAMP(3) NOT NULL,
        "status" "EventStatus" NOT NULL DEFAULT 'UPCOMING',
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL
      );
    `;
    results.push('events table created');

    // Create event_participations table
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "event_participations" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "eventId" TEXT NOT NULL,
        "userId" TEXT NOT NULL,
        "status" "ParticipationStatus" NOT NULL DEFAULT 'REGISTERED',
        "registeredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        FOREIGN KEY ("eventId") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE,
        FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
      );
    `;
    results.push('event_participations table created');

    // Create challenges table
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "challenges" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "name" TEXT NOT NULL,
        "description" TEXT NOT NULL,
        "type" "ChallengeType" NOT NULL,
        "startDate" TIMESTAMP(3) NOT NULL,
        "endDate" TIMESTAMP(3) NOT NULL,
        "rules" JSONB,
        "rewards" JSONB,
        "maxParticipants" INTEGER,
        "hasQuiz" BOOLEAN NOT NULL DEFAULT false,
        "quiz" JSONB,
        "isActive" BOOLEAN NOT NULL DEFAULT true,
        "eventId" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        FOREIGN KEY ("eventId") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE
      );
    `;
    results.push('challenges table created');

    // Create challenge_submissions table
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "challenge_submissions" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "userId" TEXT NOT NULL,
        "challengeId" TEXT NOT NULL,
        "content" TEXT NOT NULL,
        "score" INTEGER,
        "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE,
        FOREIGN KEY ("challengeId") REFERENCES "challenges"("id") ON DELETE CASCADE ON UPDATE CASCADE
      );
    `;
    results.push('challenge_submissions table created');

    // Create sample events
    try {
      const sampleEvents = [
        {
          id: 'sample-event-1',
          name: 'Spring Learning Challenge',
          description: 'A comprehensive learning challenge for the spring season',
          type: 'SEASONAL',
          startDate: new Date('2024-03-01'),
          endDate: new Date('2024-05-31'),
          status: 'ACTIVE'
        },
        {
          id: 'sample-event-2',
          name: 'Weekly Quiz Competition',
          description: 'Weekly quiz competitions for students',
          type: 'WEEKLY',
          startDate: new Date('2024-01-01'),
          endDate: new Date('2024-12-31'),
          status: 'ACTIVE'
        },
        {
          id: 'sample-event-3',
          name: 'Daily Study Streak',
          description: 'Daily study streak challenges',
          type: 'DAILY',
          startDate: new Date('2024-01-01'),
          endDate: new Date('2024-12-31'),
          status: 'ACTIVE'
        }
      ];

      for (const event of sampleEvents) {
        await prisma.$executeRaw`
          INSERT INTO "events" ("id", "name", "description", "type", "startDate", "endDate", "status", "createdAt", "updatedAt")
          VALUES (${event.id}, ${event.name}, ${event.description}, ${event.type}, ${event.startDate}, ${event.endDate}, ${event.status}, NOW(), NOW())
          ON CONFLICT ("id") DO NOTHING;
        `;
      }
      results.push('sample events created');
    } catch (error) {
      console.log('Sample events creation skipped (may already exist)');
    }

    return NextResponse.json({ 
      success: true, 
      message: `Complete database setup completed successfully!`,
      details: results
    });
  } catch (error: any) {
    console.error('Error setting up complete database:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to setup complete database' },
      { status: 500 }
    );
  }
}
