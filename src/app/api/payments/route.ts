import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { enrollmentId, paymentMethod, amount } = body;

    if (!enrollmentId || !paymentMethod || !amount) {
      return NextResponse.json({
        success: false,
        message: 'Missing required fields',
      }, { status: 400 });
    }

    const { prisma } = await import('@/lib/prisma');

    // Get enrollment details
    const enrollment = await prisma.courseEnrollment.findUnique({
      where: { id: enrollmentId },
      include: {
        course: true,
        student: true,
        tutor: true,
      },
    });

    if (!enrollment) {
      return NextResponse.json({
        success: false,
        message: 'Enrollment not found',
      }, { status: 404 });
    }

    if (enrollment.studentId !== session.user.id) {
      return NextResponse.json({
        success: false,
        message: 'Unauthorized to pay for this enrollment',
      }, { status: 403 });
    }

    if (enrollment.paymentStatus === 'PAID') {
      return NextResponse.json({
        success: false,
        message: 'Payment already completed',
      }, { status: 400 });
    }

    // Create payment record
    const payment = await prisma.payment.create({
      data: {
        enrollmentId,
        courseId: enrollment.course.id,
        amount: parseFloat(amount),
        method: paymentMethod,
        status: 'PENDING',
        studentId: session.user.id,
      },
    });

    // For Kaspi integration, you would typically:
    // 1. Create a payment session with Kaspi
    // 2. Redirect user to Kaspi payment page
    // 3. Handle webhook callback for payment confirmation

    // For now, we'll simulate a successful payment
    // In production, this would be handled by Kaspi webhook
    if (paymentMethod === 'KASPI') {
      // Simulate Kaspi payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Update payment status
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: 'PAID' },
      });

      // Update enrollment payment status
      await prisma.courseEnrollment.update({
        where: { id: enrollmentId },
        data: { paymentStatus: 'PAID' },
      });

      return NextResponse.json({
        success: true,
        message: 'Payment completed successfully',
        payment: {
          id: payment.id,
          status: 'PAID',
          amount: payment.amount,
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Payment initiated',
      payment: {
        id: payment.id,
        status: payment.status,
        amount: payment.amount,
      },
    });

  } catch (error) {
    console.error('Error processing payment:', error);
    return NextResponse.json({
      success: false,
      message: 'An error occurred while processing payment',
    }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const enrollmentId = searchParams.get('enrollmentId');

    if (!enrollmentId) {
      return NextResponse.json({
        success: false,
        message: 'Enrollment ID is required',
      }, { status: 400 });
    }

    const { prisma } = await import('@/lib/prisma');

    const payments = await prisma.payment.findMany({
      where: {
        enrollmentId,
        studentId: session.user.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({
      success: true,
      payments,
    });

  } catch (error) {
    console.error('Error fetching payments:', error);
    return NextResponse.json({
      success: false,
      message: 'An error occurred while fetching payments',
    }, { status: 500 });
  }
}
