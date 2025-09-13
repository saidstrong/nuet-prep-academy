import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET() {
  try {
    console.log('🔍 Fixing Question table schema...');
    
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ 
        success: false, 
        error: 'Unauthorized - Admin access required' 
      }, { status: 401 });
    }

    // Lazy import to prevent build-time issues
    const { prisma } = await import('@/lib/prisma');
    
    console.log('🔍 Step 1: Checking current Question table structure...');
    
    // Check if difficulty column exists
    try {
      const result = await prisma.$queryRaw`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns 
        WHERE table_name = 'questions' 
        AND table_schema = 'public'
        ORDER BY ordinal_position;
      `;
      
      console.log('📋 Current Question table columns:', result);
      
             // Check which columns are missing
       const columns = result as any[];
       const columnNames = columns.map(col => col.column_name);
       
       const requiredColumns = [
         { name: 'difficulty', type: 'TEXT', default: "'MEDIUM'" },
         { name: 'points', type: 'INTEGER', default: '1' },
         { name: 'correctAnswer', type: 'TEXT', default: 'NULL' },
         { name: 'explanation', type: 'TEXT', default: 'NULL' },
         { name: 'topicId', type: 'TEXT', default: 'NULL' }
       ];
       
       const missingColumns = requiredColumns.filter(col => !columnNames.includes(col.name));
       
       if (missingColumns.length === 0) {
         return NextResponse.json({
           success: true,
           message: 'Question table already has all required columns',
           columns: columnNames
         });
       }
       
       console.log('🔍 Step 2: Adding missing columns...', missingColumns.map(c => c.name));
       
       // Add all missing columns
       for (const col of missingColumns) {
         await prisma.$executeRawUnsafe(
           `ALTER TABLE "public"."questions" ADD COLUMN "${col.name}" ${col.type} DEFAULT ${col.default};`
         );
         console.log(`✅ Successfully added ${col.name} column`);
       }
      
      // Verify the column was added
      const updatedResult = await prisma.$queryRaw`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns 
        WHERE table_name = 'questions' 
        AND table_schema = 'public'
        ORDER BY ordinal_position;
      `;
      
      console.log('📋 Updated Question table columns:', updatedResult);
      
             return NextResponse.json({
         success: true,
         message: `Successfully added ${missingColumns.length} missing columns to Question table: ${missingColumns.map(c => c.name).join(', ')}`,
         columns: (updatedResult as any[]).map(col => col.column_name),
         addedColumns: missingColumns.map(c => c.name)
       });
      
    } catch (schemaError) {
      console.error('❌ Schema fix error:', schemaError);
      return NextResponse.json({
        success: false,
        error: 'Failed to fix Question schema',
        details: schemaError instanceof Error ? schemaError.message : 'Unknown error'
      });
    }

  } catch (error) {
    console.error('❌ Fix Question schema error:', error);
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
