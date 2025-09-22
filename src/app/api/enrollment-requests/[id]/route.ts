import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// PUT - Update enrollment request status (Admin/Manager only)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !['ADMIN', 'MANAGER', 'OWNER'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { status, adminNotes } = body;

    if (!status || !['PENDING', 'APPROVED', 'REJECTED', 'CONTACTED'].includes(status)) {
      return NextResponse.json({ 
        error: 'Invalid status. Must be PENDING, APPROVED, REJECTED, or CONTACTED' 
      }, { status: 400 });
    }

    const enrollmentRequest = await prisma.enrollmentRequest.findUnique({
      where: { id: params.id },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            price: true
          }
        },
        student: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        tutor: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    if (!enrollmentRequest) {
      return NextResponse.json({ error: 'Enrollment request not found' }, { status: 404 });
    }

    const updatedRequest = await prisma.enrollmentRequest.update({
      where: { id: params.id },
      data: {
        status,
        adminNotes: adminNotes || null
      },
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
      }
    });

    // If approved, create enrollment
    if (status === 'APPROVED' && enrollmentRequest.student) {
      try {
        // First, find or create the student user
        let studentUser = await prisma.user.findUnique({
          where: { email: enrollmentRequest.studentEmail }
        });

        if (!studentUser) {
          // Create student user if doesn't exist
          studentUser = await prisma.user.create({
            data: {
              name: enrollmentRequest.studentName,
              email: enrollmentRequest.studentEmail,
              role: 'STUDENT',
              phone: enrollmentRequest.studentPhone,
              whatsapp: enrollmentRequest.whatsappNumber,
              telegram: enrollmentRequest.telegramUsername
            }
          });
        }

        // Create enrollment with selected tutor or default instructor
        const tutorId = enrollmentRequest.tutor?.id || enrollmentRequest.course.instructor;
        
        await prisma.courseEnrollment.create({
          data: {
            courseId: enrollmentRequest.courseId,
            studentId: studentUser.id,
            tutorId: tutorId,
            status: 'ACTIVE',
            paymentStatus: 'PAID',
            paymentMethod: 'CONTACT_MANAGER'
          }
        });
      } catch (enrollmentError) {
        console.error('Error creating enrollment:', enrollmentError);
        // Don't fail the request update if enrollment creation fails
      }
    }

    return NextResponse.json({ 
      success: true, 
      enrollmentRequest: updatedRequest,
      message: `Enrollment request ${status.toLowerCase()} successfully` 
    });

  } catch (error) {
    console.error('Error updating enrollment request:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Delete enrollment request (Admin/Manager only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !['ADMIN', 'MANAGER', 'OWNER'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const enrollmentRequest = await prisma.enrollmentRequest.findUnique({
      where: { id: params.id }
    });

    if (!enrollmentRequest) {
      return NextResponse.json({ error: 'Enrollment request not found' }, { status: 404 });
    }

    await prisma.enrollmentRequest.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Enrollment request deleted successfully' 
    });

  } catch (error) {
    console.error('Error deleting enrollment request:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
