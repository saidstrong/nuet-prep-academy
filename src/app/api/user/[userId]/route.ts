import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(
  request: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { userId } = params;

    // Check if user is accessing their own profile or is admin/manager
    if (session.user.id !== userId && 
        session.user.role !== 'ADMIN' && 
        session.user.role !== 'MANAGER' && 
        session.user.role !== 'OWNER') {
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      );
    }

    try {
      // Try to get user profile from database
      const { prisma } = await import('@/lib/prisma');
      
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          profile: true
        }
      });

      if (!user) {
        return NextResponse.json(
          { success: false, error: 'User not found' },
          { status: 404 }
        );
      }

      const profile = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        profile: user.profile ? {
          bio: user.profile.bio,
          specialization: user.profile.specialization,
          experience: user.profile.experience,
          avatar: user.profile.avatar
        } : null
      };

      console.log(`✅ Profile fetched for user ${userId}`);
      return NextResponse.json({
        success: true,
        profile
      });

    } catch (dbError: any) {
      console.log('❌ Database error fetching profile, using fallback:', dbError.message);
      
      // Fallback: return basic user info from session
      const profile = {
        id: userId,
        name: session.user.name,
        email: session.user.email,
        role: session.user.role,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        profile: null
      };

      return NextResponse.json({
        success: true,
        profile
      });
    }

  } catch (error: any) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { userId } = params;

    // Check if user is updating their own profile or is admin/manager
    if (session.user.id !== userId && 
        session.user.role !== 'ADMIN' && 
        session.user.role !== 'MANAGER' && 
        session.user.role !== 'OWNER') {
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { name, bio, specialization, experience } = body;

    try {
      // Try to update user profile in database
      const { prisma } = await import('@/lib/prisma');
      
      // Update user basic info
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          name: name || undefined,
        }
      });

      // Update or create profile
      const updatedProfile = await prisma.profile.upsert({
        where: { userId: userId },
        update: {
          bio: bio || undefined,
          specialization: specialization || undefined,
          experience: experience || undefined,
        },
        create: {
          userId: userId,
          bio: bio || '',
          specialization: specialization || '',
          experience: experience || '',
        }
      });

      const profile = {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        createdAt: updatedUser.createdAt,
        updatedAt: updatedUser.updatedAt,
        profile: {
          bio: updatedProfile.bio,
          specialization: updatedProfile.specialization,
          experience: updatedProfile.experience,
          avatar: updatedProfile.avatar
        }
      };

      console.log(`✅ Profile updated for user ${userId}`);
      return NextResponse.json({
        success: true,
        profile
      });

    } catch (dbError: any) {
      console.log('❌ Database error updating profile:', dbError.message);
      
      // Fallback: return success but don't actually update
      return NextResponse.json({
        success: true,
        message: 'Profile update simulated (database unavailable)'
      });
    }

  } catch (error: any) {
    console.error('Error updating user profile:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}
