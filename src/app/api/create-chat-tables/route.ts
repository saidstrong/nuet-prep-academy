import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    console.log('🔧 Creating chat tables and enums...');

    // Create ChatType enum
    await prisma.$executeRaw`
      DO $$ BEGIN
        CREATE TYPE "ChatType" AS ENUM ('DIRECT', 'GROUP', 'COURSE');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `;

    // Create MessageType enum
    await prisma.$executeRaw`
      DO $$ BEGIN
        CREATE TYPE "MessageType" AS ENUM ('TEXT', 'IMAGE', 'FILE', 'SYSTEM');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `;

    // Create chats table
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "chats" (
        "id" TEXT NOT NULL,
        "name" TEXT,
        "type" "ChatType" NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        "courseId" TEXT,
        CONSTRAINT "chats_pkey" PRIMARY KEY ("id")
      );
    `;

    // Create chat_participants table
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "chat_participants" (
        "id" TEXT NOT NULL,
        "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "leftAt" TIMESTAMP(3),
        "isAdmin" BOOLEAN NOT NULL DEFAULT false,
        "chatId" TEXT NOT NULL,
        "userId" TEXT NOT NULL,
        CONSTRAINT "chat_participants_pkey" PRIMARY KEY ("id")
      );
    `;

    // Create messages table
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "messages" (
        "id" TEXT NOT NULL,
        "content" TEXT NOT NULL,
        "type" "MessageType" NOT NULL DEFAULT 'TEXT',
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        "chatId" TEXT NOT NULL,
        "senderId" TEXT NOT NULL,
        CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
      );
    `;

    // Add foreign key constraints
    await prisma.$executeRaw`
      DO $$ BEGIN
        ALTER TABLE "chats" ADD CONSTRAINT "chats_courseId_fkey" 
        FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE SET NULL ON UPDATE CASCADE;
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `;

    await prisma.$executeRaw`
      DO $$ BEGIN
        ALTER TABLE "chat_participants" ADD CONSTRAINT "chat_participants_chatId_fkey" 
        FOREIGN KEY ("chatId") REFERENCES "chats"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `;

    await prisma.$executeRaw`
      DO $$ BEGIN
        ALTER TABLE "chat_participants" ADD CONSTRAINT "chat_participants_userId_fkey" 
        FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `;

    await prisma.$executeRaw`
      DO $$ BEGIN
        ALTER TABLE "messages" ADD CONSTRAINT "messages_chatId_fkey" 
        FOREIGN KEY ("chatId") REFERENCES "chats"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `;

    await prisma.$executeRaw`
      DO $$ BEGIN
        ALTER TABLE "messages" ADD CONSTRAINT "messages_senderId_fkey" 
        FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `;

    console.log('✅ Chat tables and enums created successfully');

    return NextResponse.json({
      success: true,
      message: 'Chat tables and enums created successfully'
    });

  } catch (error: any) {
    console.error('❌ Error creating chat tables:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to create chat tables',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
