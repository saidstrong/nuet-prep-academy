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

    // First, check if the challenges table exists
    const tableExists = await prisma.$queryRaw`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'challenges'
      );
    `;

    if (!tableExists || !(tableExists as any[])[0]?.exists) {
      return NextResponse.json({ 
        error: 'Challenges table does not exist. Please run the main database migration first.' 
      }, { status: 400 });
    }

    // Check if columns already exist
    const hasQuizExists = await prisma.$queryRaw`
      SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'challenges' 
        AND column_name = 'hasQuiz'
      );
    `;

    const quizExists = await prisma.$queryRaw`
      SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'challenges' 
        AND column_name = 'quiz'
      );
    `;

    const results = [];

    // Add hasQuiz column if it doesn't exist
    if (!(hasQuizExists as any[])[0]?.exists) {
      await prisma.$executeRaw`
        ALTER TABLE challenges 
        ADD COLUMN "hasQuiz" BOOLEAN DEFAULT false;
      `;
      results.push('hasQuiz column added');
    } else {
      results.push('hasQuiz column already exists');
    }

    // Add quiz column if it doesn't exist
    if (!(quizExists as any[])[0]?.exists) {
      await prisma.$executeRaw`
        ALTER TABLE challenges 
        ADD COLUMN "quiz" JSONB;
      `;
      results.push('quiz column added');
    } else {
      results.push('quiz column already exists');
    }

    return NextResponse.json({ 
      success: true, 
      message: `Migration completed: ${results.join(', ')}` 
    });
  } catch (error: any) {
    console.error('Error adding quiz fields:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to add quiz fields' },
      { status: 500 }
    );
  }
}
