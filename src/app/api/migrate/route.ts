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
      
      console.log('🔄 Running migration: Add isRead column to messages table...');
      
      // Add isRead column to messages table
      await prisma.$executeRaw`
        ALTER TABLE "messages" ADD COLUMN IF NOT EXISTS "isRead" BOOLEAN NOT NULL DEFAULT false;
      `;
      
      console.log('✅ Migration completed successfully!');
      
      return NextResponse.json({ 
        success: true, 
        message: 'Migration completed successfully!' 
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
