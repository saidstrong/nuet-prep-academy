import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET() {
  try {
    console.log('🔍 Fixing order column issue in questions table...');
    
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ 
        success: false, 
        error: 'Unauthorized - Admin access required' 
      }, { status: 401 });
    }

    // Lazy import to prevent build-time issues
    const { prisma } = await import('@/lib/prisma');
    
    console.log('🔍 Step 1: Checking if order column exists in questions table...');
    
    try {
      // Check if order column exists
      const result = await prisma.$queryRaw`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns 
        WHERE table_name = 'questions' 
        AND table_schema = 'public'
        AND column_name = 'order';
      `;
      
      console.log('📋 Order column check result:', result);
      
      if (result && (result as any[]).length > 0) {
        console.log('🔍 Step 2: Order column exists, checking if it has NOT NULL constraint...');
        
        const orderColumn = (result as any[])[0];
        console.log('📋 Order column details:', orderColumn);
        
        if (orderColumn.is_nullable === 'NO') {
          console.log('🔍 Step 3: Order column has NOT NULL constraint, making it nullable...');
          
          // Make the order column nullable
          await prisma.$executeRawUnsafe(
            `ALTER TABLE "public"."questions" ALTER COLUMN "order" DROP NOT NULL;`
          );
          
          console.log('✅ Successfully made order column nullable');
          
          return NextResponse.json({
            success: true,
            message: 'Successfully made order column nullable in questions table',
            action: 'Made order column nullable'
          });
        } else {
          console.log('✅ Order column is already nullable');
          
          return NextResponse.json({
            success: true,
            message: 'Order column is already nullable in questions table',
            action: 'No action needed'
          });
        }
      } else {
        console.log('✅ Order column does not exist in questions table');
        
        return NextResponse.json({
          success: true,
          message: 'Order column does not exist in questions table',
          action: 'No action needed'
        });
      }
      
    } catch (schemaError) {
      console.error('❌ Order column fix error:', schemaError);
      return NextResponse.json({
        success: false,
        error: 'Failed to fix order column',
        details: schemaError instanceof Error ? schemaError.message : 'Unknown error'
      });
    }

  } catch (error) {
    console.error('❌ Fix order column error:', error);
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
