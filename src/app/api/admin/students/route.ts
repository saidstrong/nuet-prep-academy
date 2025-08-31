import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET() {
  try {
    // Check if user is authenticated and is admin
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

    // Lazy import to prevent build-time issues
    const { prisma } = await import('@/lib/prisma');
    
    // Fetch all students with their course enrollments
    const students = await prisma.user.findMany({
      where: {
        role: 'STUDENT'
      },
      include: {
        enrollments: {
          where: {
            status: 'ACTIVE'
          },
          include: {
            course: {
              select: {
                id: true,
                title: true,
                price: true
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
        }
      },
      orderBy: {
        name: 'asc'
      }
    });

    // Transform the data for the dashboard
    const transformedStudents = students.map(student => {
      // Get unique enrolled courses
      const enrolledCourses = [...new Set(student.enrollments.map(enrollment => enrollment.course.id))];
      
      // Count total enrollments
      const totalEnrollments = student.enrollments.length;
      
      // Get course details
      const courseDetails = student.enrollments.map(enrollment => ({
        courseId: enrollment.course.id,
        courseTitle: enrollment.course.title,
        coursePrice: enrollment.course.price,
        tutorId: enrollment.tutor.id,
        tutorName: enrollment.tutor.name,
        tutorEmail: enrollment.tutor.email,
        enrollmentDate: enrollment.enrolledAt
      }));

      return {
        id: student.id,
        name: student.name,
        email: student.email,
        role: student.role,
        enrolledCourses: enrolledCourses,
        totalEnrollments,
        courseDetails,
        createdAt: student.createdAt,
        updatedAt: student.updatedAt
      };
    });

    return NextResponse.json({
      success: true,
      students: transformedStudents,
      total: transformedStudents.length
    });

  } catch (error) {
    console.error('Error fetching admin students:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch students',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, email, password, bio, phone, whatsapp, experience } = body;

    if (!name || !email || !password) {
      return NextResponse.json({
        success: false,
        message: 'Missing required fields',
      }, { status: 400 });
    }

    const { prisma } = await import('@/lib/prisma');

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json({
        success: false,
        message: 'User with this email already exists',
      }, { status: 400 });
    }

    // Hash password
    const bcrypt = await import('bcryptjs');
    const hashedPassword = await bcrypt.hash(password, 12);

    const student = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: 'STUDENT',
        profile: {
          create: {
            bio: bio || '',
            phone: phone || '',
            whatsapp: whatsapp || '',
            experience: experience || '',
          },
        },
      },
      include: {
        profile: true,
      },
    });

    // Remove password from response
    const { password: _, ...studentWithoutPassword } = student;

    return NextResponse.json({
      success: true,
      message: 'Student created successfully',
      student: studentWithoutPassword,
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating student:', error);
    return NextResponse.json({
      success: false,
      message: 'An error occurred while creating the student',
    }, { status: 500 });
  }
}
