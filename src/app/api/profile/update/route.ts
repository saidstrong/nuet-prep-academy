import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, bio, phone, whatsapp, avatar } = body;

    // Validate input
    if (!name || name.trim().length < 2) {
      return NextResponse.json(
        { error: 'Name must be at least 2 characters long' },
        { status: 400 }
      );
    }

    // Update user name
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: { name: name.trim() }
    });

    // Update or create profile
    const updatedProfile = await prisma.profile.upsert({
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
      message: 'Profile updated successfully',
      profile: {
        name: updatedUser.name,
        bio: updatedProfile.bio,
        phone: updatedProfile.phone,
        whatsapp: updatedProfile.whatsapp,
        avatar: updatedProfile.avatar
      }
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
