import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST() {
  try {
    // Check if user is authenticated and is admin
    const session = await getServerSession(authOptions);
    
    if (!session || !['OWNER', 'ADMIN'].includes(session.user.role)) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

    // Lazy import to prevent build-time issues
    const { prisma } = await import('@/lib/prisma');
    
    // Find ALL profiles with base64 avatars (regardless of size)
    const profiles = await prisma.profile.findMany({
      where: {
        avatar: {
          startsWith: 'data:'
        }
      },
      select: {
        id: true,
        userId: true,
        avatar: true
      }
    });

    let clearedCount = 0;
    
    // Clear ALL base64 avatars to prevent session size issues
    for (const profile of profiles) {
      if (profile.avatar && profile.avatar.startsWith('data:')) {
        await prisma.profile.update({
          where: { id: profile.id },
          data: { avatar: null }
        });
        clearedCount++;
      }
    }

    return NextResponse.json({
      success: true,
      message: `Cleared ${clearedCount} large avatars`,
      clearedCount,
      totalProfiles: profiles.length
    });

  } catch (error) {
    console.error('Error clearing large avatars:', error);
    return NextResponse.json(
      { 
        error: 'Failed to clear large avatars',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
