import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !['ADMIN', 'OWNER', 'MANAGER'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { action, userIds } = body;

    if (!action || !userIds || !Array.isArray(userIds)) {
      return NextResponse.json(
        { error: 'Invalid request data' },
        { status: 400 }
      );
    }

    let result;

    switch (action) {
      case 'delete':
        result = await prisma.user.deleteMany({
          where: {
            id: { in: userIds }
          }
        });
        break;

      case 'activate':
        result = await prisma.user.updateMany({
          where: {
            id: { in: userIds }
          },
          data: {
            isActive: true
          }
        });
        break;

      case 'deactivate':
        result = await prisma.user.updateMany({
          where: {
            id: { in: userIds }
          },
          data: {
            isActive: false
          }
        });
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      message: `Successfully ${action}d ${result.count} users`,
      count: result.count
    });

  } catch (error) {
    console.error('Error performing bulk action:', error);
    return NextResponse.json(
      { error: 'Failed to perform bulk action' },
      { status: 500 }
    );
  }
}
