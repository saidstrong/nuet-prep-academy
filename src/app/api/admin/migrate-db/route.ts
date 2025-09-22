import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized - Admin access required' }, { status: 401 });
    }

    try {
      const { prisma } = await import('@/lib/prisma');
      
      console.log('🔄 Running database migration...');
      
      // Check if isRead column exists
      const tableInfo = await prisma.$queryRaw`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'messages' AND column_name = 'isRead';
      `;
      
      if (Array.isArray(tableInfo) && tableInfo.length === 0) {
        console.log('📝 Adding isRead column to messages table...');
        
        // Add isRead column to messages table
        await prisma.$executeRaw`
          ALTER TABLE "messages" ADD COLUMN "isRead" BOOLEAN NOT NULL DEFAULT false;
        `;
        
        console.log('✅ isRead column added successfully!');
      } else {
        console.log('✅ isRead column already exists!');
      }
      
      return NextResponse.json({ 
        success: true, 
        message: 'Database migration completed successfully!' 
      });

    } catch (dbError: any) {
      console.log('❌ Migration error:', dbError.message);
      return NextResponse.json({ 
        success: false, 
        error: 'Migration failed: ' + dbError.message 
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Error running migration:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
