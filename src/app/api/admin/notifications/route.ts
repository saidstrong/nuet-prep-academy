import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    // Check authentication and admin role
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, message: 'Admin access required' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const isRead = searchParams.get('isRead');

    const where: any = {};
    if (type) where.type = type;
    if (isRead !== null) where.isRead = isRead === 'true';

    const notifications = await prisma.notification.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 50
    });

    return NextResponse.json({
      success: true,
      notifications
    });

  } catch (error: any) {
    console.error('Get notifications error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to fetch notifications',
        error: error.message
      },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    // Check authentication and admin role
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, message: 'Admin access required' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { notificationId, isRead, action } = body;

    if (!notificationId) {
      return NextResponse.json(
        { success: false, message: 'Notification ID is required' },
        { status: 400 }
      );
    }

    // Update notification
    const notification = await prisma.notification.update({
      where: { id: notificationId },
      data: {
        isRead: isRead !== undefined ? isRead : undefined,
        updatedAt: new Date()
      }
    });

    // Handle enrollment actions
    if (action && notification.type === 'ENROLLMENT_REQUEST') {
      const data = JSON.parse(notification.data || '{}');
      const enrollmentId = data.enrollmentId;

      if (enrollmentId) {
        if (action === 'approve') {
          await prisma.courseEnrollment.update({
            where: { id: enrollmentId },
            data: { status: 'ACTIVE' }
          });
        } else if (action === 'reject') {
          await prisma.courseEnrollment.update({
            where: { id: enrollmentId },
            data: { status: 'CANCELLED' }
          });
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Notification updated successfully',
      notification
    });

  } catch (error: any) {
    console.error('Update notification error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to update notification',
        error: error.message
      },
      { status: 500 }
    );
  }
}
