import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET() {
  try {
    console.log('🔍 Fixing testId column issue in questions table...');
    
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ 
        success: false, 
        error: 'Unauthorized - Admin access required' 
      }, { status: 401 });
    }

    // Lazy import to prevent build-time issues
    const { prisma } = await import('@/lib/prisma');
    
    console.log('🔍 Step 1: Checking if testId column exists in questions table...');
    
    try {
      // Check if testId column exists
      const result = await prisma.$queryRaw`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns 
        WHERE table_name = 'questions' 
        AND table_schema = 'public'
        AND column_name = 'testId';
      `;
      
      console.log('📋 TestId column check result:', result);
      
      if (result && (result as any[]).length > 0) {
        console.log('🔍 Step 2: testId column exists, removing it since it\'s not in the Prisma schema...');
        
        // Drop the testId column since it's not in the Prisma schema
        await prisma.$executeRawUnsafe(
          `ALTER TABLE "public"."questions" DROP COLUMN IF EXISTS "testId";`
        );
        
        console.log('✅ Successfully removed testId column');
        
        return NextResponse.json({
          success: true,
          message: 'Successfully removed testId column from questions table',
          action: 'Removed testId column'
        });
      } else {
        console.log('✅ testId column does not exist in questions table');
        
        return NextResponse.json({
          success: true,
          message: 'testId column does not exist in questions table',
          action: 'No action needed'
        });
      }
      
    } catch (schemaError) {
      console.error('❌ testId column fix error:', schemaError);
      return NextResponse.json({
        success: false,
        error: 'Failed to fix testId column',
        details: schemaError instanceof Error ? schemaError.message : 'Unknown error'
      });
    }

  } catch (error) {
    console.error('❌ Fix testId column error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Fix failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
