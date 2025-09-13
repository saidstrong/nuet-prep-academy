import { NextResponse } from 'next/server';

export async function GET() {
  try {
    console.log('🔧 Fixing UserRole enum to include OWNER...');
    
    // Lazy import to prevent build-time issues
    const { prisma } = await import('@/lib/prisma');
    
    // Add OWNER to the UserRole enum
    await prisma.$executeRaw`
      ALTER TYPE "UserRole" ADD VALUE IF NOT EXISTS 'OWNER';
    `;
    
    console.log('✅ UserRole enum updated successfully');
    
    return NextResponse.json({
      success: true,
      message: 'UserRole enum updated successfully - OWNER value added'
    });

  } catch (error) {
    console.error('❌ Error updating UserRole enum:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to update UserRole enum',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
