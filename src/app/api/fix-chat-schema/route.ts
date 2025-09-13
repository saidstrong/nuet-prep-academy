import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    console.log('🔧 Fixing chat schema...');

    // Add isAdmin column to chat_participants table
    await prisma.$executeRaw`
      ALTER TABLE chat_participants 
      ADD COLUMN IF NOT EXISTS "isAdmin" BOOLEAN DEFAULT false;
    `;

    // Make name column nullable in chats table
    await prisma.$executeRaw`
      ALTER TABLE chats 
      ALTER COLUMN name DROP NOT NULL;
    `;

    console.log('✅ Chat schema fixed successfully');

    return NextResponse.json({
      success: true,
      message: 'Chat schema fixed successfully'
    });

  } catch (error: any) {
    console.error('❌ Error fixing chat schema:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fix chat schema',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

export async function POST() {
  try {
    console.log('🔧 Fixing chat schema...');

    // Add isAdmin column to chat_participants table
    await prisma.$executeRaw`
      ALTER TABLE chat_participants 
      ADD COLUMN IF NOT EXISTS "isAdmin" BOOLEAN DEFAULT false;
    `;

    // Make name column nullable in chats table
    await prisma.$executeRaw`
      ALTER TABLE chats 
      ALTER COLUMN name DROP NOT NULL;
    `;

    console.log('✅ Chat schema fixed successfully');

    return NextResponse.json({
      success: true,
      message: 'Chat schema fixed successfully'
    });

  } catch (error: any) {
    console.error('❌ Error fixing chat schema:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fix chat schema',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
