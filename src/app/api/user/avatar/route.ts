import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user profile with avatar
    const profile = await prisma.profile.findUnique({
      where: {
        userId: session.user.id
      },
      select: {
        avatar: true
      }
    });

    return NextResponse.json({
      success: true,
      avatar: profile?.avatar || null
    });

  } catch (error: any) {
    console.error('Error fetching user avatar:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch avatar' },
      { status: 500 }
    );
  }
}