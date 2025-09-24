import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in' },
        { status: 401 }
      );
    }

    // Get user and profile data
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        profile: {
          select: {
            bio: true,
            phone: true,
            whatsapp: true,
            avatar: true
          }
        }
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      profile: {
        name: user.name,
        bio: user.profile?.bio || '',
        phone: user.profile?.phone || '',
        whatsapp: user.profile?.whatsapp || '',
        avatar: user.profile?.avatar || ''
      }
    });

  } catch (error: any) {
    console.error('Profile fetch error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch profile',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in' },
        { status: 401 }
      );
    }

    const { name, bio, phone, whatsapp, avatar } = await request.json();

    // Update user name
    if (name) {
      await prisma.user.update({
        where: { id: session.user.id },
        data: { name }
      });
    }

    // Update or create profile
    await prisma.profile.upsert({
      where: { userId: session.user.id },
      update: {
        bio: bio || null,
        phone: phone || null,
        whatsapp: whatsapp || null,
        avatar: avatar || null
      },
      create: {
        userId: session.user.id,
        bio: bio || null,
        phone: phone || null,
        whatsapp: whatsapp || null,
        avatar: avatar || null
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully'
    });

  } catch (error: any) {
    console.error('Profile update error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to update profile',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
