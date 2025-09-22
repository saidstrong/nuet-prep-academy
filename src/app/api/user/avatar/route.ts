import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    console.log('🔍 Avatar API called');
    const session = await getServerSession(authOptions);
    console.log('🔍 Session:', session ? 'exists' : 'null');
    console.log('🔍 User:', session?.user ? `${session.user.name} (${session.user.role})` : 'null');
    
    if (!session) {
      console.log('❌ No session found');
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    try {
      // Try to get user profile with avatar from database
      const profile = await prisma.profile.findUnique({
        where: {
          userId: session.user.id
        },
        select: {
          avatar: true
        }
      });

      console.log(`✅ Avatar fetched for user ${session.user.id}:`, profile?.avatar || 'null');
      return NextResponse.json({
        success: true,
        avatar: profile?.avatar || null
      });

    } catch (dbError: any) {
      console.log('❌ Database error fetching avatar, using fallback:', dbError.message);
      
      // Fallback: return null avatar (no avatar)
      return NextResponse.json({
        success: true,
        avatar: null
      });
    }

  } catch (error: any) {
    console.error('Error fetching user avatar:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch avatar' },
      { status: 500 }
    );
  }
}
