import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !['OWNER', 'ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { isActive } = await request.json();

    if (typeof isActive !== 'boolean') {
      return NextResponse.json({ error: 'isActive must be a boolean' }, { status: 400 });
    }

    const challenge = await prisma.challenge.update({
      where: { id: params.id },
      data: {
        isActive,
        updatedAt: new Date()
      }
    });

    return NextResponse.json({ 
      success: true, 
      challenge,
      message: `Challenge ${isActive ? 'activated' : 'deactivated'} successfully`
    });
  } catch (error: any) {
    console.error('Error toggling challenge status:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to toggle challenge status' },
      { status: 400 }
    );
  }
}
