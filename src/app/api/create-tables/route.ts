import { NextResponse } from 'next/server';

export async function GET() {
  try {
    console.log('🏗️ Creating database tables manually...');
    
    // Lazy import to prevent build-time issues
    const { prisma } = await import('@/lib/prisma');
    
    try {
      // Connect to database
      await prisma.$connect();
      console.log('✅ Connected to Vercel database');
      
      // Create tables manually using raw SQL
      // This bypasses the need for prisma db push
      
      // Create users table
      await prisma.$executeRaw`
        CREATE TABLE IF NOT EXISTS users (
          id TEXT PRIMARY KEY,
          email TEXT UNIQUE NOT NULL,
          password TEXT NOT NULL,
          name TEXT NOT NULL,
          role TEXT NOT NULL DEFAULT 'STUDENT',
          bio TEXT,
          phone TEXT,
          avatar TEXT,
          "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `;
      console.log('✅ Users table created');
      
      // Create profiles table
      await prisma.$executeRaw`
        CREATE TABLE IF NOT EXISTS profiles (
          id TEXT PRIMARY KEY,
          "userId" TEXT UNIQUE NOT NULL,
          bio TEXT,
          phone TEXT,
          avatar TEXT,
          address TEXT,
          education TEXT,
          experience TEXT,
          "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY ("userId") REFERENCES users(id) ON DELETE CASCADE
        )
      `;
      console.log('✅ Profiles table created');
      
      // Create courses table
      await prisma.$executeRaw`
        CREATE TABLE IF NOT EXISTS courses (
          id TEXT PRIMARY KEY,
          title TEXT NOT NULL,
          description TEXT NOT NULL,
          price DOUBLE PRECISION NOT NULL,
          duration TEXT NOT NULL,
          status TEXT NOT NULL DEFAULT 'ACTIVE',
          "creatorId" TEXT NOT NULL,
          "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY ("creatorId") REFERENCES users(id)
        )
      `;
      console.log('✅ Courses table created');
      
      // Create course_enrollments table
      await prisma.$executeRaw`
        CREATE TABLE IF NOT EXISTS course_enrollments (
          id TEXT PRIMARY KEY,
          "courseId" TEXT NOT NULL,
          "studentId" TEXT NOT NULL,
          "tutorId" TEXT NOT NULL,
          "enrolledAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          status TEXT NOT NULL DEFAULT 'ACTIVE',
          FOREIGN KEY ("courseId") REFERENCES courses(id) ON DELETE CASCADE,
          FOREIGN KEY ("studentId") REFERENCES users(id) ON DELETE CASCADE,
          FOREIGN KEY ("tutorId") REFERENCES users(id) ON DELETE CASCADE,
          UNIQUE("courseId", "studentId")
        )
      `;
      console.log('✅ Course enrollments table created');

      // Create topics table
      await prisma.$executeRaw`
        CREATE TABLE IF NOT EXISTS topics (
          id TEXT PRIMARY KEY,
          title TEXT NOT NULL,
          description TEXT,
          "order" INTEGER NOT NULL,
          "courseId" TEXT NOT NULL,
          "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY ("courseId") REFERENCES courses(id) ON DELETE CASCADE
        )
      `;
      console.log('✅ Topics table created');

      // Create materials table
      await prisma.$executeRaw`
        CREATE TABLE IF NOT EXISTS materials (
          id TEXT PRIMARY KEY,
          title TEXT NOT NULL,
          description TEXT,
          type TEXT NOT NULL,
          url TEXT,
          content TEXT,
          "order" INTEGER NOT NULL,
          "topicId" TEXT NOT NULL,
          "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY ("topicId") REFERENCES topics(id) ON DELETE CASCADE
        )
      `;
      console.log('✅ Materials table created');

      // Create tests table
      await prisma.$executeRaw`
        CREATE TABLE IF NOT EXISTS tests (
          id TEXT PRIMARY KEY,
          title TEXT NOT NULL,
          description TEXT,
          duration INTEGER NOT NULL,
          "totalPoints" INTEGER NOT NULL,
          "isActive" BOOLEAN DEFAULT true,
          "topicId" TEXT NOT NULL,
          "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY ("topicId") REFERENCES topics(id) ON DELETE CASCADE
        )
      `;
      console.log('✅ Tests table created');

      // Create questions table
      await prisma.$executeRaw`
        CREATE TABLE IF NOT EXISTS questions (
          id TEXT PRIMARY KEY,
          text TEXT NOT NULL,
          type TEXT DEFAULT 'MULTIPLE_CHOICE',
          "order" INTEGER NOT NULL,
          "testId" TEXT NOT NULL,
          "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY ("testId") REFERENCES tests(id) ON DELETE CASCADE
        )
      `;
      console.log('✅ Questions table created');

      // Create question_options table
      await prisma.$executeRaw`
        CREATE TABLE IF NOT EXISTS question_options (
          id TEXT PRIMARY KEY,
          text TEXT NOT NULL,
          "isCorrect" BOOLEAN DEFAULT false,
          "order" INTEGER NOT NULL,
          "questionId" TEXT NOT NULL,
          "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY ("questionId") REFERENCES questions(id) ON DELETE CASCADE
        )
      `;
      console.log('✅ Question options table created');

      // Create payments table
      await prisma.$executeRaw`
        CREATE TABLE IF NOT EXISTS payments (
          id TEXT PRIMARY KEY,
          amount DOUBLE PRECISION NOT NULL,
          method TEXT NOT NULL,
          status TEXT DEFAULT 'PENDING',
          "enrollmentId" TEXT NOT NULL,
          "studentId" TEXT NOT NULL,
          "courseId" TEXT NOT NULL,
          "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY ("enrollmentId") REFERENCES course_enrollments(id) ON DELETE CASCADE,
          FOREIGN KEY ("studentId") REFERENCES users(id) ON DELETE CASCADE,
          FOREIGN KEY ("courseId") REFERENCES courses(id) ON DELETE CASCADE
        )
      `;
      console.log('✅ Payments table created');

      // Create chats table
      await prisma.$executeRaw`
        CREATE TABLE IF NOT EXISTS chats (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          type TEXT NOT NULL,
          "courseId" TEXT,
          "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY ("courseId") REFERENCES courses(id) ON DELETE SET NULL
        )
      `;
      console.log('✅ Chats table created');

      // Create chat_participants table
      await prisma.$executeRaw`
        CREATE TABLE IF NOT EXISTS chat_participants (
          id TEXT PRIMARY KEY,
          "joinedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          "leftAt" TIMESTAMP,
          "chatId" TEXT NOT NULL,
          "userId" TEXT NOT NULL,
          FOREIGN KEY ("chatId") REFERENCES chats(id) ON DELETE CASCADE,
          FOREIGN KEY ("userId") REFERENCES users(id) ON DELETE CASCADE
        )
      `;
      console.log('✅ Chat participants table created');

      // Create messages table
      await prisma.$executeRaw`
        CREATE TABLE IF NOT EXISTS messages (
          id TEXT PRIMARY KEY,
          content TEXT NOT NULL,
          type TEXT DEFAULT 'TEXT',
          "chatId" TEXT NOT NULL,
          "senderId" TEXT NOT NULL,
          "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY ("chatId") REFERENCES chats(id) ON DELETE CASCADE,
          FOREIGN KEY ("senderId") REFERENCES users(id) ON DELETE CASCADE
        )
      `;
      console.log('✅ Messages table created');

      // Create test_submissions table
      await prisma.$executeRaw`
        CREATE TABLE IF NOT EXISTS test_submissions (
          id TEXT PRIMARY KEY,
          answers JSONB NOT NULL,
          score INTEGER NOT NULL,
          "maxScore" INTEGER NOT NULL,
          "timeSpent" INTEGER NOT NULL,
          status TEXT NOT NULL,
          "submittedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          "testId" TEXT NOT NULL,
          "studentId" TEXT NOT NULL,
          FOREIGN KEY ("testId") REFERENCES tests(id) ON DELETE CASCADE,
          FOREIGN KEY ("studentId") REFERENCES users(id) ON DELETE CASCADE
        )
      `;
      console.log('✅ Test submissions table created');
      
      return NextResponse.json({
        success: true,
        message: 'All database tables created successfully!',
        tablesCreated: [
          'users', 'profiles', 'courses', 'course_enrollments', 
          'topics', 'materials', 'tests', 'questions', 'question_options',
          'payments', 'chats', 'chat_participants', 'messages', 'test_submissions'
        ],
        timestamp: new Date().toISOString(),
        note: 'Now you can seed the database with data'
      });
      
    } catch (tableError: any) {
      console.error('❌ Table creation failed:', tableError);
      
      return NextResponse.json({
        success: false,
        message: 'Table creation failed',
        error: tableError.message,
        timestamp: new Date().toISOString(),
        note: 'Check if you have permission to create tables in this database'
      });
    }
    
  } catch (error) {
    console.error('❌ Table creation endpoint failed:', error);
    return NextResponse.json({
      success: false,
      message: 'Table creation endpoint failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  } finally {
    try {
      const { prisma } = await import('@/lib/prisma');
      await prisma.$disconnect();
    } catch (e) {
      // Ignore disconnect errors
    }
  }
}
