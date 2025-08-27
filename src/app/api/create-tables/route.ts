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
      
      return NextResponse.json({
        success: true,
        message: 'All database tables created successfully!',
        tablesCreated: ['users', 'profiles', 'courses', 'course_enrollments'],
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
