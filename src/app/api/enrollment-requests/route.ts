import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET - Fetch enrollment requests (Admin/Manager only)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !['ADMIN', 'MANAGER', 'OWNER'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const courseId = searchParams.get('courseId');

    const whereClause: any = {};
    if (status) whereClause.status = status;
    if (courseId) whereClause.courseId = courseId;

    const requests = await prisma.enrollmentRequest.findMany({
      where: whereClause,
      include: {
        course: {
          select: {
            id: true,
            title: true,
            price: true,
            instructor: true
          }
        },
        student: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({ requests });
  } catch (error) {
    console.error('Error fetching enrollment requests:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Create enrollment request
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      courseId, 
      studentName, 
      studentEmail, 
      studentPhone, 
      whatsappNumber, 
      telegramUsername, 
      preferredContact, 
      message 
    } = body;

    // Validate required fields
    if (!courseId || !studentName || !studentEmail || !studentPhone || !preferredContact) {
      return NextResponse.json({ 
        error: 'Missing required fields: courseId, studentName, studentEmail, studentPhone, preferredContact' 
      }, { status: 400 });
    }

    // Check if course exists
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: { id: true, title: true, price: true }
    });

    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    // Check if student already has a pending request for this course
    const existingRequest = await prisma.enrollmentRequest.findFirst({
      where: {
        courseId,
        studentEmail,
        status: 'PENDING'
      }
    });

    if (existingRequest) {
      return NextResponse.json({ 
        error: 'You already have a pending enrollment request for this course' 
      }, { status: 400 });
    }

    // Create enrollment request
    const enrollmentRequest = await prisma.enrollmentRequest.create({
      data: {
        courseId,
        studentName,
        studentEmail,
        studentPhone,
        whatsappNumber: whatsappNumber || null,
        telegramUsername: telegramUsername || null,
        preferredContact,
        message: message || null,
        status: 'PENDING'
      },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            price: true,
            instructor: true
          }
        }
      }
    });

    return NextResponse.json({ 
      success: true, 
      enrollmentRequest,
      message: 'Enrollment request submitted successfully. Our managers will contact you soon.' 
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating enrollment request:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
