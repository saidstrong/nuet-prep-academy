import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { avatar } = await request.json();
    
    if (!avatar) {
      return NextResponse.json(
        { success: false, error: 'Avatar URL is required' },
        { status: 400 }
      );
    }

    // Update or create profile with avatar
    await prisma.profile.upsert({
      where: {
        userId: session.user.id
      },
      update: {
        avatar: avatar
      },
      create: {
        userId: session.user.id,
        avatar: avatar
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Avatar updated successfully',
      avatar: avatar
    });

  } catch (error: any) {
    console.error('Error updating avatar:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update avatar' },
      { status: 500 }
    );
  }
}