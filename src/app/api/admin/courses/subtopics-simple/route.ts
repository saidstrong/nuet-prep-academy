import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    console.log('🔍 Admin subtopics API (simple version) called');
    
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

    // Test database connection first
    try {
      await prisma.$connect();
      console.log('✅ Database connected successfully');
    } catch (dbError: any) {
      console.error('❌ Database connection failed:', dbError);
      return NextResponse.json(
        { 
          error: 'Database connection failed',
          details: dbError.message,
          code: dbError.code
        },
        { status: 500 }
      );
    }

    // Fetch subtopics with minimal includes
    console.log('🔍 Fetching subtopics...');
    const subtopics = await prisma.subtopic.findMany({
      orderBy: {
        order: 'asc'
      }
    });

    console.log(`✅ Fetched ${subtopics.length} subtopics`);

    return NextResponse.json({
      success: true,
      subtopics: subtopics
    });

  } catch (error: any) {
    console.error('❌ Unexpected error in admin subtopics API:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch subtopics',
        details: error.message,
        code: error.code
      },
      { status: 500 }
    );
  }
}
