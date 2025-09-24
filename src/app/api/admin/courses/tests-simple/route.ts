import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    console.log('🔍 Admin tests API (simple version) called');
    
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

    // Fetch tests with minimal includes
    console.log('🔍 Fetching tests...');
    const tests = await prisma.test.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log(`✅ Fetched ${tests.length} tests`);

    return NextResponse.json({
      success: true,
      tests: tests
    });

  } catch (error: any) {
    console.error('❌ Unexpected error in admin tests API:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch tests',
        details: error.message,
        code: error.code
      },
      { status: 500 }
    );
  }
}
